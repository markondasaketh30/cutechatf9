# CuteChat F9 - Project Features

## Architecture Overview

CuteChat F9 is a full-stack AI chat application built with Next.js 16 (App Router). It supports multi-model AI conversations, document collaboration, file uploads, and real-time streaming.

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│   Next.js 16 (React 19) + TailwindCSS v4        │
│   SSE Streaming | Prosemirror Editor | CodeMirror│
├─────────────────────────────────────────────────┤
│                  API Layer                       │
│   Next.js App Router (Route Handlers)            │
│   NextAuth v5 | Rate Limiting Middleware         │
│   Pino Structured Logging                        │
├─────────────────────────────────────────────────┤
│                  Services                        │
│   Vercel AI SDK | AI Gateway | Resend Email      │
│   Vercel Blob Storage | Redis (SSE streams)      │
├─────────────────────────────────────────────────┤
│                  Database                        │
│   PostgreSQL + Drizzle ORM (9 migrations)        │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.6+ |
| UI | React 19, TailwindCSS v4, Radix UI, shadcn/ui |
| AI | Vercel AI SDK v6, AI Gateway |
| Auth | NextAuth v5 (beta.25) |
| Database | PostgreSQL, Drizzle ORM |
| Cache/Streaming | Redis 7, resumable-stream |
| File Storage | Vercel Blob |
| Email | Resend |
| Logging | Pino |
| Testing | Playwright (23 E2E tests) |
| Package Manager | pnpm 9 |

## Features

### Authentication & Authorization

- **Email/Password Login** - Credential-based auth with bcrypt password hashing (10 rounds)
- **Google OAuth** - One-click Google sign-in via NextAuth
- **Guest Access** - Browse without an account, redirected with token
- **Account Lockout** - 5 failed login attempts triggers 15-minute lockout
- **Session Management** - PostgreSQL-backed sessions with 30-day expiry
  - View all active sessions (IP, user agent, last activity)
  - Revoke individual sessions or all sessions at once
- **Password Reset** - Email-based recovery flow via Resend
  - Secure token generation (crypto)
  - 1-hour token expiry
  - Strong password requirements (8+ chars, upper, lower, number, special)
- **Activity Logging** - Tracks login, logout, password reset, session revoke events

### Rate Limiting

IP-based rate limiting applied via middleware:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/callback/credentials` | 5 requests | 15 minutes |
| `/login` | 10 requests | 15 minutes |
| `/register` | 5 requests | 60 minutes |
| `/forgot-password` | 3 requests | 60 minutes |
| `/api/chat` | 60 requests | 60 seconds |

### Security Headers

All responses include:
- `Strict-Transport-Security` (HSTS with preload)
- `X-XSS-Protection`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation disabled)

### AI Chat

- **Multi-model Support** - Switch between chat models at runtime
- **Reasoning Models** - Extended thinking with Anthropic models (10K token budget)
- **Real-time Streaming** - Server-Sent Events via resumable-stream + Redis
- **Tool Execution** - Built-in tools:
  - Weather lookup
  - Document creation/updating
  - AI suggestions
  - Quiz generation from PDF (Claude Haiku 4.5)
- **Message Rate Limiting** - Per-user daily message caps based on user type entitlements
- **Auto-generated Titles** - Chat titles generated from first user message

### Documents

- **Multi-format** - Text, code, image, and sheet document types
- **Versioning** - Documents tracked with creation timestamps
- **AI Suggestions** - Automated improvement suggestions with resolve workflow
- **Rich Editing** - Prosemirror and CodeMirror integration

### File Uploads

- **Supported Formats** - JPEG, PNG, PDF
- **Size Limit** - 10MB maximum
- **Storage** - Vercel Blob with public read access
- **Validation** - MIME type and file size validation

### Message System

- **Read Receipts** - `readAt` and `deliveredAt` timestamps per message
- **Unread Count** - Per-user unread message count API
- **Vote/Feedback** - Upvote/downvote on AI responses
- **Attachments** - File attachments on messages

### Production Logging

- **Pino** - Structured JSON logging in production, pretty-print in development
- **Child Loggers** - Separate loggers per module (db, auth, chat, api, email)
- **Sensitive Data Redaction** - Automatic redaction of authorization, cookie, password, token fields
- **Configurable** - LOG_LEVEL environment variable

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/session` | Get current session |
| GET | `/api/auth/csrf` | Get CSRF token |
| POST | `/api/auth/callback/credentials` | Login with email/password |
| GET | `/api/auth/guest` | Guest sign-in |
| POST | `/api/logout` | Logout (single or all sessions) |
| GET | `/api/sessions` | List active sessions |
| DELETE | `/api/sessions?id=` | Revoke a session |
| POST | `/api/chat` | Send message (SSE stream) |
| DELETE | `/api/chat?id=` | Delete a chat |
| GET | `/api/history` | Get chat history (paginated) |
| DELETE | `/api/history` | Delete all chats |
| POST | `/api/files/upload` | Upload file |
| GET | `/api/vote?chatId=` | Get votes for chat |
| PATCH | `/api/vote` | Vote on a message |
| POST | `/api/messages/read` | Mark messages as read |
| GET | `/api/messages/read` | Get unread count |
| GET | `/api/document?id=` | Get document |
| POST | `/api/document?id=` | Save document |
| DELETE | `/api/document?id=&timestamp=` | Delete document version |
| GET | `/api/suggestions?documentId=` | Get suggestions |

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `User` | User accounts (email, hashed password, lockout tracking) |
| `Chat` | Conversations (title, visibility, user ownership) |
| `Message_v2` | Messages with parts/attachments, read receipts |
| `Vote_v2` | Message upvote/downvote (composite PK: chatId + messageId) |
| `Document` | Documents with versioning (composite PK: id + createdAt) |
| `Suggestion` | AI suggestions for documents |
| `Stream` | SSE stream sessions |
| `PasswordResetToken` | Password recovery tokens (1hr expiry) |
| `UserSession` | Active session tracking (30-day expiry) |
| `ActivityLog` | Audit trail (login, logout, password reset events) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | NextAuth secret (32+ chars) |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |
| `AI_GATEWAY_API_KEY` | Yes | Vercel AI Gateway API key |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob storage token |
| `POSTGRES_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `RESEND_API_KEY` | No | Resend email API key |
| `EMAIL_FROM` | No | Sender email address |
| `NEXT_PUBLIC_APP_URL` | Yes | Public application URL |
| `LOG_LEVEL` | No | Pino log level (default: info) |

## Development

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev

# Run E2E tests
pnpm test

# Lint & format
pnpm lint
pnpm format
```

## Docker Deployment

```bash
# Build and start all services
pnpm docker:up

# Stop services
pnpm docker:down

# Rebuild
pnpm docker:build
```

Services: Next.js app (port 3000), PostgreSQL 16 (port 5432), Redis 7 (port 6379).

## Vercel Deployment

The app is optimized for Vercel with:
- Standalone Next.js output
- Vercel Blob for file storage
- Vercel AI Gateway for model routing
- CI/CD pipeline via GitHub Actions (`.github/workflows/deploy.yml`)

Required Vercel secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Testing

23 Playwright E2E tests covering:
- Authentication flows (login, register, guest)
- Chat creation and messaging
- File upload validation
- Session management
- Password reset flow
- Rate limiting behavior

Run with: `pnpm test`
