# Admin Panel Guide

Manage users, posts, and system settings through Drift's admin panel.

## Enabling Admin Features

### First Admin User

Set the environment variable before the first user registers:

```bash
ENABLE_ADMIN=true
```

The first user to register becomes an administrator.

### Promoting Existing Users

Currently, admin promotion must be done via database:

```sql
UPDATE users SET role = 'admin' WHERE username = 'target_user';
```

## Accessing the Admin Panel

Navigate to `/admin` while logged in as an admin user.

## User Management

### Viewing Users

The admin panel displays:

| Field    | Description              |
| -------- | ------------------------ |
| Username | User's unique identifier |
| Email    | User's email address     |
| Role     | `user` or `admin`        |
| Created  | Registration date        |
| Posts    | Number of posts created  |

### User Actions

#### Change User Role

1. Find user in the list
1. Select new role from dropdown
1. Click "Update"

Available roles:

- `user` - Standard user
- `admin` - Full administrative access

#### Delete User

1. Find user in the list
1. Click "Delete" button
1. Confirm deletion

⚠️ **Warning:** Deleting a user also deletes all their posts and files.

### Bulk Operations

Currently not supported via UI. Use database queries for bulk operations:

```sql
-- Delete inactive users (no posts, >1 year old)
DELETE FROM users
WHERE id NOT IN (SELECT DISTINCT "authorId" FROM posts)
AND "createdAt" < NOW() - INTERVAL '1 year';
```

## Post Management

### Viewing Posts

Admin can see all posts regardless of visibility:

| Visibility         | Normal Users  | Admin |
| ------------------ | ------------- | ----- |
| Public             | ✅            | ✅    |
| Unlisted           | Via link only | ✅    |
| Private            | ❌            | ✅    |
| Password-protected | With password | ✅    |

### Post Actions

#### Delete Post

1. Navigate to the post
1. Click "Delete" (admin sees this on all posts)
1. Confirm deletion

#### View Post Details

Admin can see:

- Author information
- Creation/update timestamps
- View count
- All files in the post

### Expired Posts

Expired posts are automatically hidden but not deleted. Admin can:

- View expired posts
- Extend expiration
- Delete expired posts

## System Overview

### Statistics Dashboard

The admin panel shows:

- Total users
- Total posts
- Posts by visibility
- Recent activity

### Database Health

Monitor database status:

```bash
# Check connection
yarn prisma db pull

# View database size
docker exec drift-db psql -U drift -c "SELECT pg_size_pretty(pg_database_size('drift'));"
```

## Common Admin Tasks

### Cleaning Up Spam

```sql
-- Find posts with suspicious content
SELECT id, title, "authorId"
FROM posts
WHERE title LIKE '%spam%'
OR title LIKE '%http%';

-- Delete spam posts
DELETE FROM posts WHERE id IN ('post_id_1', 'post_id_2');
```

### Finding Large Posts

```sql
-- Posts with most files
SELECT p.id, p.title, COUNT(f.id) as file_count
FROM posts p
JOIN files f ON f."postId" = p.id
GROUP BY p.id
ORDER BY file_count DESC
LIMIT 10;

-- Largest files
SELECT id, title, LENGTH(content) as size
FROM files
ORDER BY size DESC
LIMIT 10;
```

### User Activity Report

```sql
SELECT
  u.username,
  COUNT(p.id) as post_count,
  MAX(p."createdAt") as last_post
FROM users u
LEFT JOIN posts p ON p."authorId" = u.id
GROUP BY u.id
ORDER BY post_count DESC;
```

## Security Considerations

### Admin Account Security

1. Use strong, unique password
1. Enable 2FA if available (future feature)
1. Don't share admin credentials
1. Audit admin actions regularly

### Principle of Least Privilege

- Only grant admin to users who need it
- Regularly review admin accounts
- Remove admin from inactive users

### Audit Logging

Currently, admin actions are not logged separately.
Consider enabling database audit logging:

```sql
-- PostgreSQL audit extension
CREATE EXTENSION IF NOT EXISTS pgaudit;
```

## API Access

Admin users have additional API capabilities:

### List All Users

```bash
GET /api/admin?action=users
Authorization: Bearer <token>
```

### List All Posts

```bash
GET /api/admin?action=posts
Authorization: Bearer <token>
```

### Delete User

```bash
DELETE /api/admin?action=delete-user&userId=<id>
Authorization: Bearer <token>
```

### Delete Post

```bash
DELETE /api/admin?action=delete-post&postId=<id>
Authorization: Bearer <token>
```

## Troubleshooting

### Can't Access Admin Panel

1. Verify `ENABLE_ADMIN=true` is set
1. Check your user role in database
1. Clear browser cache
1. Check server logs

### Admin Actions Failing

1. Check database connectivity
1. Verify permissions on tables
1. Check for foreign key constraints
1. Review server error logs

### Lost Admin Access

If all admin accounts are lost:

```sql
-- Promote a user to admin via database
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

Or create a new admin account and set role in database.
