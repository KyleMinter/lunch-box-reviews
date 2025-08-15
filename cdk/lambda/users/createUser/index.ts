import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
} from '@aws-sdk/lib-dynamodb';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';


export const handler = async (event: any) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application-json',
    };

    const client = new DynamoDBClient({});
    const dynamo = DynamoDBDocumentClient.from(client);
    const tableName = 'Review-Entities-Table';
    
    try {
        // Get the raw JWT token.
        const token: string = event.authorizationToken.replace('Bearer ', '');

        // Configure Jwks client so we can obtain the key.
        const jwks = jwksClient({
            jwksUri: 'https://dev-0jf5q4cnqlq566kt.us.auth0.com/.well-known/jwks.json'
        });

        // Obtain the public key so we can validate the token.
        const jwtHeader = JSON.parse(atob(token.split('.')[0]));
        const kid = jwtHeader.kid;
        const signingKey = await jwks.getSigningKey(kid) as jwksClient.SigningKey;
        const publicKey = signingKey.getPublicKey();
        
        // Verify the token.
        const decoded = jwt.verify(token, publicKey) as JwtPayload;

        // Construct a user entity.
        const requestJSON = JSON.parse(event.body);
        const user = {
            entityID: decoded.sub,
            entityType: 'user',
            userName: requestJSON.name,
            userEmail: requestJSON.email,
        };

        // Add the user to the database.
        body = await dynamo.send(
            new PutCommand({
                TableName: tableName,
                Item: user,
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