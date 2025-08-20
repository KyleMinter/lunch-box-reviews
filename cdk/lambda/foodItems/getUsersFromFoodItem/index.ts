import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    QueryCommand,
    GetCommand,
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

        // Get the userID from the request's path parameter.
        const foodID = event.pathParameters?.id;
        if (!foodID)
            throw new Error('FoodID is undefined');

        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        const limit: number = queryParams ? Number(queryParams.limit) : 30;
        const offsetParam: string | undefined = queryParams ? queryParams.offset : undefined;
        let offset: Record<string, any> | undefined;
        if (offsetParam) {
            offset = JSON.parse(decodeURIComponent(offsetParam));
        }

        // Query the database for reviews with the provided userID.
        const results = await dynamo.send(
            new QueryCommand({
                TableName: tableName,
                IndexName: 'GSI-entityType-foodID',
                KeyConditionExpression: 'entityType = :pkValue AND foodID = :skValue',
                ExpressionAttributeValues: {
                    ':pkValue': 'review',
                    ':skValue': foodID
                },
                ProjectionExpression: 'userID',
                ExclusiveStartKey: offset,
                Limit: limit,
            })
        );

        // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
        if (!results.Items) {
            body = {
                Items: [],
                LastEvaluatedKey: results.LastEvaluatedKey
            }
        }
        else {
            // Retreive each food entity for every userID retrieved in the previous query.
            const users: any[] = [];

            const promises = results.Items.map(async (userID) => {
                userID = userID.userID;
                const user = await dynamo.send(
                    new GetCommand({
                        TableName: tableName,
                        Key: {
                            entityID: userID
                        },
                        ProjectionExpression: 'entityID, userName, userEmail, userFlags'
                    })
                );

                if (user.Item)
                    users.push(user.Item);
            });
            await Promise.all(promises);

            // Store the results of the query and the last evaluated key to the response body.
            body = {
                Items: users,
                LastEvaluatedKey: results.LastEvaluatedKey
            };
        }
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