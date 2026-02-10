import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
export const PATH = '/users/{id}';
export const METHODS = [HttpMethod.POST, HttpMethod.GET];
