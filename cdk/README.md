# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

# API Documentation

## Overview

### Pagination

All endpoints support pagination to divide large queries into smaller more managable chunks. However, due to the particulars of DYnamoDB, endpoints do not function via the standard of supplying a limit and offset as query parameters. Instead, along with the results of an API query, the response body contains a LastEvaluatedKey object. As the name suggest, this object represents the last items queried by the database during a given API call. This object, along with a limit (represented as an integer) can then be supplied in subsequent API calls to continue querying for more results. Both the limit and LastEvaulatedKey query parameters are optional, however, if not supplied, the endpoint will assume the lowest limit of 10, and that you are requesting the first pagination of results. The limit parameter defaults to 10, but can also be set to 30, 50, or 100 to retrieve more results in a single API call.

### Querying using dates

wasd

## Endpoints

### Reviews

#### GET: /reviews

This endpoint is used to retrieve all the reviews stored in the database regardless of which user made the review, what food item the review is for, or what menu instance the review is for. Reviews returned by this endpoint follows the following format:

```
{
    entityID: ...,          // The UUID used to identify the review.
    foodID: ...,            // The ID of the food item associated with the review.
    userID: ...,            // The ID of the user who created the review.
    quality: ...,           // The quality rating of the review.
    quantity: ...,          // The quanitity rating of the review.
    rating: ...,            // The calculated overall rating of the review. 
    reviewDate: ...,        // The date of the last time the review was submitted/edited.
    menuInstanceDate: ...   // The date of the the menu instance associated with the review.
}
```


No query parameters need to be supplied to this function, however, a limit and a LastEvaulatedKey can be supplied to paginated results.

#### GET: /reviews/{id}

This endpoint is used to retrieve reviews with a given reviewID, userID, foodID, or menuID. Depending on the parameters supplied, this endpoint can return 0, 1, or many reviews. Providing a ID as a path parameter will result in reviews associated with the ID being returned. It is important to note, however, that the query parameter queryType will determine how results are queried.

The queryType parameter accepts the following values: user, foodItem, menuInstance. As the names of these options imply, they will determine the type of ID you are supplying as the path parameter and, as previously mentioned, query the database differently. For instance, if you wanted to retrieve all reviews made by a user you would do the following: `/reviews/{userID}/?queryType=user`

The queryType is optional and if left unsupplied, the endpoint will assume you are querying using a specific reviewID. If you are not attempting to query for reviews with a reviewID, the queryType parameter will need to be supplied in order to retrieve correct results. The endpoint will return a 400 error if an unsupported queryType parameter is supplied.

#### POST: /reviews

This endpoint is used for creating and storing new reviews in the database. This endpoint expects a requests with a body containing the following fields:

```
{
    foodID: ...,            // The unique ID for the food item this review is referencing.
    userID: ...,            // The unique ID for the user who is creating this review.
    quality: ...,           // The quality rating for the review. Represented as float value between 1-10.
    quantity: ...,          // The quantity rating for the review. Represented as an integer between 1-5.
    menuInstanceDate: ...   // The date of the menu instance this review is referencing. Represented as an ISO-8601 string.
}
```

These fields determine the various values of the newly created review. Upon receiving a request, a UUID will be genereated and the overal rating will be calculated for the review. Checks are performed on the backend to ensure that no improper data is supplied in these fields.

If invalid data is supplied, such as IDs referrencing users or foodItems that do not exist, invalid rating scores, or improperly formatted date strings, the endpoint will return a 400 error. In addtion, this endpoint accepts no query parameters and will return a 400 error if any are supplied.

### Users

#### GET: /users

This endpoint is used to retrieve all the users stored in the database. Users returned by this endpoint follows the following format:

```
{
    entityID: ...,          // The UUID used to identify the user.
    userName: ...,          // The name of the user.
    userEmail: ...,         // The email of the user.
    userFlags: {            // A object containing boolean flags which represent the permissions of the user.
        canSubmitReviews: ...,          // Determines if the user can submit reviews.
        canSubmitFoodItems: ...,        // Determines if the user can submit food items.
        canSubmitMenuInstances: ...     // Determines if the user can submit menu instances.
    }
}
```

No query parameters need to be supplied to this function, however, a limit and a LastEvaulatedKey can be supplied to paginated results.

#### GET: /users/{id}

This endpoint is used to retrieve users with a given foodID, name, or email. Depending on the parameters supplied, this endpoint can return 0, 1, or many reviews. Providing a ID as a path parameter will result in users associated with the ID being returned. It is important to note, however, that the query parameter queryType will determine how results are queried.

The queryType parameter accepts the following values: foodItem, name, email. As the names of these options imply, they will determine the type of ID you are supplying as the path parameter and, as previously mentioned, query the database differently. For instance, if you wanted to retrieve all users with a given name you would do the following: `/users/{name}/?queryType=name`

The queryType is optional and if left unsupplied, the endpoint will assume you are querying using a specific userID. If you are not attempting to query for users with a userID, the queryType parameter will need to be supplied in order to retrieve correct results. The endpoint will return a 400 error if an unsupported queryType parameter is supplied.

> NOTE: If a request is made using the foodItem query type, only individual userIDs will be returned. These IDs can then be used in subsequent API queries to get user data.

#### POST: /users

This endpoint is used for creating and storing new users in the database. This endpoint requires a valid Auth0 JWT token to be supplied in the authorization header, and expects a requests with a body containing the following fields:

```
{
    userName: ...,              // The name for the user.
    userEmail: ...,             // The email for the user.
}
```

The JWT token provided in the header is both used to verify that users are authenticated with Auth0 and to obtain a unique ID to identify the newly created user. (Specifically the the sub field in the JWT body is used as this unqiue ID).

These fields in the body of the request determine the various values of the newly created user. Upon receiving a request, a user flags will be generated. Checks are performed on the backend to ensure that no improper data is supplied in these fields.

If invalid data is supplied, the endpoint will return a 400 error. In addtion, this endpoint accepts no query parameters and will return a 400 error if any are supplied.