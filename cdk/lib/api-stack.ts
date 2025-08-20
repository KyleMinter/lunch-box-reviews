import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as path from 'path';
import { HttpApi, CorsHttpMethod, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import * as fs from 'fs';

export class ApiStack extends cdk.Stack {
    private readonly RUNTIME = lambda.Runtime.NODEJS_20_X;
    private readonly REGION = 'us-east-1';

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
            const resources = fs.readdirSync(lambdaDir);
            resources.forEach((resource: string) => {
                // Iterate over each function subdirectory within the resource folder.
                const resourceDir = path.join(lambdaDir, resource);
                const functions = fs.readdirSync(resourceDir);
                functions.forEach((funcName: string) => {
                    // Import the function's route info.
                    const functionDir = path.join(resourceDir, funcName);
                    import(path.join(functionDir, './route.ts')).then(route => {
                        // Define the lambda function.
                        const lambdaFunction = new lambda.Function(this, `${funcName}Function`, {
                            runtime: this.RUNTIME,
                            handler: 'index.handler',
                            code: lambda.Code.fromAsset(functionDir),
                            environment: {
                                REGION: this.REGION
                            }
                        });

                        // Allow this function to access the DynamoDB
                        lambdaFunction.addToRolePolicy(new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: ['dynamodb:*'],
                            resources: ['*']
                        }));
                        
                        // Add the function as a route to the API.
                        httpApi.addRoutes({
                            path: route.PATH,
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

        // httpApi.addRoutes({
        //     path: '/reviews',
        //     methods: [HttpMethod.POST],
        //     integration: new HttpLambdaIntegration('reviews-integration', new lambda.Function(this, 'createReviewFunction', {
        //         runtime: this.RUNTIME,
        //         handler: 'index.handler',
        //         code: lambda.Code.fromAsset(path.join(__dirname, '/../lambda/reviews/createReview')),
        //         environment: {
        //             REGION: this.REGION
        //         }
        //     }))
        // });

        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: httpApi.apiEndpoint,
        })
    }
}
