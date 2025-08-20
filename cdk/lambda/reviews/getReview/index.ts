import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand
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

        // Get the reviewID from the request's path parameter.
        const reviewID = event.pathParameters?.id;
        if (!reviewID)
            throw new Error('ReviewID is undefined');

        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        if (queryParams)
            throw new Error('Query parameters are not supported for this endpoint');

        // Get the review from the database.
        const review = await dynamo.send(
            new GetCommand({
                TableName: tableName,
                Key: {
                    entityID: reviewID
                },
                ProjectionExpression: 'entityID, foodID, userID, quality, quantity, rating, reviewDate, menuDate',
            })
        );

        // Store the review in the response body.
        body = review.Item;
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