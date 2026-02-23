import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
export const PATHS = [
  '/reviews',
  '/reviews/{id}',
  '/reviews/users/{userId}',
  '/reviews/foods/{foodId}',
  '/reviews/users/{userId}/foods/{foodId}',
];
export const METHODS = [HttpMethod.POST, HttpMethod.PUT, HttpMethod.GET, HttpMethod.DELETE];
