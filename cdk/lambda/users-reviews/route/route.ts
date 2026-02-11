import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
export const PATHS = ['/users/{id}/reviews'];
export const METHODS = [HttpMethod.GET];
