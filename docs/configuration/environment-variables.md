# Environment Variables Reference

Complete reference for all Drift configuration options.

## Required Variables

These variables must be set for Drift to function properly.

### DATABASE_URL

PostgreSQL connection string.

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/drift"
```

**Format:** `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

| Component  | Description                                             |
| ---------- | ------------------------------------------------------- |
| `USER`     | PostgreSQL username                                     |
| `PASSWORD` | PostgreSQL password (URL-encoded if special characters) |
| `HOST`     | Database server hostname                                |
| `PORT`     | PostgreSQL port (default: 5432)                         |
| `DATABASE` | Database name                                           |

**Connection String Options:**

```bash
# With SSL
DATABASE_URL="postgresql://user:pass@host:5432/drift?sslmode=require"

# With connection pooling (Prisma Accelerate)
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

### NEXTAUTH_SECRET

Secret key for NextAuth.js session encryption. **Must be a secure random string.**

```bash
# Generate a secure secret
openssl rand -base64 32
```

```bash
NEXTAUTH_SECRET="your-32-character-or-longer-secret"
```

⚠️ **Warning:** Never use the example values in production. Always generate a unique secret.

## Application Settings

### DRIFT_URL

The public URL where Drift is accessible.

```bash
DRIFT_URL="https://drift.example.com"
```

- Used for generating shareable links
- Required for OAuth callbacks
- Falls back to `VERCEL_URL` if on Vercel

### NEXTAUTH_URL

NextAuth.js base URL. Usually the same as `DRIFT_URL`.

```bash
NEXTAUTH_URL="https://drift.example.com"
```

📝 **Note:** On Vercel, this is automatically set.

## Customization

### WELCOME_TITLE

Title displayed on the homepage welcome card.

```bash
WELCOME_TITLE="Welcome to Drift"
```

**Default:** `"Drift"`

### WELCOME_CONTENT

Markdown content for the homepage welcome message.

```bash
WELCOME_CONTENT="## Welcome!\n\nThis is my Drift instance."
```

Supports full GitHub Flavored Markdown including:

- Headers, lists, code blocks
- Links and images
- Tables
- Task lists

### ENABLE_ADMIN

Enable admin functionality for the first registered user.

```bash
ENABLE_ADMIN="true"
```

**Default:** `"false"`

When enabled, the first user to register becomes an administrator with access to:

- User management
- Post moderation
- System settings

### REGISTRATION_PASSWORD

Optional passcode required to register new accounts.

```bash
REGISTRATION_PASSWORD="secret-invite-code"
```

**Default:** Empty (open registration)

Use cases:

- Private instances
- Invite-only communities
- Testing environments

⚠️ **Note:** Currently incompatible with OAuth providers.

## Authentication Providers

### Credential Authentication

Traditional username/password authentication.

```bash
CREDENTIAL_AUTH="true"
```

**Default:** `"true"`

### GitHub OAuth

Enable GitHub as an authentication provider.

```bash
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**Setup Instructions:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
1. Click "New OAuth App"
1. Set Authorization callback URL to: `{DRIFT_URL}/api/auth/callback/github`
1. Copy Client ID and Client Secret

### Keycloak OAuth

Enterprise SSO with Keycloak.

```bash
KEYCLOAK_ID="drift-client"
KEYCLOAK_SECRET="your-keycloak-client-secret"
KEYCLOAK_ISSUER="https://keycloak.example.com/realms/your-realm"
KEYCLOAK_NAME="Company SSO"
```

| Variable          | Description                  |
| ----------------- | ---------------------------- |
| `KEYCLOAK_ID`     | Client ID in Keycloak        |
| `KEYCLOAK_SECRET` | Client secret                |
| `KEYCLOAK_ISSUER` | Full realm URL               |
| `KEYCLOAK_NAME`   | Display name on login button |

## Build-time Variables

### SKIP_ENV_VALIDATION

Skip environment validation during build.

```bash
SKIP_ENV_VALIDATION="true"
```

**Default:** `"false"`

Use when building Docker images or in CI/CD pipelines where the database
is not available during build.

### NODE_ENV

Node.js environment.

```bash
NODE_ENV="production"
```

**Values:** `"development"`, `"production"`, `"test"`

## Complete Example

```bash
# ===================
# Required
# ===================
DATABASE_URL="postgresql://drift:secretpassword@localhost:5432/drift"
NEXTAUTH_SECRET="super-secret-key-change-this-in-production"

# ===================
# Application
# ===================
DRIFT_URL="https://drift.example.com"
NEXTAUTH_URL="https://drift.example.com"

# ===================
# Customization
# ===================
WELCOME_TITLE="My Drift Instance"
WELCOME_CONTENT="## Welcome\n\nShare code snippets securely."
ENABLE_ADMIN="true"
REGISTRATION_PASSWORD=""

# ===================
# Authentication
# ===================
CREDENTIAL_AUTH="true"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Keycloak (optional)
KEYCLOAK_ID=""
KEYCLOAK_SECRET=""
KEYCLOAK_ISSUER=""
KEYCLOAK_NAME="SSO"
```

## Environment Variable Precedence

1. Shell environment variables (highest priority)
1. `.env.local` file
1. `.env` file
1. Default values (lowest priority)

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
1. **Use secrets management** - Consider Vault, AWS Secrets Manager, etc.
1. **Rotate secrets regularly** - Especially `NEXTAUTH_SECRET`
1. **Use strong passwords** - For database and registration
1. **Restrict database access** - Use firewalls and VPCs
