export * from './foodItems';
export * from './reviews';
export * from './users';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    ScanCommandOutput,
    QueryCommandOutput,
    GetCommandOutput,
    PutCommandOutput,
    UpdateCommandOutput,
    DeleteCommandOutput
 } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { BadRequestError } from '../errors';


/*
    ======================================================================================================

    General Database Utils
    
    ======================================================================================================
*/

export const REVIEWS_TABLE = 'Review-Entities-Table';

/**
 * Interface representing pagination query parameters.
 * Contains a limit and offset parameter.
 */
export interface PaginationParameters {
    limit: number,
    offset: Record<string, any> | undefined
}

/**
 * Interface representing criteria filter query parameters.
 * Contains a filter and criteria.
 */
export interface CriteriaFilter {
    filter: string,
    criteria: string,
}

/**
 * Interface representing date filter query parameters.
 * Contains a start date and end date.
 */
export interface DateFilter {
    startDate: string | undefined,
    endDate: string | undefined
}

/**
 * Gets the Dynamo DB client to use for querying.
 * @returns the Dynamo DB client 
 */
export function getDynamoDbClient(): DynamoDBDocumentClient {
    const client = new DynamoDBClient({});
    const dynamo = DynamoDBDocumentClient.from(client);
    return dynamo;
}

/**
 * Gets the pagination (limit & offset) query parameters for a given request.
 * @param event the request event
 * @returns the pagination (limit & offset) query parameters
 */
export function getPaginationParameters(event: APIGatewayProxyEvent): PaginationParameters {
    let limit: number = 10;
    let offset: Record<string, any> | undefined = undefined;

    const queryParams = event.queryStringParameters;
    if (queryParams && queryParams.limit) {
        const supportedLimits = [10, 30, 50, 100];
        const limitParam = Number(queryParams.limit);
        if (supportedLimits.includes(limitParam))
            limit = limitParam;
        else
            throw new BadRequestError('Unsupported limit parameter');

        const offsetParam: string | undefined = queryParams ? queryParams.offset : undefined;

        if (offsetParam) {
            offset = JSON.parse(decodeURIComponent(offsetParam));
        }
    }

    return {
        limit: limit,
        offset: offset
    }
}

/**
 * Gets the criteria filter query parameters for a given request.
 * @param event the request event
 * @returns the criteria filter query parameters
 */
export function getCriteriaFilterParameters(event: APIGatewayProxyEvent): CriteriaFilter | undefined {
    const queryParams = event.queryStringParameters;
    const filter: string | undefined = queryParams ? queryParams.filter : undefined;
    const criteria: string | undefined = queryParams ? queryParams.criteria : undefined;

    if ((!filter && criteria) || (filter && !criteria))
        throw new Error('An unsupported combination of query parameters was supplied');

    if (filter && criteria) {
        const criteriaFilter: CriteriaFilter = {
            filter: filter,
            criteria: criteria
        };
        return criteriaFilter;
    }
    else
        return undefined;
}

/**
 * Gets the date filter query parameters for a given request.
 * @param event the request event
 * @returns the date filter parameters
 */
export function getDateFilterParameters(event: APIGatewayProxyEvent): DateFilter {
    const queryParams = event.queryStringParameters;
    const startDate: string | undefined = queryParams ? queryParams.startDate : undefined;
    const endDate: string | undefined = queryParams ? queryParams.endDate : undefined;

    const dateFilter: DateFilter = {
        startDate: startDate,
        endDate: endDate
    };

    return dateFilter;
}

/**
 * Checks if a given string is a date in the ISO-8601 format.
 * @param input the string to check
 * @returns true if the string is in the ISO-8601 format, false if not.
 */
export function isValidISO8601(input: string): boolean {
    // Attempt to create a date object from the string.
    const date = new Date(input);

    // Check if the date is valid.
    if (isNaN(date.getTime()))
        return false;

    // Convert the valid date back into an ISO string and compare.
    try {
        return (date.toISOString() === input);
    }
    catch {
        return false;
    }
}

/** A ScanCommandOutput of a given type T. */
export type IScanCommandOutput<T> = Omit<ScanCommandOutput, 'Items'> & {
    Items?: T
}

/** A QueryCommandOutput of a given type T. */
export type IQueryCommandOutput<T> = Omit<QueryCommandOutput, 'Items' | 'LastEvaluatedKey'> & {
    Items?: T[]
    LastEvaluatedKey?: T
}

/** A GetCommandOutput of a given type T. */
export type IGetCommandOutput<T> = Omit<GetCommandOutput, 'Item'> & {
    Item?: T
}

/** A PutCommandOutput of a given type T. */
export type IPutCommandOutput<T> = Omit<PutCommandOutput, 'Attribute'> & {
    Attributes?: T
}

/** A DeleteCommandOutput of a given type T. */
export type IDeleteCommandOutput<T> = Omit<DeleteCommandOutput, 'Attributes'> & {
    Attributes?: T
}

/** A UpdateCommandOutput of a given type T. */
export type IUpdateCommandOutput<T> = Omit<UpdateCommandOutput, 'Attributes'> & {
    Attributes?: T
}