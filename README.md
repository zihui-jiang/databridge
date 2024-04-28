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