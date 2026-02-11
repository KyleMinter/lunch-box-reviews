export * from './foodItems.js';
export * from './reviews.js';
export * from './users.js';

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
import { BadRequestError } from '../errors/index.js';
import { PaginationParameters, reviewDtoSchema, reviewPrototypeSchema } from '@lunch-box-reviews/shared-types';
import { z } from "zod";
import { getUser } from './users.js';
import { getFoodItem } from './foodItems.js';


/*
  ======================================================================================================

  General Database Utils
  
  ======================================================================================================
*/

export const REVIEWS_TABLE = 'Review-Entities-Table';

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
  let cursor: string | undefined = undefined;

  const queryParams = event.queryStringParameters;
  if (queryParams && queryParams.limit) {
    const supportedLimits = [10, 25, 50];
    const limitParam = Number(queryParams.limit);
    if (supportedLimits.includes(limitParam))
      limit = limitParam;
    else
      throw new BadRequestError('Unsupported limit parameter');

    cursor = queryParams ? queryParams.cursor : undefined;
  }

  return {
    limit,
    cursor
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
 * Encodes a given cursor using base64 encoding. Returns null if the cursor is undefined.
 * @param cursor the cursor to encode
 * @returns the encoded cursor string or undefined
 */
export function encodeCursor(cursor: Record<string, any> | undefined): string | null {
  if (!cursor)
    return null;

  return Buffer.from(JSON.stringify(cursor)).toString('base64');
}

/**
 * Decodes a given cursor using base64 encoding. Returns undefined if the cursor is undefined.
 * @param cursor the cursor to decode
 * @returns the decoded cursor string or undefined
 */
export function decodeCursor(cursor?: string): Record<string, any> | undefined {
  if (!cursor)
    return undefined;

  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  } catch {
    return undefined;
  }
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

export const reviewPrototypeToDtoSchema = reviewPrototypeSchema.transform(async ({ userId, foodId, ...rest }) => {
  const user = await getUser(userId);
  const foodItem = await getFoodItem(foodId);
  return {
    ...rest,
    user: user,
    food: foodItem
  }
}).pipe(reviewDtoSchema);

export const reviewDtoToPrototypeSchema = reviewDtoSchema.transform(async ({ user, food, ...rest }) => {
  return {
    ...rest,
    userId: user.entityId,
    foodId: food.entityId
  }
}).pipe(reviewPrototypeSchema);


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