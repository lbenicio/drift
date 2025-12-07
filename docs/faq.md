# Frequently Asked Questions

Common questions and answers about Drift.

## General

### What is Drift?

Drift is a self-hosted alternative to GitHub Gist. It allows you to create, share, and manage code snippets and text files with syntax highlighting, password protection, and expiration options.

### How is Drift different from GitHub Gist?

| Feature             | Drift | GitHub Gist      |
| ------------------- | ----- | ---------------- |
| Self-hosted         | ✅    | ❌               |
| Password protection | ✅    | ❌               |
| Post expiration     | ✅    | ❌               |
| Custom domain       | ✅    | ❌               |
| Data ownership      | ✅    | ❌               |
| Multiple files      | ✅    | ✅               |
| Syntax highlighting | ✅    | ✅               |
| Free                | ✅    | ✅ (with limits) |

### Is Drift free?

Yes, Drift is open source and free to use under the GPL-3.0 license.

### What are the system requirements?

- Node.js 24 or higher
- PostgreSQL 16 or higher
- 512MB RAM minimum (1GB recommended)
- 1GB disk space

## Installation

### Can I use SQLite instead of PostgreSQL?

No, Drift requires PostgreSQL for its advanced features like JSON operations and full-text search.

### Do I need Docker?

No, Docker is optional. You can run Drift directly with Node.js and a PostgreSQL database.

### Can I run Drift on Raspberry Pi?

Yes, Drift supports ARM64 architecture. Use a Raspberry Pi 4 or newer with at least 2GB RAM.

### Which Node.js version should I use?

Node.js 24 or higher is required. We recommend using the latest LTS version.

## Authentication

### What authentication methods are supported?

- Username/password (built-in)
- GitHub OAuth
- GitLab OAuth
- Keycloak (OIDC)

### Can I disable registration?

Yes, set `REGISTRATION_DISABLED=true` in your environment variables.

### How do I reset a user's password?

Currently, users can reset their own passwords if they're logged in. Admin password reset is planned for a future release.

### Can I use LDAP/Active Directory?

Not directly, but you can use Keycloak as an OIDC provider and connect it to LDAP.

## Posts

### What's the maximum file size?

Default is 50MB per file, configurable via `DRIFT_MAX_FILE_SIZE` environment variable.

### Can posts have multiple files?

Yes, each post can contain multiple files with different languages.

### Do posts support Markdown?

Yes, Markdown files are automatically rendered with syntax highlighting for code blocks.

### Can I edit posts after creating them?

Yes, authors can edit their posts at any time unless the post has expired.

### What happens when a post expires?

Expired posts are no longer accessible. The data remains in the database but returns a 404 to users.

### Can I import from GitHub Gist?

Yes, use the "Import from Gist" feature in the new post form.

## Privacy & Security

### Is my data encrypted?

Data is encrypted in transit (HTTPS). Database encryption at rest depends on your PostgreSQL configuration.

### Who can see my posts?

By default, anyone with the link. You can:

- Add password protection
- Mark posts as "unlisted" (not shown in public listings)
- Make posts private (only visible to you)

### Can I delete my account?

Yes, go to Settings > Delete Account. This permanently removes all your data.

### Is there admin access to posts?

Admins can view and manage all posts through the admin panel. Private posts remain encrypted.

## Performance

### How many concurrent users can Drift handle?

With default settings:

- Single instance: ~100 concurrent users
- With Redis caching: ~500 concurrent users
- Scaled deployment: Thousands

### Should I use Redis?

Redis is optional but recommended for:

- Session storage in multi-instance deployments
- Rate limiting
- Caching frequently accessed posts

### How do I improve performance?

1. Enable Redis caching
2. Use a CDN for static assets
3. Scale horizontally with multiple instances
4. Optimize PostgreSQL settings
5. Enable compression in reverse proxy

## Troubleshooting

### Why can't I connect to the database?

Common causes:

1. Wrong connection string format
2. PostgreSQL not running
3. Firewall blocking port 5432
4. Wrong credentials

See [troubleshooting guide](administration/troubleshooting.md).

### Why is OAuth not working?

Check:

1. Callback URL matches exactly
2. Client ID and secret are correct
3. OAuth app is authorized
4. `DRIFT_URL` is set correctly

### Why are posts not rendering?

Possible issues:

1. Browser JavaScript disabled
2. Caching issues (clear cache)
3. Syntax highlighting failed (check console)

### How do I view logs?

```bash
# Docker
docker compose logs drift

# Systemd
journalctl -u drift

# PM2
pm2 logs drift
```

## Development

### How do I contribute?

See our [contributing guide](development/contributing.md). We welcome:

- Bug reports
- Feature requests
- Pull requests
- Documentation improvements

### How do I run tests?

```bash
# Unit tests
yarn test:unit

# All tests
yarn test
```

### How do I set up a development environment?

```bash
git clone https://github.com/MaxLeiter/drift.git
cd drift
yarn install
cp .env.example .env
# Edit .env with your settings
yarn dev
```

### Where can I get help?

- [GitHub Issues](https://github.com/MaxLeiter/drift/issues)
- [GitHub Discussions](https://github.com/MaxLeiter/drift/discussions)
- [Documentation](https://github.com/MaxLeiter/drift/tree/main/docs)

## Updates

### How do I update Drift?

See the [upgrade guide](upgrade-guide.md).

### How often are updates released?

We follow semantic versioning:

- **Patch releases** (x.x.X): Bug fixes, as needed
- **Minor releases** (x.X.x): New features, monthly
- **Major releases** (X.x.x): Breaking changes, yearly

### Do I need to update immediately?

Security updates should be applied promptly. Feature updates can wait for your maintenance window.

## Hosting

### Can I host Drift on Vercel/Netlify?

Drift requires a persistent PostgreSQL database, which serverless platforms don't natively support. You could use an external database, but a VPS or container platform is recommended.

### What hosting providers work well?

- **VPS:** DigitalOcean, Linode, Vultr, Hetzner
- **Container:** Railway, Fly.io, Render
- **Kubernetes:** Any managed K8s service
- **Self-hosted:** Docker on your own hardware

### How much does hosting cost?

Estimated monthly costs:

| Setup                   | Cost             |
| ----------------------- | ---------------- |
| Small VPS + managed DB  | $10-20           |
| Single VPS (all-in-one) | $5-10            |
| Self-hosted hardware    | Electricity only |
| Kubernetes cluster      | $50+             |

## Licensing

### Can I use Drift commercially?

Yes, the GPL-3.0 license allows commercial use. You must:

- Keep the source code available
- Include license notices
- Disclose modifications

### Can I modify Drift?

Yes, but you must:

- License modifications under GPL-3.0
- Make source code available if distributed
- Include original copyright notices

### Can I remove the Drift branding?

You can modify the branding for your deployment, but copyright notices must remain in the source code.
