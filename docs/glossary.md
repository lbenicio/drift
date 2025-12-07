# Glossary

Technical terms and concepts used in Drift documentation.

## A

### API (Application Programming Interface)

A set of endpoints that allow external applications to interact with Drift programmatically.

### Authentication

The process of verifying a user's identity, typically through username/password or OAuth providers.

### Authorization

The process of determining what actions an authenticated user can perform.

## B

### Bearer Token

A type of access token used in API authentication. Sent in the `Authorization` header.

## C

### CDN (Content Delivery Network)

A distributed network of servers that delivers content to users based on geographic location. Used for serving static assets quickly.

### Container

A lightweight, standalone executable package that includes everything needed to run an application. Drift uses Docker containers.

### CORS (Cross-Origin Resource Sharing)

A security mechanism that allows or restricts web applications from making requests to different domains.

### CSRF (Cross-Site Request Forgery)

An attack that tricks users into executing unwanted actions. Drift implements CSRF protection on all forms.

## D

### Database Migration

The process of updating database schema to match application changes. Managed through Prisma.

### Docker

A platform for developing, shipping, and running applications in containers.

### Docker Compose

A tool for defining and running multi-container Docker applications using YAML configuration.

## E

### Environment Variable

A dynamic value that affects application behavior. Configured in `.env` files or system settings.

### Expiration

A feature that automatically makes posts inaccessible after a specified time period.

## G

### Gist

A simple way to share code snippets. Drift is a self-hosted alternative to GitHub Gist.

### GPG (GNU Privacy Guard)

A tool for encryption and signing. Can be used for commit verification.

## H

### Health Check

An endpoint or process that verifies application status. Used by load balancers and monitoring systems.

### HSTS (HTTP Strict Transport Security)

A security header that forces browsers to use HTTPS connections.

## I

### Instance

A single running copy of the Drift application.

## J

### JWT (JSON Web Token)

A compact, URL-safe token format used for authentication and information exchange.

## K

### Kubernetes

An open-source container orchestration platform. Can be used to deploy Drift at scale.

## L

### Load Balancer

A device or service that distributes network traffic across multiple servers.

### LTS (Long Term Support)

A version of software that receives extended maintenance and security updates.

## M

### Middleware

Software that sits between requests and responses, processing or modifying data.

### Migration

See "Database Migration."

## N

### Next.js

A React framework used by Drift for server-side rendering and API routes.

### Node.js

A JavaScript runtime environment that Drift runs on.

## O

### OAuth

An open standard for access delegation. Used by Drift for GitHub/GitLab authentication.

### OCI (Open Container Initiative)

A set of standards for container formats and runtimes. Drift images are OCI-compliant.

### OIDC (OpenID Connect)

An authentication layer built on OAuth 2.0. Used for Keycloak integration.

### ORM (Object-Relational Mapping)

A technique for converting data between incompatible type systems. Drift uses Prisma ORM.

## P

### Post

The primary content unit in Drift. A post contains one or more files with optional metadata.

### PostgreSQL

A powerful open-source relational database. Required for Drift.

### Prisma

A modern database toolkit and ORM used by Drift.

### Private Post

A post visible only to its creator.

### Public Post

A post accessible to anyone with the link.

## R

### Rate Limiting

A technique to control request frequency to prevent abuse.

### React

A JavaScript library for building user interfaces. Drift's frontend is built with React.

### Redis

An in-memory data store. Optional for Drift caching and session storage.

### Reverse Proxy

A server that forwards client requests to backend servers. Examples: Nginx, Caddy, Traefik.

### RSC (React Server Components)

A React feature that allows components to render on the server. Used extensively in Drift.

## S

### Schema

The structure definition of a database or API. Drift's database schema is defined in Prisma.

### Self-hosted

Software that you run on your own infrastructure rather than using a cloud service.

### Session

A period of interaction between a user and the application, typically managed through cookies.

### SSR (Server-Side Rendering)

Rendering web pages on the server before sending to the client.

### Syntax Highlighting

The visual differentiation of code elements using colors and styles.

## T

### TLS (Transport Layer Security)

A cryptographic protocol for secure communications. Powers HTTPS.

### Token

A piece of data used for authentication or authorization.

## U

### Unlisted Post

A post that doesn't appear in public listings but is accessible via direct link.

### UUID (Universally Unique Identifier)

A 128-bit identifier used for posts and other resources.

## V

### VPS (Virtual Private Server)

A virtual machine sold as a service. Common deployment target for Drift.

## W

### Webhook

An HTTP callback triggered by an event. Used for notifications and integrations.

### WebSocket

A protocol for full-duplex communication over a single TCP connection.

## Y

### Yarn

A package manager for JavaScript. Drift uses Yarn 4.

### YAML (YAML Ain't Markup Language)

A human-readable data serialization format used for configuration files.
