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
    
    try {
        const client = new DynamoDBClient({});
        const dynamo = DynamoDBDocumentClient.from(client);
        const tableName = 'Review-Entities-Table';

        const requestJSON = JSON.parse(event.body);
        const foodAttributes = requestJSON.foodAttributes;
        
        const uuid: string = uuidv4();
        const foodItem = {
            entityID: uuid,
            entityType: 'foodItem',
            foodName: requestJSON.foodName,
            foodOrigin: requestJSON.foodOrigin,
            foodAttributes: foodAttributes,
        };

        await dynamo.send(
            new PutCommand({
                TableName: tableName,
                Item: foodItem,
            })
        );

        body = {
            entityID: uuid,
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