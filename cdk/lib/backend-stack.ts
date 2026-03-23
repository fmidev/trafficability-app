import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import * as dotenv from 'dotenv';
import path = require("path");

dotenv.config();

interface BackendStackProps extends cdk.StackProps {
  domainName: string;
}

export class BackendStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    { domainName, ...props }: BackendStackProps
  ) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: domainName,
    });

    const vpc = new ec2.Vpc(this, "VPC", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      enableDnsSupport: true,
    });

    const table = new dynamodb.Table(this, 'MyTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: 'MaastonkulkukelpoisuusTable',
    });

    const ecsTaskRole = new iam.Role(this, 'ECSTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    ecsTaskRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));

    const image = new ecrAssets.DockerImageAsset(this, "Image", {
      directory: path.join(__dirname, "../../backend"),
    });

    const cluster = new ecs.Cluster(this, "NewCluster", { vpc });

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      "Service",
      {
        cluster,
        cpu: 1024,
        desiredCount: 1,
        domainName: `api.${domainName}`,
        domainZone: hostedZone,
        memoryLimitMiB: 2048,
        protocol: elbv2.ApplicationProtocol.HTTPS,
        publicLoadBalancer: true,
        redirectHTTP: true,
        taskImageOptions: {
          //image: ecs.ContainerImage.fromEcrRepository(image),
          image: ecs.ContainerImage.fromDockerImageAsset(image),
          containerPort: 3000,
          environment: {
            VITE_BACKEND_API_URL: `https://api.${domainName}`,
            NODE_ENV: process.env.NODE_ENV || "production",
            FRONTEND_URL: process.env.FRONTEND_URL || "https://maastonkulkukelpoisuus-dev.fi",
            DYNAMODB_TABLE_NAME: table.tableName,
            AWS_REGION: this.region,
          },
          taskRole: ecsTaskRole,
        },
      }
    );

    service.taskDefinition.addToTaskRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject', 
        's3:PutObject', 
        'dynamodb:PutItem',
        'dynamodb:GetItem',
        'dynamodb:Scan',
        'dynamodb:Query',],
      resources: ['*'],
    }))

    service.targetGroup.configureHealthCheck({
      path: '/health',
      port: '3000',
      protocol: elbv2.Protocol.HTTP,
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
    });

  }
}
