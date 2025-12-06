# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-12-06

### Added

- **Security Policy** - Comprehensive `SECURITY.md` with vulnerability reporting guidelines and self-hosting best practices
- **CI/CD Workflows** - GitHub Actions workflows for automated testing, linting, and format checking
- **TypeScript Declarations** - CSS module type declarations for improved TypeScript support
- **Prisma Configuration** - `prisma.config.ts` for schema path management
- **PWA Support** - Favicon images and site manifest for improved branding

### Changed

- **Project Architecture** - Complete refactor from separate client/server to unified Next.js 16 App Router application
- **Database** - Migrated from Sequelize to Prisma ORM with PostgreSQL adapter
- **Authentication** - Updated to NextAuth.js with Prisma adapter
- **Styling** - Migrated to Tailwind CSS v4 with modern configuration
- **Components** - Refactored UI components using Radix UI primitives and shadcn/ui patterns
- **ESLint** - Updated to ESLint 9 with flat config format
- **Middleware** - Renamed `middleware.ts` to `proxy.ts` following Next.js 16 conventions
- **TypeScript** - Updated to TypeScript 5.9 with modern compiler options

### Fixed

- **Import Paths** - Consolidated path aliases (`@components/*`, `@lib/*`, `@app/*`, etc.)
- **React 19 Compatibility** - Updated JSX types and component patterns for React 19
- **Prisma v7 Compatibility** - Fixed `Bytes` type handling and validator API changes
- **Unit Tests** - Fixed Jest configuration and Prisma mocking

### Removed

- **Legacy Client Folder** - Removed old `client/` directory structure
- **Legacy Server Folder** - Removed old Express.js `server/` directory
- **Vercel Config** - Removed `vercel.json` (using Next.js defaults)

### Dependencies

- Next.js 16.0.7
- React 19.2.1
- Prisma 7.1.0
- TypeScript 5.9.3
- Tailwind CSS 4.1.10
- ESLint 9.39.1

---

## [0.x.x] - Previous Versions

Prior versions used a separate client/server architecture with:

- Next.js Pages Router for the frontend (`client/`)
- Express.js API server (`server/`)
- Sequelize ORM with SQLite/PostgreSQL

See git history for detailed changes in previous versions.
