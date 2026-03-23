import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';


interface FrontendStackProps extends cdk.StackProps {
  domainName: string
}

export class PhotoBucketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, { domainName, ...props }: FrontendStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'UploadBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedOrigins: ['http://localhost:5173', `https://${domainName}`],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
    });

    const identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: true,
    });

    // Create an IAM role for unauthenticated users
    const unauthenticatedRole = new iam.Role(this, 'CognitoDefaultUnauthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          'StringEquals': { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    // Grant permissions to the role
    bucket.grantPut(unauthenticatedRole);
    unauthenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:PutObject', 's3:PutObjectAcl'],
        resources: [`${bucket.bucketArn}/*`],
      }),
    );

    // Add a bucket policy to allow the IAM role to put objects
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:GetObject', 's3:PutObjectAcl'],
        resources: [`${bucket.bucketArn}/*`],
        principals: [new iam.ArnPrincipal(unauthenticatedRole.roleArn)],
      }),
    );

    bucket.grantPut(unauthenticatedRole);
    unauthenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:PutObject', 's3:PutObjectAcl'],
        resources: [`${bucket.bucketArn}/*`],
      }),
    );

    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        unauthenticated: unauthenticatedRole.roleArn,
      },
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref,
    });
  }
}