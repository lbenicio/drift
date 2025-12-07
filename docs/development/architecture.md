# Architecture Overview

Understanding Drift's project structure and design decisions.

## Technology Stack

| Layer         | Technology            | Purpose               |
| ------------- | --------------------- | --------------------- |
| Frontend      | Next.js 16 + React 19 | UI rendering, routing |
| Backend       | Next.js API Routes    | REST API endpoints    |
| Database      | PostgreSQL + Prisma   | Data persistence      |
| Auth          | NextAuth.js           | Authentication        |
| Styling       | Tailwind CSS v4       | Utility-first CSS     |
| UI Components | shadcn/ui + Radix     | Accessible components |

## Directory Structure

```plaintext
drift/
├── docs/                    # Documentation
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Prisma schema definition
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── src/
│   ├── api/                 # Legacy API routes (Pages Router)
│   ├── app/                 # Next.js App Router
│   │   ├── (drift)/         # Main application routes
│   │   │   ├── (auth)/      # Authentication pages
│   │   │   ├── (posts)/     # Post-related pages
│   │   │   ├── admin/       # Admin panel
│   │   │   └── settings/    # User settings
│   │   ├── api/             # App Router API routes
│   │   └── components/      # React components
│   └── lib/                 # Shared utilities
│       ├── server/          # Server-only code
│       └── api-middleware/  # API middleware
├── tests/                   # Test files
│   └── lib/                 # Unit tests
├── .github/workflows/       # CI/CD pipelines
└── tools/                   # Development scripts
```

## Application Layers

### Presentation Layer

Components and pages that render the UI.

```plaintext
src/app/components/
├── button/           # Button variants
├── card/             # Card containers
├── header/           # Navigation header
├── input/            # Form inputs
├── post-list/        # Post listing
└── ...
```

**Key patterns:**

- Server Components by default (RSC)
- Client Components only when needed (`"use client"`)
- Composition over inheritance
- Radix primitives for accessibility

### Business Logic Layer

Server-side logic and API endpoints.

```plaintext
src/lib/server/
├── auth.ts           # Authentication config
├── prisma.ts         # Database client
├── session.ts        # Session management
└── ...

src/api/
├── admin/            # Admin endpoints
├── post/             # Post CRUD
├── user/             # User operations
└── file/             # File operations
```

### Data Layer

Database schema and access patterns.

```plaintext
prisma/
├── schema.prisma     # Data models
└── migrations/       # Schema changes
```

## Data Models

### Core Entities

```plaintext
┌─────────────────┐
│      User       │
├─────────────────┤
│ id              │
│ username        │
│ email           │
│ role            │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐     ┌─────────────────┐
│      Post       │────▶│      File       │
├─────────────────┤ 1:N ├─────────────────┤
│ id              │     │ id              │
│ title           │     │ title           │
│ visibility      │     │ content (bytes) │
│ password        │     │ html (bytes)    │
│ expiresAt       │     │ sha             │
└─────────────────┘     └─────────────────┘
```

### Visibility Types

| Type        | Accessible By    |
| ----------- | ---------------- |
| `public`    | Everyone         |
| `unlisted`  | Anyone with link |
| `private`   | Author only      |
| `protected` | With password    |

## Authentication Flow

```plaintext
┌─────────┐     ┌───────────┐     ┌──────────┐
│ Browser │────▶│ NextAuth  │────▶│ Provider │
│         │◀────│           │◀────│(GitHub)  │
└─────────┘     └───────────┘     └──────────┘
                      │
                      ▼
               ┌────────────┐
               │ PostgreSQL │
               │  (Session) │
               └────────────┘
```

Supported providers:

- Credentials (username/password)
- GitHub OAuth
- Keycloak OIDC

## Request Flow

### Page Request

```plaintext
Browser
   │
   ▼
Next.js Router
   │
   ├──▶ Layout.tsx (server)
   │
   ├──▶ Page.tsx (server)
   │         │
   │         ▼
   │    Prisma Query
   │         │
   │         ▼
   │    PostgreSQL
   │
   ▼
HTML Response
```

### API Request

```plaintext
Client
   │
   ▼
API Route Handler
   │
   ├──▶ Auth Middleware
   │
   ├──▶ Validation
   │
   ├──▶ Business Logic
   │         │
   │         ▼
   │    Prisma Query
   │
   ▼
JSON Response
```

## Key Design Decisions

### Server Components First

Most components are Server Components for:

- Reduced JavaScript bundle size
- Direct database access
- Better SEO
- Faster initial load

Client Components used only for:

- Interactivity (forms, buttons)
- Browser APIs
- React hooks (useState, useEffect)

### File Storage

Files are stored in the database (not filesystem):

- Pros: Simpler deployment, atomic transactions
- Cons: Database size grows with content
- Content stored as bytes for binary safety
- HTML pre-rendered for faster serving

### API Design

REST-style API with Next.js routes:

```plaintext
GET    /api/post/[id]        # Get post
POST   /api/post             # Create post
PUT    /api/post/[id]        # Update post
DELETE /api/post/[id]        # Delete post
```

### Styling Approach

- Tailwind CSS for utility classes
- CSS variables for theming
- shadcn/ui for pre-built components
- No CSS-in-JS runtime

## Extending Drift

### Adding a New Page

1. Create route directory: `src/app/(drift)/new-page/`
1. Add `page.tsx` with default export
1. Use existing components from `src/app/components/`

### Adding an API Endpoint

1. Create handler in `src/api/` or `src/app/api/`
1. Use `withMethods` middleware for HTTP method validation
1. Add authentication check if needed

### Adding a Database Field

1. Modify `prisma/schema.prisma`
1. Run `yarn prisma migrate dev --name description`
1. Update related queries and UI

### Adding a Component

1. Create in `src/app/components/new-component/`
1. Export from `index.tsx`
1. Use composition and props for flexibility

## Performance Considerations

### Caching

- ISR (Incremental Static Regeneration) for posts
- SWR for client-side data fetching
- Database query result caching (future)

### Bundle Size

- Dynamic imports for heavy components
- Server Components reduce client JS
- Tree-shaking via ES modules

### Database

- Connection pooling via Prisma
- Indexed fields for common queries
- Eager loading to prevent N+1

## Security Model

### Authentication

- JWT sessions via NextAuth
- Secure cookie storage
- CSRF protection built-in

### Authorization

- Route-level auth checks
- API middleware validation
- Row-level security in queries

### Data Protection

- Passwords hashed with bcrypt
- XSS prevention via React
- SQL injection prevented by Prisma
