import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_dynamodb as dynamodb} from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import {  HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpApi, HttpMethod, HttpStage } from 'aws-cdk-lib/aws-apigatewayv2'


export class FovusCodingGameStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    /************/
    /*    S3    */
    /************/
    const fileStorageBucket = new s3.Bucket(this, 'file-storage-bucket', {
      bucketName: "emma-jiang-fovus-coding-game-file-storage-bucket",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL // block public access
    })

    /************/
    /*  LAMBDA  */
    /************/
    const requestProcessor = new Function(this, 'requestProcessor', {
      functionName: 'RequestProcessorLambda',
      runtime: Runtime.NODEJS_20_X,
      handler: 'request-process.handler',
      code: Code.fromAsset('lib/lambda'),
    });
    requestProcessor.addEnvironment("EXAMPLE_KEY", "EXAMPLE_VALUE");
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

    /************/
    /* DynamoDB */
    /************/
    const table = new dynamodb.Table(this, 'UploadedFile', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

  }
}
