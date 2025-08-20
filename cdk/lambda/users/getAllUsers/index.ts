import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    QueryCommand,
    QueryCommandOutput,
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
        const filter: string | undefined = queryParams ? queryParams.filter : undefined;
        const criteria: string | undefined = queryParams ? queryParams.criteria : undefined;
        if ((filter && !criteria) || (!filter && criteria))
            throw new Error('An unsupported combination of query parameters was supplied');

        const limit: number = queryParams ? Number(queryParams.limit) : 30;
        const offsetParam: string | undefined = queryParams ? queryParams.offset : undefined;
        let offset: Record<string, any> | undefined;
        if (offsetParam) {
            offset = JSON.parse(decodeURIComponent(offsetParam));
        }

        let users: QueryCommandOutput;
        if (filter && criteria) {
            if (criteria !== 'userName' && criteria !== 'userEmail')
                throw new Error('Unsupported criteria');

            // Query the database for users using a criteria and filter.
            users = await dynamo.send(
                new QueryCommand({
                    TableName: tableName,
                    IndexName: `GSI-entityType-${criteria}`,
                    KeyConditionExpression: `entityType = :pkValue AND begins_with(${criteria}, :skValue)`,
                    ExpressionAttributeValues: {
                            ':pkValue': 'user',
                            ':skValue': filter
                    },
                    ProjectionExpression: 'entityID, userName, userEmail, userFlags',
                    ExclusiveStartKey: offset,
                    Limit: limit,
                })
            );
        }
        else {
            // Query the database for all users.
            users = await dynamo.send(
                new QueryCommand({
                    TableName: tableName,
                    IndexName: 'GSI-entityType',
                    KeyConditionExpression: 'entityType = :pkValue',
                    ExpressionAttributeValues: {
                            ':pkValue': 'user'
                    },
                    ProjectionExpression: 'entityID, userName, userEmail, userFlags',
                    ExclusiveStartKey: offset,
                    Limit: limit,
                })
            );
        }

        // Store the results of the query and the last evaluated key to the response body.
        body = {
            Items: users.Items ? users.Items : [],
            LastEvaluatedKey: users.LastEvaluatedKey
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