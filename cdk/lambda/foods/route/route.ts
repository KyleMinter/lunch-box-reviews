import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
export const PATHS = ['/foods', '/foods/{id}', '/foods/{id}/reviews'];
export const METHODS = [HttpMethod.GET, HttpMethod.POST];
