# Changelog Format

This document describes the changelog format used by Drift.

## Changelog Location

The changelog is maintained in two places:

1. **GitHub Releases:** Detailed release notes for each version
2. **CHANGELOG.md:** Summary of changes (if present in root directory)

## Versioning

Drift follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, backward compatible

## Release Notes Format

### Version Header

```markdown
## [1.2.0] - 2024-01-15
```

### Categories

Each release includes the following sections (when applicable):

#### Added

New features and capabilities:

```markdown
### Added

- User profile avatars with Gravatar support
- Post duplication feature
- API rate limiting configuration
```

#### Changed

Modifications to existing functionality:

```markdown
### Changed

- Improved syntax highlighting performance
- Updated dark mode color scheme
- Enhanced mobile navigation
```

#### Deprecated

Features planned for removal:

```markdown
### Deprecated

- Legacy `/api/v1/` endpoints (use `/api/` instead)
- `SESSION_SECRET` env var (use `NEXTAUTH_SECRET`)
```

#### Removed

Features that have been removed:

```markdown
### Removed

- Support for Node.js 18
- Deprecated MySQL support
```

#### Fixed

Bug fixes:

```markdown
### Fixed

- Fixed post expiration timezone handling
- Resolved OAuth callback URL validation
- Corrected password strength indicator
```

#### Security

Security-related changes:

```markdown
### Security

- Updated dependencies to patch CVE-XXXX-XXXXX
- Added CSRF protection to all forms
- Implemented rate limiting for auth endpoints
```

## Example Release Notes

```markdown
## [2.0.0] - 2024-01-01

### Breaking Changes

- **Node.js 24 Required:** Minimum Node.js version is now 24.0.0
- **Yarn 4:** Package manager upgraded to Yarn 4.x with corepack
- **Environment Variables:** `SESSION_SECRET` renamed to `NEXTAUTH_SECRET`

### Added

- Multi-factor authentication support
- Post collaboration (multiple authors)
- Real-time post editing with WebSockets
- Dark mode auto-detection
- Post analytics dashboard

### Changed

- Migrated to Next.js 16 App Router
- Improved database query performance
- Redesigned settings page
- Enhanced accessibility (WCAG 2.1 AA)

### Fixed

- Fixed memory leak in syntax highlighter
- Resolved race condition in post creation
- Corrected timezone handling for expiration

### Security

- Upgraded bcrypt for improved password hashing
- Added security headers via middleware
- Implemented Content Security Policy

### Migration Guide

See [upgrade guide](docs/upgrade-guide.md) for detailed migration steps.
```

## Viewing Changelog

### GitHub Releases

Visit: https://github.com/MaxLeiter/drift/releases

### Via API

```bash
curl -s https://api.github.com/repos/MaxLeiter/drift/releases/latest | jq '.body'
```

### In Project

If CHANGELOG.md exists:

```bash
cat CHANGELOG.md
```

## Contributing to Changelog

When submitting pull requests, include changelog entries in your PR description:

```markdown
## Changelog Entry

### Added

- Feature description (#PR_NUMBER)
```

Maintainers will include these in the next release notes.
