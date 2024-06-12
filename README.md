# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests

* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


# Steps to follow to deploy the stack
1. Install NodeJS https://nodejs.org/en/download
2. Install Typescript: `npm -g install typescript`
3. Install CDK CLI: `npm install -g aws-cdk`
4. Install VSCode: https://code.visualstudio.com/
5. Install AWS CLI: `brew install awscli`
6. Authenticate with AWS: `aws configure`, find the accces key and secret in the csv file (TODO: Move to IAM identity center)
7. npm install @aws-sdk/s3-request-presigner @aws-sdk/credential-provider-ini
```
AWS Access Key ID [None]: ***
AWS Secret Access Key [None]: ***
Default region name [None]: us-west-2
Default output format [None]: json
```
7. Run `cdk bootstrap aws://ACCOUNT-NUMBER/REGION` replace account number and region
8. Build: `npm run build`
9. Synthesize: `cdk synth`
10. Deploy the CDK stack: `cdk deploy`




#TO-DOs
1. Improve secrurity & access management, currently using access key, need to move to IAM identity center


1. Set Up AWS CDK Infrastructure:
Use the latest version of AWS CDK in TypeScript to define your AWS infrastructure.
Define your Lambda functions, DynamoDB table, and other resources using CDK constructs.

2. Lambda Function with AWS SDK JavaScript V3:
Write your Lambda functions in TypeScript using the AWS SDK JavaScript V3.
Ensure you're using the latest version of the SDK.
Implement error handling within your Lambda functions.

3. Securely Manage AWS Credentials:
Do not hard-code any AWS access keys or credentials.
Utilize AWS IAM roles and policies to grant necessary permissions to your Lambda functions and other resources.
Avoid storing credentials in your code, environment variables, or configurations. Use IAM roles for accessing AWS resources securely.

4. Reader-friendly Code and Structure:
Use descriptive and meaningful names for parameters, variables, file names, and folder names.
Organize your codebase in a professional and readable manner.

5. Secure S3 Access:
Ensure that the text file stored in S3 is not public.
Implement AWS IAM policies to restrict access to the S3 bucket to specific users or roles.

6. Avoid AWS Amplify:
Do not use AWS Amplify for frontend or backend resources as per the requirements.

7. Store Inputs and S3 Path in DynamoDB:
Use DynamoDB to create a table to store inputs and S3 paths.
Ensure that the DynamoDB table is configured securely and efficiently.

8. Create New VM and Trigger Script:
Implement a mechanism, possibly using AWS Lambda, to listen for events in DynamoDB.
When a new event is detected, trigger the creation of a new VM.
Automatically run the script with error handling upon VM creation.
Implement error handling and logging within your script to handle any issues that may arise during execution.# FovusCodingGame
