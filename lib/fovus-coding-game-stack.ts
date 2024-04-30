import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_dynamodb as dynamodb} from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'

import {  HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpApi, HttpMethod, HttpStage } from 'aws-cdk-lib/aws-apigatewayv2'



export class FovusCodingGameStack extends cdk.Stack {
  private bukcetName = "emma-jiang-fovus-coding-game-file-storage-bucket";
  private bukcetReigion = "us-west-2";
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    /************/
    /*  LAMBDA  */
    /************/
    const requestProcessor = new Function(this, 'requestProcessor', {
      functionName: 'RequestProcessorLambda',
      runtime: Runtime.NODEJS_20_X,
      handler: 'request-process.handler',
      code: Code.fromAsset('lib/lambda'),
    });
    requestProcessor.addEnvironment("BUCKET_NAME", this.bukcetName);

    // Lambda function to generate pre-signed URLs
    const presignedProcessor = new Function(this, 'presignedProcessor', {
      functionName: 'PresignedProcessorLambda',
      runtime: Runtime.NODEJS_20_X,
      handler: 'presigned-process.handler', 
      code: Code.fromAsset('lib/lambda'),
    });
    presignedProcessor.addEnvironment("BUCKET_NAME", this.bukcetName);
    presignedProcessor.addEnvironment("BUCKET_REGION", this.bukcetReigion);

    

    
    /************/
    /*  APIGW   */
    /************/
    const requestProcessorIntegration = new HttpLambdaIntegration('fileUploadAPI', requestProcessor);
    const fileUploadAPI = new HttpApi(this, 'HttpApi', {
      apiName: `FileUploadAPI`,
      createDefaultStage: true,
    });
    new HttpStage(this, 'Stage', {
      httpApi: fileUploadAPI,
      stageName: 'beta',
    });
    fileUploadAPI.addRoutes({
      path: '/hello',
      methods: [ HttpMethod.POST ],
      integration: requestProcessorIntegration,
    });

    
    // presignedAPI intergration
    const presignedProcessorIntegration = new HttpLambdaIntegration('PresignedUrlAPI', requestProcessor);
    const presignedUrlAPI = new HttpApi(this, 'HttpApi', {
      apiName: `PresignedUrlAPI`,
      createDefaultStage: true,
    });
    new HttpStage(this, 'Stage', {
      httpApi: presignedUrlAPI,
      stageName: 'beta',
    });
    fileUploadAPI.addRoutes({
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
      sources: [Source.asset('frontend/build')], 
      destinationBucket: fileStorageBucket,
      destinationKeyPrefix: 'web', // Optional: specify a prefix for the uploaded files in the bucket
    });



    /************/
    /* DynamoDB */
    /************/
    const TABLE_NAME = "FovusCodingGameStack-UploadedFile585C0719-1B4S7KHXJN0LY";
    const table = new dynamodb.Table(this, 'UploadedFile', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

  }
}
