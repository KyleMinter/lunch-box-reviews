import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    AttributeType,
    GlobalSecondaryIndexProps,
    Table,
    BillingMode
} from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDBStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Define Review-Entities table
        const TABLE_ReviewEntities = new Table(this, 'Review-Entities', {
            tableName: 'Review-Entities-Table',
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            partitionKey: {
                name: 'entityId',
                type: AttributeType.STRING
            }
        });

        // Define global secondary indexes (GSIs) for Review-Entities table
        const GSI_EntityType: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            }
        };

        const GSI_EntityType_FoodID: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType-foodId',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'foodId',
                type: AttributeType.STRING,
            }
        };

        const GSI_EntityType_UserID: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType-userId',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'userId',
                type: AttributeType.STRING,
            }
        };

        const GSI_ReviewDate: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType-reviewDate',
            partitionKey: {
                name: 'reviewDate',
                type: AttributeType.STRING
            }
        };

        const GSI_EntityType_FoodName: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType-foodName',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'foodName',
                type: AttributeType.STRING,
            }
        };

        const GSI_EntityType_FoodOrigin: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType-foodOrigin',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'foodOrigin',
                type: AttributeType.STRING,
            }
        };

        const GSI_EntityType_UserName: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType-userName',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'userName',
                type: AttributeType.STRING,
            }
        };

        const GSI_EntityType_UserEmail: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType-userEmail',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'userEmail',
                type: AttributeType.STRING,
            }
        };

        // Add all GSIs to the Review-Entities table
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType_FoodID);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType_UserID);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_ReviewDate);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType_FoodName);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType_FoodOrigin);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType_UserName);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType_UserEmail);
    }
}
