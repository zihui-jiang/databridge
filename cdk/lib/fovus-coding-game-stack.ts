import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_dynamodb as dynamodb, aws_ec2} from 'aws-cdk-lib';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Function, Runtime, Code, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

import {  HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpApi, HttpMethod, HttpStage } from 'aws-cdk-lib/aws-apigatewayv2'
import * as path from 'path';
import { S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';



export class FovusCodingGameStack extends cdk.Stack {
  private readonly bukcetName = "emma-jiang-fovus-coding-game-file-storage-bucket";
  private readonly bukcetPath = this.bukcetName + ".s3.us-west-2.amazonaws.com";
  private readonly bukcetReigion = "us-west-2";
  private readonly TABLE_NAME = "FovusCodingGameStack-UploadedFile";
  private readonly LAMBDA_PATH = path.resolve(__dirname, '../../lambda/');
  private readonly FRONT_END_ASSET_PATH = "../frontend/build";
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    /************/
    /*    EC2   */
    /************/
    const vpc = new aws_ec2.Vpc(this, 'MyVpc', {
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: aws_ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private-subnet',
          subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
    const securityGroup = new aws_ec2.SecurityGroup(this, 'sg', {
      vpc: vpc,
      
  });

    const ec2Instance = new aws_ec2.Instance(this,'TiggerInstance', {
      instanceType: aws_ec2.InstanceType.of(aws_ec2.InstanceClass.T3, aws_ec2.InstanceSize.MICRO),
      machineImage: new aws_ec2.AmazonLinuxImage(),
      vpcSubnets: { subnetType: aws_ec2.SubnetType.PUBLIC },
      vpc: vpc,
      securityGroup: securityGroup,
      associatePublicIpAddress: true,
      keyName:'emma'
  })

    ec2Instance.userData.addCommands(
      `mkdir this_is_a_test`
    );
    /************/
    /*  LAMBDA  */
    /************/
    const requestProcessor = new Function(this, 'requestProcessor', {
      functionName: 'RequestProcessorLambda',
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handleUpload',
      code: Code.fromAsset(this.LAMBDA_PATH),
    });
    requestProcessor.addEnvironment("BUCKET_NAME", this.bukcetName);
    requestProcessor.addEnvironment("TABLE_NAME", this.TABLE_NAME);

    // Lambda function to generate pre-signed URLs
    const presignedProcessor = new Function(this, 'presignedProcessor', {
      functionName: 'PresignedProcessorLambda',
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handleGetPreSignedURL', 
      code: Code.fromAsset(this.LAMBDA_PATH),
    });
    presignedProcessor.addEnvironment("BUCKET_NAME", this.bukcetName);
    presignedProcessor.addEnvironment("BUCKET_REGION", this.bukcetReigion);

    const eventTrigger = new Function(this, 'triggerProcessor', {
      functionName: 'TableStreamHandler',
      code: Code.fromAsset(this.LAMBDA_PATH),
      handler: 'index.triggerByEvent',
      runtime: Runtime.NODEJS_20_X,
    });

    eventTrigger.addEnvironment("INSTANCE_ID", ec2Instance.instanceId);
    eventTrigger.addEnvironment("BUCKET_PATH", this.bukcetPath);

    /************/
    /*  APIGW   */
    /************/
    const requestProcessorIntegration = new HttpLambdaIntegration('fileUpload', requestProcessor);
    const fileUploadAPI = new HttpApi(this, 'fileUpload', {
      apiName: `FileUploadAPI`,
      createDefaultStage: true,
    });
    new HttpStage(this, 'fileUploadStage', {
      httpApi: fileUploadAPI,
      stageName: 'beta',
    });
    fileUploadAPI.addRoutes({
      path: '/fileUpload',
      methods: [ HttpMethod.POST ],
      integration: requestProcessorIntegration,
    });

    
    // presignedAPI intergration
    const presignedProcessorIntegration = new HttpLambdaIntegration('PresignedUrl', presignedProcessor);
    const presignedUrlAPI = new HttpApi(this, 'presignedUrl', {
      apiName: `PresignedUrlAPI`,
      createDefaultStage: true,
    });
    new HttpStage(this, 'preSignedUrlStage', {
      httpApi: presignedUrlAPI,
      stageName: 'beta',
    });
    presignedUrlAPI.addRoutes({
      path: '/presignedUrl',
      methods: [ HttpMethod.GET ],
      integration: presignedProcessorIntegration,
    });
    
    /************/
    /*    S3    */
    /************/
    const fileStorageBucket = new s3.Bucket(this, 'file-storage-bucket', {
      bucketName: this.bukcetName,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL // block public access
    })

    // // Deploy  script to the S3 bucket
    // new s3deploy.BucketDeployment(this, 'DeployScript', {
    //   sources: [s3deploy.Source.asset('../cdk/script.sh')], // Update with your local script file path
    //   destinationBucket: fileStorageBucket
    // });


    // Deploy the built React app to the S3 bucket
    new BucketDeployment(this, 'ReactAppDeployment', {
      sources: [Source.asset(this.FRONT_END_ASSET_PATH)], 
      destinationBucket: fileStorageBucket,
      destinationKeyPrefix: 'web', // Optional: specify a prefix for the uploaded files in the bucket
    });



    /************/
    /* DynamoDB */
    /************/
    const table = new dynamodb.Table(this, 'UploadedFile', {
      tableName: this.TABLE_NAME,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    eventTrigger.addEventSource(new DynamoEventSource(table, {
      startingPosition: StartingPosition.LATEST,
    }));
    
  }
}
