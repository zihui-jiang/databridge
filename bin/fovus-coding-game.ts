#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FovusCodingGameStack } from '../lib/fovus-coding-game-stack';

const app = new cdk.App();
// AWS region to deploy your stack into, defaulting to us-west-2 because of location proximity
const deploymentRegion = 'us-west-2'
new FovusCodingGameStack(app, 'FovusCodingGameStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: deploymentRegion },
});