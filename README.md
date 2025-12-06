# Drift

![Drift Logo](src/public/assets/logo.png)

[![Tests](https://github.com/lbenicio/drift/actions/workflows/tests.yaml/badge.svg)](https://github.com/lbenicio/drift/actions/workflows/tests.yaml)
[![Lint & Format](https://github.com/lbenicio/drift/actions/workflows/lint-format.yaml/badge.svg)](https://github.com/lbenicio/drift/actions/workflows/lint-format.yaml)
[![Docker](https://github.com/lbenicio/drift/actions/workflows/docker.yaml/badge.svg)](https://github.com/lbenicio/drift/actions/workflows/docker.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Drift is a self-hostable Gist clone. Share code snippets, markdown documents, and text files with syntax highlighting and more.

## ✨ Features

- 📝 Create and share code snippets with syntax highlighting
- 🔒 Private, public, unlisted, and password-protected posts
- ⏰ Expiring posts with automatic cleanup
- 🎨 Markdown rendering with GitHub Flavored Markdown
- 👤 User authentication (credentials + GitHub OAuth + Keycloak)
- 🔍 Search through your posts
- 📱 Responsive design
- 🌙 Dark mode support
- 🛡️ Admin panel for user management
- 🐳 Docker support with multi-architecture builds

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router & React Server Components
- **Database:** PostgreSQL with [Prisma 7](https://prisma.io/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Auth:** [NextAuth.js](https://next-auth.js.org/)
- **Runtime:** Node.js 24
- **Package Manager:** Yarn 4

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Development](#-development)
- [Production](#-production)
- [Docker](#-docker)
- [Environment Variables](#%EF%B8%8F-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

### Prerequisites

- Node.js 24+
- PostgreSQL 16+
- Yarn 4 (enabled via corepack)

### Installation

```bash
# Clone the repository
git clone https://github.com/lbenicio/drift.git
cd drift

# Enable corepack for Yarn 4
corepack enable

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
yarn prisma generate

# Run database migrations
yarn prisma migrate deploy

# Start development server
yarn start:dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 💻 Development

```bash
# Start development server with hot reload
yarn start:dev

# Run linting
yarn eslint src

# Run formatting
yarn fmt:lint

# Run unit tests
yarn test:unit

# Type checking
yarn tsc --noEmit

# Generate Prisma client after schema changes
yarn prisma generate

# Create a new migration
yarn prisma migrate dev

# Open Prisma Studio (database GUI)
yarn prisma studio
```

## 🏭 Production

### Build & Run

```bash
# Build for production
yarn build:pkg

# Start production server
yarn start:prod
```

### Running with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Build and start with PM2
yarn build:pkg
pm2 start yarn --name drift --interpreter bash -- start:prod

# View logs
pm2 logs drift

# Restart
pm2 restart drift
```

### Running with systemd

Create `/etc/systemd/system/drift.service`:

```ini
[Unit]
Description=Drift Server
After=network.target postgresql.service

[Service]
Type=simple
User=drift
WorkingDirectory=/opt/drift
ExecStart=/usr/bin/yarn start:prod
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl enable drift
sudo systemctl start drift
```

## 🐳 Docker

### Using Pre-built Images

```bash
# Pull the latest image
docker pull ghcr.io/lbenicio/drift:latest

# Run with environment variables
docker run -d \
  --name drift \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:password@host:5432/drift" \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -e DRIFT_URL="https://your-domain.com" \
  ghcr.io/lbenicio/drift:latest
```

### Using Docker Compose

```yaml
version: "3.8"

services:
  drift:
    image: ghcr.io/lbenicio/drift:latest
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/drift
      - NEXTAUTH_SECRET=your-secret-key-change-me
      - DRIFT_URL=http://localhost:3001
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=drift
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Building Locally

```bash
# Build the image
docker build -t drift .

# Run the container
docker run -p 3001:3001 drift
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```bash
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/drift"
NEXTAUTH_SECRET="generate-a-secure-random-string"

# Application URL
DRIFT_URL="http://localhost:3000"

# Optional - Customization
WELCOME_TITLE="Welcome to Drift"
WELCOME_CONTENT="## Your custom welcome message in markdown"
ENABLE_ADMIN="true"
REGISTRATION_PASSWORD=""  # Leave empty for open registration

# Optional - Authentication Providers
CREDENTIAL_AUTH="true"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Keycloak OAuth (optional)
KEYCLOAK_ID=""
KEYCLOAK_SECRET=""
KEYCLOAK_ISSUER=""
KEYCLOAK_NAME="Keycloak"
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Originally created by [Max Leiter](https://github.com/MaxLeiter)
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://prisma.io/)
