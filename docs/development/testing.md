# Testing Guide

How to run and write tests for Drift.

## Test Stack

| Tool               | Purpose            |
| ------------------ | ------------------ |
| Jest               | Test runner        |
| ts-jest            | TypeScript support |
| jest-mock-extended | Prisma mocking     |

## Running Tests

### All Tests

```bash
yarn test:unit
```

### Watch Mode

```bash
yarn test:unit --watch
```

### Specific File

```bash
yarn test:unit tests/lib/byte-to-mb.test.ts
```

### With Coverage

```bash
yarn test:unit --coverage
```

Coverage report generated in `coverage/` directory.

## Test Structure

```plaintext
tests/
├── .env.test           # Test environment variables
├── setup-tests.ts      # Global test setup
├── prisma.mock.ts      # Prisma mock factory
├── react.mock.ts       # React mocks
└── lib/
    ├── byte-to-mb.test.ts
    └── server/
        └── verify-api-user.test.ts
```

## Writing Tests

### Basic Test

```typescript
import { functionToTest } from "@lib/module";

describe("functionToTest", () => {
    it("should handle normal input", () => {
        const result = functionToTest("input");
        expect(result).toBe("expected");
    });

    it("should handle edge cases", () => {
        expect(functionToTest("")).toBe("");
        expect(functionToTest(null as any)).toBeNull();
    });
});
```

### Async Tests

```typescript
describe("asyncFunction", () => {
    it("should resolve with data", async () => {
        const result = await asyncFunction();
        expect(result).toEqual({ data: "value" });
    });

    it("should reject on error", async () => {
        await expect(asyncFunction("bad")).rejects.toThrow("Error message");
    });
});
```

### Testing with Mocks

```typescript
import { prismaMock } from "@test/prisma.mock";

// Mock Prisma module
jest.mock("@lib/server/prisma", () => ({
    __esModule: true,
    get prisma() {
        return require("@test/prisma.mock").prismaMock;
    },
}));

describe("database operations", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch user", async () => {
        const mockUser = { id: "1", username: "test" };
        prismaMock.user.findUnique.mockResolvedValue(mockUser);

        const result = await getUserById("1");

        expect(result).toEqual(mockUser);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
            where: { id: "1" },
        });
    });
});
```

## Mocking

### Prisma Mock

The `prisma.mock.ts` provides type-safe Prisma mocking:

```typescript
// tests/prisma.mock.ts
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

export const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
    mockReset(prismaMock);
});
```

### Module Mocks

```typescript
// Mock external module
jest.mock("some-library", () => ({
    someFunction: jest.fn().mockReturnValue("mocked"),
}));

// Mock with factory
jest.mock("@lib/config", () => ({
    __esModule: true,
    default: {
        is_production: false,
        url: "http://localhost:3000",
    },
}));
```

### Function Mocks

```typescript
const mockFn = jest.fn();

// Set return value
mockFn.mockReturnValue("value");

// Set async return
mockFn.mockResolvedValue({ data: "async" });

// Set implementation
mockFn.mockImplementation((arg) => `processed: ${arg}`);

// Verify calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
```

## Testing API Routes

### Setup

```typescript
import { createMocks } from "node-mocks-http";
import handler from "@api/post";

describe("POST /api/post", () => {
    it("should create post", async () => {
        const { req, res } = createMocks({
            method: "POST",
            body: {
                title: "Test Post",
                files: [{ title: "test.txt", content: "hello" }],
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(201);
        expect(JSON.parse(res._getData())).toMatchObject({
            title: "Test Post",
        });
    });
});
```

### With Authentication

```typescript
import { getSession } from "next-auth/react";

jest.mock("next-auth/react");
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe("authenticated endpoints", () => {
    it("should require auth", async () => {
        mockGetSession.mockResolvedValue(null);

        const { req, res } = createMocks({ method: "GET" });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(401);
    });

    it("should allow authenticated users", async () => {
        mockGetSession.mockResolvedValue({
            user: { id: "1", name: "Test" },
            expires: "2024-12-31",
        });

        const { req, res } = createMocks({ method: "GET" });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
    });
});
```

## Testing Components

### Basic Component Test

```typescript
import { render, screen } from "@testing-library/react";
import { Button } from "@components/button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);

    await userEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Snapshot Testing

```typescript
import { render } from "@testing-library/react";
import { Card } from "@components/card";

describe("Card", () => {
  it("matches snapshot", () => {
    const { container } = render(
      <Card>
        <Card.Header>Title</Card.Header>
        <Card.Content>Content</Card.Content>
      </Card>
    );
    expect(container).toMatchSnapshot();
  });
});
```

## Test Configuration

### jest.config.js

```javascript
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["<rootDir>/tests/setup-tests.ts"],
    roots: ["<rootDir>/tests"],
    moduleNameMapper: {
        "@lib/(.*)": "<rootDir>/src/lib/$1",
        "@components/(.*)": "<rootDir>/src/app/components/$1",
        "@test/(.*)": "<rootDir>/tests/$1",
        "\\.(css)$": "identity-obj-proxy",
    },
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
    },
};
```

### Environment Variables

Test environment in `tests/.env.test`:

```bash
DATABASE_URL=""
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=test
```

## Best Practices

### Test Organization

- One test file per module
- Group related tests with `describe`
- Clear test names that describe behavior

### Test Independence

- Each test should be independent
- Reset mocks between tests
- Don't rely on test order

### Meaningful Assertions

```typescript
// Good - specific assertions
expect(result).toEqual({ id: "1", name: "Test" });
expect(result.items).toHaveLength(3);

// Avoid - too generic
expect(result).toBeTruthy();
expect(result).not.toBeNull();
```

### Test Edge Cases

- Empty inputs
- Null/undefined values
- Large inputs
- Invalid data types
- Error conditions

## CI Integration

Tests run automatically in GitHub Actions:

```yaml
# .github/workflows/tests.yaml
- name: Run tests
  run: yarn test:unit
  env:
      NODE_ENV: test
      DATABASE_URL: ""
      NEXTAUTH_SECRET: test-secret
```

## Debugging Tests

### VS Code Launch Config

```json
{
    "type": "node",
    "request": "launch",
    "name": "Jest: Current File",
    "program": "${workspaceFolder}/node_modules/.bin/jest",
    "args": ["${relativeFile}", "--config", "jest.config.js"],
    "console": "integratedTerminal"
}
```

### Verbose Output

```bash
yarn test:unit --verbose
```

### Single Test

```bash
yarn test:unit -t "should handle normal input"
```
