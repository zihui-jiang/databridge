import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_dynamodb as dynamodb} from 'aws-cdk-lib';
import { Function, Runtime, Code, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

import {  HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpApi, HttpMethod, HttpStage } from 'aws-cdk-lib/aws-apigatewayv2'
import * as path from 'path';



export class FovusCodingGameStack extends cdk.Stack {
  private readonly bukcetName = "emma-jiang-fovus-coding-game-file-storage-bucket";
  private readonly bukcetReigion = "us-west-2";
  private readonly TABLE_NAME = "FovusCodingGameStack-UploadedFile";
  private readonly LAMBDA_PATH = path.resolve(__dirname, '../../lambda/');
  private readonly FRONT_END_ASSET_PATH = "../frontend/build";
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
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

    // const bucket = new s3.Bucket(this, 'ReactAppBucket', {
    //   publicReadAccess: true, // Allow public read access to the files
    //   removalPolicy: cdk.RemovalPolicy.DESTROY, // Clean up bucket when stack is deleted (for demo purposes)
    //   websiteIndexDocument: 'index.html', // Specify the index document for the website
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
