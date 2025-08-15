import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    AttributeType,
    GlobalSecondaryIndexProps,
    Table,
    BillingMode
} from 'aws-cdk-lib/aws-dynamodb';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DynamoDBStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        // example resource
        // const queue = new sqs.Queue(this, 'CdkQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });

        const table = new Table(this, 'TableDynamoDB', {
            tableName: 'DynamoDBTable',
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            partitionKey: {
                name: 'PK',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'SK',
                type: AttributeType.STRING,
            }
        });

        const gsi1: GlobalSecondaryIndexProps = {
            indexName: 'GSI1',
            partitionKey: {
                name: 'GSI1PK',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'GSI1SK',
                type: AttributeType.STRING,
            }
        };

        table.addGlobalSecondaryIndex(gsi1);
    }
}
