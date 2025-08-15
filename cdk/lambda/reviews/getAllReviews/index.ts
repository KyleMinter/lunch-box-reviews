import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb';



export const handler = async (_event: any) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application-json',
    };

    const client = new DynamoDBClient({});
    const dynamo = DynamoDBDocumentClient.from(client);
    const tableName = 'Review-Entities-Table';

    try {
        body = await dynamo.send(
            new QueryCommand({
                TableName: tableName,
                IndexName: 'GSI-entityType',
                KeyConditionExpression: 'entityType = :pkValue',
                ExpressionAttributeValues: {
                        ':pkValue': 'review'
                },
                ProjectionExpression: 'entityID, entityType, foodID, userID, quality, quantity, rating, reviewDate, menuDate',
            })
        );
        body = body.Items;
    }
    catch (err: any) {
        statusCode = 400;
        body = err.message;
    }
    finally {
        body = JSON.stringify(body);
    }
    return {
        statusCode,
        headers,
        body,
    };
};