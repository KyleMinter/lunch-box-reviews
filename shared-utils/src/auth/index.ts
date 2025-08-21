import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { JwksClient, SigningKey } from 'jwks-rsa';
import { GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getDynamoDbClient, REVIEWS_TABLE } from '../database';
import { UnauthorizedError } from '../errors';
import { UserFlag } from '../types';

export function getAuthorizationHeaders(requestMethods: string) {
    return {
        'Content-Type': 'application-json',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': `${requestMethods}`,
    };
}

/**
 * Validates a given JWT token and returns the decoded JWT upon successful verification.
 * If the JWT token is invalid, undefined will be returned.
 * @param token the JWT token
 * @returns the decoded JWT if verification is successful, undefined if it is not
 */
export async function validateJwtToken(event: APIGatewayProxyEvent): Promise<JwtPayload> {
    const auth: string | undefined = event.headers.Authorization || event.headers.authorization;
    if (auth === undefined)
        throw new Error('Authorization header is undefined');
    const token = auth.replace('Bearer ', '');

    // Configure Jwks client so we can obtain the key.
    const jwks = new JwksClient({
        jwksUri: 'https://dev-0jf5q4cnqlq566kt.us.auth0.com/.well-known/jwks.json'
    });

    // Obtain the public key so we can validate the token.
    const jwtHeader = JSON.parse(atob(token.split('.')[0]));
    const kid = jwtHeader.kid;
    const signingKey = await jwks.getSigningKey(kid) as SigningKey;
    const publicKey = signingKey.getPublicKey();
    
    // Verify the token.
    const decodedJwt: JwtPayload = jwt.verify(token, publicKey) as JwtPayload;
    if (!decodedJwt || !decodedJwt.sub)
        throw new UnauthorizedError('User is not authorized');

    return decodedJwt;
}

/**
 * Verifies that a user with a given userID has the provided permissions.
 * Throws an UnauthorizedError if the user does not exist or does not have one or more of the provided permissions.
 * @param userID the ID of the user
 * @param permissions a list of UserFlags to ensure the user has
 */
export async function validateUserPermissions(userID: string, permissions: UserFlag[]) {
    const dynamo = getDynamoDbClient();

    const userFlags: UserFlag[] | undefined = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: userID
            },
            ProjectionExpression: 'userFlags',
        })
    ).then((result: GetCommandOutput) => result.Item?.userFlags);

    if (!userFlags)
        throw new UnauthorizedError('User does not exist');

    permissions.forEach(permission => {
        if (!userFlags.includes(permission))
            throw new UnauthorizedError('User is not authorized for this action');
    });
}