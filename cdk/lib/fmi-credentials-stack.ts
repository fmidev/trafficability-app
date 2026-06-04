import * as cdk from "aws-cdk-lib";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as dotenv from 'dotenv';
import path = require("path");

dotenv.config();

interface FMICredentialsStackProps extends cdk.StackProps {
  answersBucket: s3.IBucket;
  photoBucket: s3.IBucket;
}

export class FMICredentialsStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    { answersBucket, photoBucket, ...props }: FMICredentialsStackProps
  ) {
    super(scope, id, props);

    const user = new iam.User(this, 'FMICredentialsUser');

    answersBucket.grantRead(user);
    photoBucket.grantRead(user);


  }
}