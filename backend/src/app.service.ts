import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import * as mimeTypes from 'mime-types';
//import { Cron } from '@nestjs/schedule';
import { AppDto } from './app.dto';
import { Answer, isAnswer } from './app.interface';
import { MailerService } from './app.mailer.service';

@Injectable()
export class AppService {
  private readonly s3Client: S3Client;
  private readonly URL_EXPIRATION_SECONDS = 60 * 2;
  private readonly dynamoDBClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {
    const awsRegion = this.configService.get<string>('AWS_REGION');
    this.s3Client = new S3Client({
      region: awsRegion,
    });
    const client = new DynamoDBClient({
      region: awsRegion,
    });
    this.dynamoDBClient = DynamoDBDocumentClient.from(client);
    this.tableName = this.configService.get<string>('DYNAMODB_TABLE_NAME');
    // this.sendMonthlyEmail();
  }

  async scanDynamoDBTable(sancParams: ScanCommandInput) {
    const items = [];
    let lastEvaluatedKey: { [key: string]: any } | undefined = undefined;

    do {
      const params = {
        ...sancParams,
        ExclusiveStartKey: lastEvaluatedKey,
      };
      const result: ScanCommandOutput = await this.dynamoDBClient.send(
        new ScanCommand(params),
      );
      items.push(...(result.Items || []));
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return items;
  }

  @Cron('0 0 1 * *') // Runs at midnight on the first day of every month
  async sendMonthlyEmail() {
    const scanParams = {
      TableName: this.tableName,
    };

    try {
      const allAnswers = await this.scanDynamoDBTable(scanParams);
      const filteredAnswers = (allAnswers || []).filter(isAnswer);
      const to = 'tuomo.smolander@fmi.fi';
      const subject = 'Monthly Update for Maastokulkukelpoisuus';
      const body = JSON.stringify(filteredAnswers);
      const text = `Number of answers: ${filteredAnswers.length}\n${body}`;

      await this.mailerService.sendMail(to, subject, text);
    } catch (err) {
      console.error(err, 'Error from server');
      throw new InternalServerErrorException('Could not fetch answers');
    }
  }
  async getAnswers(): Promise<Answer[]> {
    try {
      return [];
    } catch (err) {
      console.error(err, 'Error from server');
      throw new InternalServerErrorException('Could not fetch answers');
    }
  }

  async getPresignedUrl(
    fileName: string,
    contentType: string,
  ): Promise<{ uploadURL: string; Key: string; uuid: string }> {
    // toss out the user-supplied file name in favour of a unique identifier
    // enriched with a file extension based on the provided contentType parameter
    const uuid = uuidv4();
    const Key = `${uuid}.${mimeTypes.extension(contentType)}`;
    try {
      const photoBucket = this.configService.get<string>('AWS_PHOTO_BUCKET');
      if (!photoBucket) {
        throw new Error('Bucket name is not defined in the configuration');
      }

      const command = new PutObjectCommand({
        Bucket: photoBucket,
        Key,
        ContentType: contentType,
      });

      const uploadURL = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.URL_EXPIRATION_SECONDS,
      });

      return {
        uploadURL,
        Key,
        uuid,
      };
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw new InternalServerErrorException(
        'Could not generate pre-signed URL',
      );
    }
  }

  async postAnswers(
    appDto: AppDto,
  ): Promise<{ statusCode: number; message: string; data: AppDto }> {
    try {
      const answersData = {
        ...appDto,
        createdAt: new Date().toISOString(),
      };
      const params = {
        TableName: this.tableName,
        Item: answersData,
      };
      await this.dynamoDBClient.send(new PutCommand(params));

      const answerBucket = this.configService.get<string>('AWS_ANSWER_BUCKET');

      const scanParams = {
        TableName: this.tableName,
      };
      const allAnswers = await this.scanDynamoDBTable(scanParams);
      const filteredAnswers = (allAnswers || [])
        .filter(isAnswer)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((answer) => {
          return {
            id: answer.id,
            createdAt: answer.createdAt,
            geoLocation: answer.geoLocation,
            geoLocationAccuracy: answer.geoLocationAccuracy,
            userGeoLocation: answer.userGeoLocation,
            file: answer.file,
            fileDateTime: answer.fileDateTime,
            fileGeoLocation: answer.fileGeoLocation,
            answer: answer.answer,
            certainty: answer.certainty,
            contestantName: answer.contestantName,
          };
        });

      const currentDateTime = new Date().getTime();
      const objectKey = `answer-${currentDateTime}.json`;

      const s3Params = {
        Bucket: answerBucket,
        Key: objectKey,
        Body: JSON.stringify(filteredAnswers),
        ContentType: 'application/json',
      };
      try {
        await this.s3Client.send(new PutObjectCommand(s3Params));
      } catch (error) {
        console.error('Error saving data to S3:', error);
        throw new InternalServerErrorException('Could not save answers');
      }

      return {
        statusCode: 200,
        message: 'Answers saved successfully',
        data: answersData,
      };
    } catch (error) {
      console.error('Error saving data to DynamoDB:', error);
      throw new InternalServerErrorException('Could not save answers');
    }
  }
}
