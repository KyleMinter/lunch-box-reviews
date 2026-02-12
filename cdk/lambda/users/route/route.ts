import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
export const PATHS = ['/users', '/users/{id}', '/users/{id}/reviews'];
export const METHODS = [HttpMethod.POST, HttpMethod.GET];
