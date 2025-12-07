# API Reference

REST API documentation for Drift.

## Base URL

```plaintext
https://your-drift-instance.com/api
```

## Authentication

### Session-Based

Most endpoints require an active session. Sessions are created via:

- `/api/auth/signin` - Credential login
- OAuth callback - GitHub/Keycloak

### API Tokens

For programmatic access, use API tokens:

```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://drift.example.com/api/post
```

Generate tokens at `/settings` → API Tokens.

## Endpoints

### Posts

#### List Posts

```http
GET /api/post
```

Query parameters:

| Parameter    | Type   | Description                  |
| ------------ | ------ | ---------------------------- |
| `page`       | number | Page number (default: 1)     |
| `limit`      | number | Items per page (default: 20) |
| `visibility` | string | Filter by visibility         |

Response:

```json
{
    "posts": [
        {
            "id": "clx...",
            "title": "My Post",
            "visibility": "public",
            "createdAt": "2024-01-15T10:30:00.000Z",
            "files": [
                {
                    "id": "cly...",
                    "title": "main.js"
                }
            ],
            "author": {
                "id": "clz...",
                "username": "user123"
            }
        }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
}
```

#### Get Post

```http
GET /api/post/[id]
```

Response:

```json
{
    "id": "clx...",
    "title": "My Post",
    "visibility": "public",
    "description": "A description",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z",
    "expiresAt": null,
    "files": [
        {
            "id": "cly...",
            "title": "main.js",
            "content": "console.log('hello');",
            "html": "<pre>...</pre>"
        }
    ],
    "author": {
        "id": "clz...",
        "username": "user123",
        "displayName": "User"
    }
}
```

#### Create Post

```http
POST /api/post
Content-Type: application/json
```

Request body:

```json
{
    "title": "My Post",
    "visibility": "public",
    "description": "Optional description",
    "expiresAt": "2024-02-15T00:00:00.000Z",
    "password": "optional-for-protected",
    "files": [
        {
            "title": "main.js",
            "content": "console.log('hello');"
        }
    ]
}
```

Response: Created post object (same as GET)

#### Update Post

```http
PUT /api/post/[id]
Content-Type: application/json
```

Request body: Same as create (partial updates supported)

#### Delete Post

```http
DELETE /api/post/[id]
```

Response:

```json
{
    "success": true
}
```

### Files

#### Get File

```http
GET /api/file/[id]
```

Response:

```json
{
    "id": "cly...",
    "title": "main.js",
    "content": "console.log('hello');",
    "html": "<pre>...</pre>",
    "sha": "abc123...",
    "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### Get Raw File Content

```http
GET /api/file/raw/[id]
```

Response: Plain text file content

```javascript
console.log("hello");
```

### Users

#### Get Current User

```http
GET /api/user
```

Response:

```json
{
    "id": "clz...",
    "username": "user123",
    "email": "user@example.com",
    "displayName": "User",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update User

```http
PUT /api/user/[userId]
Content-Type: application/json
```

Request body:

```json
{
    "displayName": "New Display Name"
}
```

#### Get User Posts

```http
GET /api/user/[userId]/posts
```

Query parameters:

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `page`    | number | Page number    |
| `limit`   | number | Items per page |

### Admin (Admin Only)

#### List All Users

```http
GET /api/admin?action=users
```

#### List All Posts

```http
GET /api/admin?action=posts
```

#### Set User Role

```http
POST /api/admin?action=set-role
Content-Type: application/json
```

```json
{
    "userId": "clz...",
    "role": "admin"
}
```

#### Delete User (Admin)

```http
DELETE /api/admin?action=delete-user&userId=clz...
```

#### Delete Post (Admin)

```http
DELETE /api/admin?action=delete-post&postId=clx...
```

### Authentication

#### Sign In (Credentials)

```http
POST /api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded
```

```plaintext
username=user123&password=secret
```

#### Sign Out

```http
POST /api/auth/signout
```

#### Get Session

```http
GET /api/auth/session
```

Response:

```json
{
    "user": {
        "id": "clz...",
        "name": "User",
        "email": "user@example.com"
    },
    "expires": "2024-02-15T00:00:00.000Z"
}
```

### API Tokens

#### List Tokens

```http
GET /api/user/tokens
```

#### Create Token

```http
POST /api/user/tokens
Content-Type: application/json
```

```json
{
    "name": "My API Token",
    "expiresAt": "2025-01-01T00:00:00.000Z"
}
```

#### Delete Token

```http
DELETE /api/user/tokens/[tokenId]
```

## Error Responses

All errors follow this format:

```json
{
    "error": "Error message",
    "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Description  |
| ---- | ------------ |
| 200  | Success      |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 500  | Server Error |

### Common Error Codes

| Code               | Description             |
| ------------------ | ----------------------- |
| `UNAUTHORIZED`     | Not logged in           |
| `FORBIDDEN`        | No permission           |
| `NOT_FOUND`        | Resource not found      |
| `VALIDATION_ERROR` | Invalid input           |
| `POST_EXPIRED`     | Post has expired        |
| `WRONG_PASSWORD`   | Incorrect post password |

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting
at the reverse proxy level for production use.

## Pagination

List endpoints support pagination:

```http
GET /api/post?page=2&limit=10
```

Response includes:

```json
{
  "items": [...],
  "total": 100,
  "page": 2,
  "limit": 10,
  "totalPages": 10
}
```

## Webhooks (Future)

Webhook support is planned for future releases.

## SDK Examples

### JavaScript/Node.js

```javascript
const API_URL = "https://drift.example.com/api";
const TOKEN = "your-api-token";

// Get posts
async function getPosts() {
    const response = await fetch(`${API_URL}/post`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });
    return response.json();
}

// Create post
async function createPost(title, files) {
    const response = await fetch(`${API_URL}/post`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            visibility: "public",
            files,
        }),
    });
    return response.json();
}
```

### Python

```python
import requests

API_URL = 'https://drift.example.com/api'
TOKEN = 'your-api-token'

headers = {
    'Authorization': f'Bearer {TOKEN}'
}

# Get posts
response = requests.get(f'{API_URL}/post', headers=headers)
posts = response.json()

# Create post
post_data = {
    'title': 'My Post',
    'visibility': 'public',
    'files': [
        {'title': 'main.py', 'content': 'print("hello")'}
    ]
}
response = requests.post(f'{API_URL}/post', json=post_data, headers=headers)
```

### cURL

```bash
# Get posts
curl -H "Authorization: Bearer $TOKEN" \
  https://drift.example.com/api/post

# Create post
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","visibility":"public","files":[{"title":"test.txt","content":"hello"}]}' \
  https://drift.example.com/api/post
```
