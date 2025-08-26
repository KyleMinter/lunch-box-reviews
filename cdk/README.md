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
<a name="overview"></a>

>## Table of Contents
<a name="table-of-contents"></a>

- [Overview](#overview)
    - [Table of Contents](#table-of-contents)
    - [Pagination](#pagination)
    - [Date Filtering](#date-filtering)
    - [Criteria Filtering](#criteria-filtering)
- [Endpoints](#endpoints)
    - [Reviews](#reviews)
        - [GET: /reviews](#get-reviews)
        - [GET: /reviews/{id}](#get-reviewsid)
        - [POST: /reviews](#post-reviews)
        - [PUT: /reviews/{id}](#put-reviewsid)
        - [DELETE: /reviews/{id}](#delete-reviewsid)
    - [Users](#users)
        - [GET: /users](#get-users)
        - [GET: /users/{id}](#get-usersid)
        - [GET: /users/{id}/reviews](#get-usersidreviews)
        - [GET: /users/{id}/foodItems](#get-usersidfooditems)
        - [POST: /users](#post-users)
        - [PUT: /users/{id}](#put-usersid)
        - [DELETE: /users/{id}](#delete-usersid)
    - [Food Items](#food-items)
        - [GET: /foodItems](#get-fooditems)
        - [GET: /foodItems/{id}](#get-fooditemsid)
        - [GET: /foodItems/{id}/reviews](#get-fooditemsidreviews)
        - [GET: /foodItems/{id}/users](#get-fooditemsidusers)
        - [POST: /foodItems](#post-fooditems)
        - [PUT: /foodItems/{id}](#put-fooditemsid)
        - [DELETE: /foodItems/{id}](#delete-fooditemsid)
    - [Menu Instances](#menu-instances)
        - [GET: /menuInstances](#get-menuinstances)
        - [GET: /menuInstances/{id}](#get-menuinstancesid)
        - [POST: /menuInstances](#post-menuinstancesid)
        - [PUT: /menuInstances/{id}](#put-menuinstancesid)
        - [DELETE: /menuInstances/{id}](#delete-menuinstancesid)

>## Pagination
<a name="pagination"></a>

All endpoints support pagination to divide large queries into smaller more managable chunks. However, due to the particulars of DynamoDB, endpoints do not function via the standard of supplying a limit and offset as query parameters.

Instead, along with the results of an API query, the response body contains a LastEvaluatedKey object. As the name suggest, this object represents the last items queried by the database during a given API call. This object, along with a limit (represented as an integer) can then be supplied in subsequent API calls to continue querying for more results.

Both the limit and LastEvaulatedKey query parameters are optional, however, if not supplied, the endpoint will assume the lowest limit of 10, and that you are requesting the first pagination of results. The limit parameter defaults to 10, but can also be set to 30, 50, or 100 to retrieve more results in a single API call.

>## Date Filtering
<a name="date-filtering"></a>

wasd

>## Criteria Filtering
<a name="criteria-filtering"></a>

wasd

## Endpoints
<a name="endpoints"></a>

> ## Reviews
<a name="reviews"></a>

* ### GET: /reviews
<a name="get-reviews"></a>

This endpoint is used to retrieve all the reviews stored in the database regardless of which user made the review, what food item the review is for, or what menu instance the review is for.

No query parameters need to be supplied to this function, however, a limit and a LastEvaulatedKey can be supplied to paginated results.

* ### GET: /reviews/{id}
<a name="get-reviews/{id}"></a>

This endpoint is used to retrieve a review with a given reviewID. If the given ID does not match an existing review nothing will be returned.

This endpoint does not accept any query parameters and will return a 404 Bad Request error if any are supplied.

* ### POST: /reviews
<a name="post-reviews"></a>

This endpoint is used for creating and storing new reviews in the database. This endpoint expects a requests with a body containing the following fields:

```
{
    "foodID": ...,            // The unique ID for the food item this review is referencing.
    "userID": ...,            // The unique ID for the user who is creating this "review.
    "quality": ...,           // The quality rating for the review. Represented as float value between 1-10.
    "quantity": ...,          // The quantity rating for the review. Represented as an integer between 1-5.
    "menuInstanceDate": ...   // The date of the menu instance this review is referencing. Represented as an ISO-8601 string.
}
```

These fields determine the various values of the newly created review. Upon receiving a request, a UUID will be generated and the overall rating will be calculated for the review. Checks are performed on the backend to ensure that no improper data is supplied in these fields.

If invalid data is supplied, such as IDs referrencing users or foodItems that do not exist, invalid rating scores, or improperly formatted date strings, the endpoint will return a 400 Bad Request error.

This endpoint does not accept any query parameters and will return a 404 Bad Request error if any are supplied.

* ### PUT: /reviews/{id}
<a name="put-reviews/{id}"></a>

wasd

* ### DELETE: /reviews/{id}
<a name="delete-reviews/{id}"></a>

wasd

> ## Users
<a name="users"></a>

* ### GET: /users
<a name="get-users"></a>

This endpoint is used to retrieve all the users stored in the database.

No query parameters need to be supplied to this function, however, a limit and a LastEvaulatedKey can be supplied to paginated results.

* ### GET: /users/{id}
<a name="get-users/{id}"></a>

This endpoint is used to retrieve a user with a given userID. If the given ID does not match an existing user nothing will be returned.

No query parameters need to be supplied to this function, however, a criteria and filter can be supplied to filter for users with a given name or email. The provided criteria must be equal to `userName` or `userEmail` and be supplied with a filter, otherwise a 404 Bad Request error will be returned.

* ### GET: /users/{id}/reviews
<a name="get-users/{id}/reviews"></a>

This endpoint is used to retrieve reviews by a user with a given userID. If the given ID does not match an existing user or the user has not submitted any reviews, nothing will be returned.

No query parameters need to be supplied to this function, however, a limit and a LastEvaulatedKey can be supplied to paginated results.

* ### GET: /users/{id}/foodItems
<a name="get-users/{id}/foodItems"></a>

This endpoint is used to retrieve food items reviewed by a user with a given userID. If the given ID does not match an existing user or the user has not reviewed any food items, nothing will be returned.

No query parameters need to be supplied to this function, however, a limit and a LastEvaulatedKey can be supplied to paginated results.

* ### POST: /users
<a name="post-users"></a>

This endpoint is used for creating and storing new users in the database. This endpoint requires a valid Auth0 JWT token to be supplied in the authorization header, and expects a requests with a body containing the following fields:

```
{
    "userName": ...,              // The name for the user.
    "userEmail": ...,             // The email for the user.
}
```

The JWT token provided in the header is both used to verify that users are authenticated with Auth0 and to obtain a unique ID to identify the newly created user. (Specifically the the sub field in the JWT body is used as this unqiue ID).

These fields in the body of the request determine the various values of the newly created user. Upon receiving a request, a user flags will be generated. Checks are performed on the backend to ensure that no improper data is supplied in these fields.

If invalid data is supplied, the endpoint will return a 400 Bad Request error.

This endpoint does not accept any query parameters and will return a 404 Bad Request error if any are supplied.

* ### PUT: /users/{id}
<a name="put-users/{id}"></a>

wasd

* ### DELETE: /users/{id}
<a name="delete-users/{id}"></a>

wasd

>## Food Items
<a name="foodItems"></a>

* ### GET: /foodItems
<a name="get-foodItems"></a>

This endpoint is used to retrieve all the food items stored in the database.

No query parameters need to be supplied to this function, however, a limit and a LastEvaulatedKey can be supplied to paginated results.

* ### GET: /foodItems/{id}
<a name="get-foodItems/{id}"></a>

This endpoint is used to retrieve a food item with a given foodID. If the given ID does not match an existing food item nothing will be returned.

No query parameters need to be supplied to this function, however, a criteria and filter can be supplied to filter for food items with a given name or origin. The provided criteria must be equal to `foodName` or `foodOrigin` and be supplied with a filter, otherwise a 404 Bad Request error will be returned.

* ### GET: /foodItems/{id}/reviews
<a name="get-foodItems/{id}/reviews"></a>

This endpoint is used to retrieve reviews of a food item with a given foodID. If the given ID does not match an existing food item or no reviews for the food item have bee submitted, nothing will be returned.

No query parameters need to be supplied to this function, however, a limit and a LastEvaulatedKey can be supplied to paginated results.

* ### GET: /foodItems/{id}/users
<a name="get-foodItems/{id}/users"></a>

This endpoint is used to retrieve users who have reviewed a food item with a given foodID. If the given ID does not match an existing food item or no reviews for the food item have bee submitted, nothing will be returned.

No query parameters need to be supplied to this function, however, a limit and a LastEvaulatedKey can be supplied to paginated results.

* ### POST: /foodItems
<a name="post-foodItems"></a>

This endpoint is used for creating and storing new food items in the database. This endpoint expects a requests with a body containing the following fields:

```
{
    foodName: ...,          // The name of the food item.
    foodOrigin: ...,        // The email of the food item.
    foodAttributes:         // An object containing different attributes of the food item.
    {
        nutrients: ...,          // The nutritional information of the food item (calories, macros, etc).
        description: ...,        // The description of the food item.
    }
}
```

These fields determine the various values of the newly created food item. Both the nutrients and description found within the foodAttributes key can be empty, but the name, origin, and attributes must be supplied. Upon receiving a request, a UUID will be generated for the food item. 

This endpoint does not accept any query parameters and will return a 404 Bad Request error if any are supplied.

* ### PUT: /foodItems/{id}
<a name="put-foodItems/{id}"></a>

wasd

* ### DELETE: /foodItems/{id}
<a name="delete-foodItems/{id}"></a>

wasd

>## Menu Instances
<a name="menuInstances"></a>

* ### GET: /menuInstances
<a name="get-menuInstances"></a>

wasd

* ### GET: /menuInstances/{id}
<a name="get-menuInstances/{id}"></a>

wasd

* ### POST: /menuInstances
<a name="post-menuInstances"></a>

wasd

* ### PUT: /menuInstances/{id}
<a name="put-menuInstances/{id}"></a>

wasd

* ### DELETE: /menuInstances/{id}
<a name="delete-menuInstances/{id}"></a>

wasd