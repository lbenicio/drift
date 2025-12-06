# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Drift seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories**: Use [GitHub's private vulnerability reporting](https://github.com/lbenicio/drift/security/advisories/new) to report the issue directly.

2. **Email**: Send details to the repository maintainer (check the repository for contact information).

### What to Include

When reporting a vulnerability, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any possible mitigations you've identified
- Your name/handle for attribution (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours.
- **Updates**: We will keep you informed of our progress toward fixing the vulnerability.
- **Resolution**: We aim to resolve critical vulnerabilities within 7 days and other vulnerabilities within 30 days.
- **Disclosure**: We will coordinate with you on the public disclosure timeline.

## Security Best Practices for Self-Hosting

If you're self-hosting Drift, please follow these security best practices:

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique values for `NEXTAUTH_SECRET`
- Rotate secrets periodically
- Use environment-specific configurations

### Database

- Use strong passwords for database access
- Restrict database network access to only necessary services
- Enable SSL/TLS for database connections in production
- Regularly backup your database

### Authentication

- Configure rate limiting for authentication endpoints
- Use HTTPS in production
- Consider enabling additional authentication providers (GitHub, Keycloak)
- Set secure session configurations

### Deployment

- Keep all dependencies up to date
- Use the latest stable Node.js LTS version
- Run the application with minimal privileges
- Use a reverse proxy (nginx, Caddy) with proper security headers
- Enable CORS restrictions appropriate for your deployment

### Docker

If using Docker:

- Use official base images
- Don't run containers as root
- Scan images for vulnerabilities
- Keep images updated

## Security Updates

Security updates will be released as patch versions. We recommend:

1. Watching this repository for releases
2. Subscribing to security advisories
3. Regularly updating your deployment

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged (with permission) in our release notes.
