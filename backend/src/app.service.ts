import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as mimeTypes from 'mime-types';
import { AppDto } from './app.dto';
import { Answer } from './app.interface';

@Injectable()
export class AppService {
  private readonly s3Client: S3Client;
  private readonly URL_EXPIRATION_SECONDS = 60 * 2;

  constructor(private configService: ConfigService) {
    const awsRegion = this.configService.get<string>('AWS_REGION');
    const s3Endpoint = this.configService.get<string>('S3_ENDPOINT');
    this.s3Client = new S3Client({
      region: awsRegion,
      endpoint: s3Endpoint,
    });
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
    const imagePrefix = this.configService.get<string>(
      'RESPONSE_S3_IMAGE_PREFIX',
    );
    if (!imagePrefix?.trim()) {
      throw new Error('Image prefix is not defined in the configuration');
    }

    const Key = `${imagePrefix.trim()}/${uuid}.${mimeTypes.extension(contentType)}`;
    try {
      const photoBucket = this.configService.get<string>('RESPONSE_S3_BUCKET');
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
      const answerData = {
        ...appDto,
        createdAt: new Date().toISOString(),
      };

      const answerBucket = this.configService.get<string>('RESPONSE_S3_BUCKET');
      const answerPrefix = this.configService.get<string>(
        'RESPONSE_S3_ANSWER_PREFIX',
      );

      if (!answerBucket?.trim()) {
        throw new Error('Bucket name is not defined in the configuration');
      }

      if (!answerPrefix?.trim()) {
        throw new Error('Answer prefix is not defined in the configuration');
      }

      const currentDateTime = new Date().getTime();
      const objectKey = `${answerPrefix}/answer-${currentDateTime}.json`;

      const s3Params = {
        Bucket: answerBucket,
        Key: objectKey,
        Body: JSON.stringify(answerData),
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
        data: answerData,
      };
    } catch (error) {
      console.error('Error saving data to DynamoDB:', error);
      throw new InternalServerErrorException('Could not save answers');
    }
  }
}
