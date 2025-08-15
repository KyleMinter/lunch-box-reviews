import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
    private readonly RUNTIME = lambda.Runtime.NODEJS_20_X;
    private readonly REGION = 'us-east-1';

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        // example resource
        // const queue = new sqs.Queue(this, 'CdkQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });

        const myFunction = new lambda.Function(this, "functioname", {
            runtime: this.RUNTIME,
            handler: "index.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, '/../lambda/helloworld')),
            environment: {
                REGION: this.REGION,
            }
        });
    }
}
