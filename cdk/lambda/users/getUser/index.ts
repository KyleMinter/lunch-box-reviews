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

        // Get the entityID from the request's path parameter.
        const queryID = event.pathParameters!.id;

        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        const queryType: string | undefined = queryParams ? queryParams.queryType : undefined;
        const limit: number = queryParams ? Number(queryParams.limit) : 30;
        const offsetParam: string | undefined = queryParams ? queryParams.offset : undefined;
        let offset: Record<string, any> | undefined;

        if (offsetParam) {
            offset = JSON.parse(decodeURIComponent(offsetParam));
        }

        // Declare variables that will be used in the database query.
        let indexName: string;
        let keyConditionExpression: string;
        let expressionAttributeValues;
        let projectionExpression: string = 'entityID, userName, userEmail, userFlags';

        switch (queryType) {
            // The request is attempting to get users with a given foodID.
            case 'foodItem':
                indexName = 'GSI-entityType-foodID';
                keyConditionExpression = 'entityType = :pkValue AND foodID = :skValue';
                expressionAttributeValues = {
                    ':pkValue': 'review',
                    ':skValue': `${queryID}`
                };
                projectionExpression = 'userID';
                break;
            // The request is attempting to get users with a given name.
            case 'name':
                indexName = 'GSI-userName';
                keyConditionExpression = 'userName = :pkValue';
                expressionAttributeValues = {
                    ':pkValue': `${queryID}`,
                };
                break;
            // The request is atttemping to get users with a given email.
            case 'email':
                indexName = 'GSI-userEmail';
                keyConditionExpression = 'userEmail = :pkValue';
                expressionAttributeValues = {
                    ':pkValue': `${queryID}`,
                };
                break;
            // The request is attempting to get a user with a given entityID.
            case undefined:
                indexName = 'PartitionKey';
                keyConditionExpression = 'entityID = :pkValue';
                expressionAttributeValues = {
                    ':pkValue': `${queryID}`,
                };
                break;
            default:
                throw new Error(`Unsupported queryType: ${queryType}`);
        }

        // Query the database with the provided values.
        const results = await dynamo.send(
            new QueryCommand({
                TableName: tableName,
                IndexName: indexName,
                KeyConditionExpression: keyConditionExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ProjectionExpression: projectionExpression,
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