import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as path from 'path';
import { HttpApi, CorsHttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import * as fs from 'fs';


interface ApiStackProps extends cdk.StackProps {
  auth0_domain: string;
  region: string;
  tableName: string;
  claimNamespace: string;
}

export class ApiStack extends cdk.Stack {
  private readonly RUNTIME = lambda.Runtime.NODEJS_20_X;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const httpApi = new HttpApi(this, 'Reviews-API', {
      apiName: 'Reviews-API',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.POST,
          CorsHttpMethod.GET,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowHeaders: ['Content-Type', 'Authorization'],
      }
    });

    try {
      // Iterate over each resource subdirectory in the 'lambda' folder.
      const lambdaDir = path.join(__dirname, '../lambda/');
      const functions = fs.readdirSync(lambdaDir);
      functions.forEach((funcName: string) => {
        // Import the function's route info.
        const functionDir = path.join(lambdaDir, funcName);
        import(path.join(functionDir, './route/route.ts')).then(route => {
          // Define the lambda function.
          const lambdaFunction = new lambda.Function(this, `${funcName}Function`, {
            runtime: this.RUNTIME,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(functionDir, {
              followSymlinks: cdk.SymlinkFollowMode.ALWAYS
            }),
            environment: {
              AUTH0_DOMAIN: props.auth0_domain,
              AUTH0_CLAIM_NAMESPACE: props.claimNamespace,
              REGION: props.region,
              TABLE_NAME: props.tableName
            }
          });

          // Allow this function to access the DynamoDB
          lambdaFunction.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['dynamodb:*'],
            resources: ['*']
          }));

          // Add the function as a route to the API.
          route.PATHS.forEach((routePath: string) => {
            httpApi.addRoutes({
              path: routePath,
              methods: route.METHODS,
              integration: new HttpLambdaIntegration('reviews-integration', lambdaFunction)
            });
          });
        });
      });
    }
    catch (err: unknown) {
      // I never thought I'd get this far... - Plankton
      console.log(err);
    }

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: httpApi.apiEndpoint,
    })
  }
}
