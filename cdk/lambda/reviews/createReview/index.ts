import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4} from 'uuid';


export const handler = async (event: any) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application-json',
    };

    const client = new DynamoDBClient({});
    const dynamo = DynamoDBDocumentClient.from(client);
    const tableName = 'Review-Entities-Table';

    const requestJSON = JSON.parse(event.body);
    
    const uuid: string = uuidv4();
    const review = {
        entityID: uuid,
        entityType: 'review',
        foodID: requestJSON.foodID,
        userID: requestJSON.userID,
        quality: requestJSON.quality,
        quantity: requestJSON.quantity,
        rating: requestJSON.rating,
        reviewDate: requestJSON.reviewDate,
        menuDate: requestJSON.menuDate
    };

    try {

        body = await dynamo.send(
            new PutCommand({
                TableName: tableName,
                Item: review,
            })
        );
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