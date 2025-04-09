# API Documentation

This document describes the REST API endpoints available in the Social Network Graph application.

## Base URL

All API endpoints are prefixed with `http://localhost:5000/api`

## Endpoints

### Graph Statistics

```http
GET /graph/stats
```

Returns basic statistics about the graph.

**Response:**

```json
{
  "num_vertices": 4039,
  "num_edges": 88234
}
```

### Get Neighbors

```http
GET /graph/neighbors/{user_id}
```

Returns the list of neighbors (friends) for a given user.

**Parameters:**

- `user_id` (path parameter): The ID of the user

**Response:**

```json
{
  "neighbors": [1, 2, 3, 4, 5]
}
```

### Get Recommendations

```http
GET /graph/recommendations/{user_id}
```

Returns friend recommendations for a given user.

**Parameters:**

- `user_id` (path parameter): The ID of the user
- `num` (query parameter): Number of recommendations to return (default: 5)

**Response:**

```json
{
  "recommendations": [6, 7, 8, 9, 10]
}
```

### Get Shortest Path

```http
GET /graph/shortest-path
```

Returns the shortest path between two users.

**Parameters:**

- `start` (query parameter): Starting user ID
- `end` (query parameter): Ending user ID

**Response:**

```json
{
  "path": [1, 2, 3, 4, 5]
}
```

### Get Communities

```http
GET /graph/communities
```

Returns the detected communities in the graph.

**Response:**

```json
{
  "communities": [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12]
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Error message describing the issue"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```
