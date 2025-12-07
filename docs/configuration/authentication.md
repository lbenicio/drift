# Authentication Configuration

Drift supports multiple authentication providers. This guide covers setup for each option.

## Overview

| Provider     | Use Case                      | Registration Password Compatible |
| ------------ | ----------------------------- | -------------------------------- |
| Credentials  | Traditional username/password | ✅ Yes                           |
| GitHub OAuth | Developer communities         | ❌ No                            |
| Keycloak     | Enterprise SSO                | ❌ No                            |

## Credential Authentication

The default authentication method using username and password.

### Configuration

```bash
CREDENTIAL_AUTH="true"
```

### Features

- Username/password registration
- Works with registration password protection
- No external dependencies
- Passwords hashed with bcrypt

### Security Recommendations

1. Enforce strong passwords (application does not currently enforce)
1. Use HTTPS in production
1. Consider rate limiting login attempts
1. Enable registration password for private instances

## GitHub OAuth

Allow users to sign in with their GitHub accounts.

### Prerequisites

- GitHub account
- Drift accessible via public URL (for callback)

### Setup Steps

#### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
1. Click **"OAuth Apps"** → **"New OAuth App"**
1. Fill in the form:

| Field                      | Value                                                    |
| -------------------------- | -------------------------------------------------------- |
| Application name           | `Drift` (or your instance name)                          |
| Homepage URL               | `https://your-drift-domain.com`                          |
| Authorization callback URL | `https://your-drift-domain.com/api/auth/callback/github` |

1. Click **"Register application"**
1. Copy the **Client ID**
1. Click **"Generate a new client secret"**
1. Copy the **Client Secret**

#### 2. Configure Environment

```bash
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

#### 3. Restart Drift

The GitHub login option will appear on the sign-in page.

### Troubleshooting GitHub OAuth

**Error: Callback URL mismatch**

- Verify the callback URL exactly matches: `{DRIFT_URL}/api/auth/callback/github`
- Check for trailing slashes
- Ensure HTTPS if your domain uses HTTPS

**Error: Application suspended**

- Check GitHub OAuth app status in developer settings
- Verify rate limits haven't been exceeded

## Keycloak OAuth

Enterprise single sign-on with Keycloak.

### Prerequisites

- Keycloak server (self-hosted or cloud)
- Admin access to create clients
- Drift accessible via public URL

### Setup Steps

#### 1. Create Keycloak Client

1. Log into Keycloak Admin Console
1. Select your realm (or create one)
1. Navigate to **Clients** → **Create client**
1. Configure the client:

| Setting         | Value                           |
| --------------- | ------------------------------- |
| Client ID       | `drift`                         |
| Client Protocol | `openid-connect`                |
| Root URL        | `https://your-drift-domain.com` |

1. On the next screen:
    - Enable **Client authentication**
    - Enable **Standard flow**
1. Save and go to **Credentials** tab
1. Copy the **Client Secret**

#### 2. Configure Valid Redirect URIs

Add: `https://your-drift-domain.com/api/auth/callback/keycloak`

#### 3. Configure Environment

```bash
KEYCLOAK_ID="drift"
KEYCLOAK_SECRET="your-client-secret"
KEYCLOAK_ISSUER="https://keycloak.example.com/realms/your-realm"
KEYCLOAK_NAME="Company SSO"
```

| Variable          | Description               |
| ----------------- | ------------------------- |
| `KEYCLOAK_ID`     | Client ID from step 1     |
| `KEYCLOAK_SECRET` | Client secret from step 1 |
| `KEYCLOAK_ISSUER` | Full URL to your realm    |
| `KEYCLOAK_NAME`   | Button text on login page |

#### 4. Restart Drift

The Keycloak login option will appear as the configured name.

### Keycloak User Attributes

Drift uses these claims from Keycloak:

| Claim                | Usage        |
| -------------------- | ------------ |
| `sub`                | User ID      |
| `email`              | User email   |
| `name`               | Display name |
| `preferred_username` | Username     |

### Troubleshooting Keycloak

**Error: Invalid issuer**

- Verify `KEYCLOAK_ISSUER` includes `/realms/your-realm`
- Check realm name spelling

**Error: Invalid client credentials**

- Regenerate client secret in Keycloak
- Update `KEYCLOAK_SECRET`

## Multiple Providers

You can enable multiple authentication providers simultaneously.

```bash
# Enable all providers
CREDENTIAL_AUTH="true"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
KEYCLOAK_ID="..."
KEYCLOAK_SECRET="..."
KEYCLOAK_ISSUER="..."
KEYCLOAK_NAME="SSO"
```

Users will see all available options on the sign-in page.

### Account Linking

Currently, accounts from different providers are **not automatically linked**.
A user signing in with GitHub and Credentials will have two separate accounts,
even if they use the same email.

## Registration Password

Restrict new registrations with a passcode.

```bash
REGISTRATION_PASSWORD="your-secret-passcode"
```

### Behavior

- Users must enter the passcode during registration
- Only works with Credential authentication
- OAuth providers bypass the registration password

### Use Cases

- Private team instances
- Beta testing
- Invite-only communities

## Session Configuration

Sessions are managed by NextAuth.js with these defaults:

| Setting          | Value    |
| ---------------- | -------- |
| Session strategy | JWT      |
| Session max age  | 30 days  |
| Update age       | 24 hours |

### Customizing Sessions

Session behavior is configured in `src/lib/server/auth.ts`.

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Configure CORS appropriately
- [ ] Enable registration password for private instances
- [ ] Review OAuth app permissions
- [ ] Keep dependencies updated
- [ ] Monitor authentication logs
