import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
export const PATH = '/reviews/{id}';
export const METHODS = [HttpMethod.POST, HttpMethod.PUT, HttpMethod.GET, HttpMethod.DELETE];
