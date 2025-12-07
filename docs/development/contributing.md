# Contributing Guide

How to contribute to Drift development.

## Getting Started

### Prerequisites

- Node.js 24+
- PostgreSQL 16+
- Git
- VS Code (recommended)

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/drift.git
cd drift

# Enable corepack for Yarn 4
corepack enable

# Install dependencies
yarn install

# Set up environment
cp .env.example .env
# Edit .env with your local database settings

# Generate Prisma client
yarn prisma generate

# Run migrations
yarn prisma migrate dev

# Start development server
yarn start:dev
```

### VS Code Setup

Install recommended extensions when prompted, or manually:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

## Development Workflow

### Branch Naming

```plaintext
feature/description    # New features
fix/description        # Bug fixes
docs/description       # Documentation
refactor/description   # Code refactoring
```

### Commit Messages

Follow conventional commits:

```plaintext
feat: add dark mode toggle
fix: resolve login redirect issue
docs: update API documentation
refactor: simplify auth middleware
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `main`
1. Make changes with tests
1. Ensure all checks pass
1. Submit PR with description
1. Address review feedback
1. Squash and merge

## Code Style

### TypeScript

- Strict mode enabled
- Explicit types for function signatures
- Avoid `any` type

```typescript
// Good
function createPost(title: string, files: File[]): Promise<Post> {
    // ...
}

// Avoid
function createPost(title: any, files: any): any {
    // ...
}
```

### React Components

- Functional components with hooks
- Server Components by default
- `"use client"` only when needed

```typescript
// Server Component (default)
export default async function PostList() {
  const posts = await getPosts();
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}

// Client Component (when interactivity needed)
"use client";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Formatting

Prettier handles formatting. Config in `.prettierrc`:

```json
{
    "semi": true,
    "singleQuote": false,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 150
}
```

Run formatter:

```bash
yarn fmt:lint
```

### Linting

ESLint catches errors and enforces patterns:

```bash
yarn eslint src
```

## Testing

### Running Tests

```bash
# All tests
yarn test:unit

# Watch mode
yarn test:unit --watch

# Specific file
yarn test:unit tests/lib/byte-to-mb.test.ts
```

### Writing Tests

Tests live in `tests/` directory:

```typescript
// tests/lib/example.test.ts
import { someFunction } from "@lib/example";

describe("someFunction", () => {
    it("should return expected result", () => {
        expect(someFunction("input")).toBe("expected");
    });

    it("should handle edge cases", () => {
        expect(someFunction("")).toBe("");
        expect(someFunction(null as any)).toBeNull();
    });
});
```

### Mocking

Use Jest mocks for external dependencies:

```typescript
// Mock Prisma
jest.mock("@lib/server/prisma", () => ({
    prisma: {
        post: {
            findMany: jest.fn().mockResolvedValue([]),
        },
    },
}));
```

## Database Changes

### Creating Migrations

```bash
# Create migration
yarn prisma migrate dev --name add_new_field

# This will:
# 1. Generate migration SQL
# 2. Apply to local database
# 3. Regenerate Prisma client
```

### Schema Changes

Edit `prisma/schema.prisma`:

```prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  // Add new field
  description String?  // New optional field

  @@map("posts")
}
```

### Migration Best Practices

- Keep migrations small and focused
- Add default values for new required fields
- Test migrations on copy of production data
- Include rollback plan

## Adding Features

### New Page

1. Create route: `src/app/(drift)/new-page/page.tsx`

    ```typescript
    export default function NewPage() {
      return (
        <PageWrapper>
          <PageTitle>New Page</PageTitle>
          {/* Content */}
        </PageWrapper>
      );
    }
    ```

1. Add navigation link if needed

### New API Endpoint

1. Create handler: `src/api/new-endpoint.ts`

    ```typescript
    import { withMethods } from "@lib/api-middleware/with-methods";
    import { NextApiRequest, NextApiResponse } from "next";

    async function handler(req: NextApiRequest, res: NextApiResponse) {
        // Implementation
    }

    export default withMethods(["GET", "POST"], handler);
    ```

### New Component

1. Create component: `src/app/components/new-component/index.tsx`

    ```typescript
    interface NewComponentProps {
      title: string;
      children: React.ReactNode;
    }

    export function NewComponent({ title, children }: NewComponentProps) {
      return (
        <div className="...">
          <h2>{title}</h2>
          {children}
        </div>
      );
    }
    ```

## Documentation

### Updating Docs

Documentation lives in `docs/`. Update when:

- Adding new features
- Changing configuration
- Modifying API endpoints

### Doc Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep formatting consistent

## Release Process

Releases are automated via GitHub Actions:

1. Update version in `package.json`
1. Update `CHANGELOG.md`
1. Run release workflow
1. Docker images built automatically

## Getting Help

### Resources

- [GitHub Issues](https://github.com/lbenicio/drift/issues)
- [Architecture Docs](./architecture.md)
- [API Reference](./api-reference.md)

### Questions

Open a GitHub Discussion for:

- Feature ideas
- Implementation questions
- General help

Open an Issue for:

- Bug reports
- Documentation errors
- Security vulnerabilities
