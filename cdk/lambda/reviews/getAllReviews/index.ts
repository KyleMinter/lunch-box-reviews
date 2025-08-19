import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent, _context: Context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application-json',
    };

    try {
        // Get database client info.
        const client = new DynamoDBClient({});
        const dynamo = DynamoDBDocumentClient.from(client);
        const tableName = 'Review-Entities-Table';

        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        const limit: number = queryParams ? Number(queryParams.limit) : 30;
        const offsetParam: string | undefined = queryParams ? queryParams.offset : undefined;
        let offset: Record<string, any> | undefined;

        if (offsetParam) {
            offset = JSON.parse(decodeURIComponent(offsetParam));
        }

        // Query the database.
        const results = await dynamo.send(
            new QueryCommand({
                TableName: tableName,
                IndexName: 'GSI-entityType',
                KeyConditionExpression: 'entityType = :pkValue',
                ExpressionAttributeValues: {
                        ':pkValue': 'review'
                },
                ProjectionExpression: 'entityID, foodID, userID, quality, quantity, rating, reviewDate, menuDate',
                ExclusiveStartKey: offset,
                Limit: limit,
            })
        );

        // Store the results of the query and the last evaluated key to the response body.
        body = {
            Items: results.Items,
            LastEvaluatedKey: results.LastEvaluatedKey
        };
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