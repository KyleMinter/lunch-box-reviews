import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
export const PATHS = ['/foods', '/foods/{id}'];
export const METHODS = [HttpMethod.GET];
