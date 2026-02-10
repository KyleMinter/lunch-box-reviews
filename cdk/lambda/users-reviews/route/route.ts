import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
export const PATH = '/users/{id}/reviews';
export const METHODS = [HttpMethod.GET];
