import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';


interface AnswersStackProps extends cdk.StackProps {
  domainName: string;
}

export class AnswersStack extends cdk.Stack {
  bucket: s3.Bucket

  constructor(scope: Construct, id: string, { domainName, ...props}: AnswersStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'AnswersBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedOrigins: ['http://localhost:5173', `https://${domainName}`],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
    });

    this.bucket = bucket;

    new cdk.CfnOutput(this, 'AnswersBucketOutput', { 
      value: bucket.bucketName
    });
  }
}