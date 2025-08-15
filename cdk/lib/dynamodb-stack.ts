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
                name: 'entityID',
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
            indexName: 'GSI-entityType-foodID',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'foodID',
                type: AttributeType.STRING,
            }
        };

        const GSI_EntityType_UserID: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType-userID',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'userID',
                type: AttributeType.STRING,
            }
        };

        // ISO 8601 string for date representation
        const GSI_EntityType_MenuDate: GlobalSecondaryIndexProps = {
            indexName: 'GSI-entityType-menuDate',
            partitionKey: {
                name: 'entityType',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'menuDate',
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

        const GSI_FoodName: GlobalSecondaryIndexProps = {
            indexName: 'GSI-foodName',
            partitionKey: {
                name: 'foodName',
                type: AttributeType.STRING,
            }
        };

        const GSI_FoodOrigin: GlobalSecondaryIndexProps = {
            indexName: 'GSI-foodOrigin',
            partitionKey: {
                name: 'foodOrigin',
                type: AttributeType.STRING,
            }
        };

        const GSI_UserName: GlobalSecondaryIndexProps = {
            indexName: 'GSI-userName',
            partitionKey: {
                name: 'userName',
                type: AttributeType.STRING,
            }
        };

        const GSI_UserEmail: GlobalSecondaryIndexProps = {
            indexName: 'GSI-userEmail',
            partitionKey: {
                name: 'userEmail',
                type: AttributeType.STRING,
            }
        };

        // Add all GSIs to the Review-Entities table
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType_FoodID);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType_UserID);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_EntityType_MenuDate);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_ReviewDate);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_FoodName);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_FoodOrigin);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_UserName);
        TABLE_ReviewEntities.addGlobalSecondaryIndex(GSI_UserEmail);
    }
}
