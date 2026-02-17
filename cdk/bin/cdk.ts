#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { DynamoDBStack } from '../lib/dynamodb-stack';
import { FrontendStack } from '../lib/frontend-stack';
import 'dotenv/config';


const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? '';
const AUTH0_CLAIM_NAMESPACE = process.env.AUTH0_CLAIM_NAMESPACE ?? '';
const AWS_REGION = process.env.AWS_REGION ?? '';
const TABLE_NAME = process.env.TABLE_NAME ?? '';


const app = new cdk.App();
new ApiStack(app, 'ApiStack', {
  auth0_domain: AUTH0_DOMAIN,
  region: AWS_REGION,
  tableName: TABLE_NAME,
  claimNamespace: AUTH0_CLAIM_NAMESPACE
});
new DynamoDBStack(app, 'DynamoDBStack', {
  tableName: TABLE_NAME
});
new FrontendStack(app, 'FrontendStack');