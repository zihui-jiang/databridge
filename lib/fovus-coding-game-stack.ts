import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import {  HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'


export class FovusCodingGameStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const fileStorageBucket = new s3.Bucket(this, 'file-storage-bucket', {
      versioned: true
    })
    // Create Lambda function
    const requestProcessor = new Function(this, 'requestProcessor', {
      functionName: 'MyLambdaFunction',
      runtime: Runtime.NODEJS_20_X,
      handler: 'request-process.handler',
      code: Code.fromAsset('lib/lambda'),
    });
    const requestProcessorIntegration = new HttpLambdaIntegration('fileUploadAPI', requestProcessor);

    const httpApi = new HttpApi(this, 'HttpApi', {
      apiName: `FileUploadAPI`,
      createDefaultStage: true,
  });
    httpApi.addRoutes({
      path: '/hello',
      methods: [ HttpMethod.GET ],
      integration: requestProcessorIntegration,
    });
  }
}
