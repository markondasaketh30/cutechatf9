# CuteChat Features Added

## Overview

This document summarizes the new features added to the CuteChat application:

1. **Google OAuth Authentication** - Sign in with Google
2. **PDF Upload Support** - Upload PDF files in chat
3. **Quiz Generation from PDF** - AI-powered quiz creation from uploaded PDFs

---

## 1. Google OAuth Authentication

### Description
Users can now sign in or sign up using their Google account instead of email/password.

### Files Modified
| File | Changes |
|------|---------|
| `app/(auth)/auth.ts` | Added Google provider to NextAuth |
| `lib/db/queries.ts` | Added `createOAuthUser()` function |
| `app/(auth)/login/page.tsx` | Added Google sign-in button |
| `app/(auth)/register/page.tsx` | Added Google sign-up button |
| `components/icons.tsx` | Added `GoogleIcon` component |
| `.env.example` | Added Google OAuth environment variables |

### Environment Variables Required
```env
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### Setup Instructions
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth credentials
3. Add redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
4. Add credentials to Vercel environment variables

---

## 2. PDF Upload Support

### Description
Users can now upload PDF files (up to 10MB) as attachments in the chat.

### Files Modified
| File | Changes |
|------|---------|
| `app/(chat)/api/files/upload/route.ts` | Accept `application/pdf`, increased limit to 10MB |
| `components/multimodal-input.tsx` | Added PDF to file input accept attribute |
| `components/preview-attachment.tsx` | Added PDF icon preview |
| `components/icons.tsx` | Added `FileTextIcon` component |

### Supported File Types
- JPEG images
- PNG images
- PDF documents (NEW)

---

## 3. Quiz Generation from PDF

### Description
When a user uploads a PDF and asks for a quiz, the AI automatically generates an interactive multiple-choice quiz based on the PDF content.

### How to Use
1. Upload a PDF file to the chat
2. Ask for a quiz, e.g.:
   - "Create a quiz from this PDF"
   - "Quiz me on this document"
   - "Generate 5 questions from this PDF"
3. Take the interactive quiz directly in the chat
4. See your score and explanations

### Files Created
| File | Purpose |
|------|---------|
| `lib/ai/schemas/quiz.ts` | Zod schema for quiz structure |
| `lib/ai/tools/generate-quiz.ts` | AI tool for quiz generation |
| `lib/pdf/extract.ts` | PDF utility functions |
| `components/quiz/quiz-result.tsx` | Interactive quiz UI component |
| `components/quiz/index.ts` | Component exports |

### Files Modified
| File | Changes |
|------|---------|
| `app/(chat)/api/chat/route.ts` | Added `generateQuiz` tool |
| `components/message.tsx` | Added quiz result rendering |
| `lib/ai/prompts.ts` | Added quiz generation instructions |

### Quiz Features
- 3-10 multiple choice questions
- 4 options per question (a, b, c, d)
- Instant feedback on answers
- Explanations for correct answers
- Score tracking
- Restart quiz option

---

## Environment Variables Summary

```env
# Authentication
AUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Database (auto-added by Vercel)
POSTGRES_URL=your-neon-postgres-url

# File Storage (auto-added by Vercel)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# AI (auto-added by Vercel)
AI_GATEWAY_API_KEY=your-vercel-ai-gateway-key
```

---

## Vercel Deployment Checklist

- [ ] Create Vercel project and link repository
- [ ] Add Neon Postgres via Vercel Storage
- [ ] Add Vercel Blob via Vercel Storage
- [ ] Enable Vercel AI Gateway
- [ ] Add `AUTH_SECRET` environment variable
- [ ] Create Google OAuth credentials
- [ ] Add `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Deploy

---

## Architecture

```
User uploads PDF
       │
       ▼
┌─────────────────┐
│  Vercel Blob    │  ← PDF stored here
│  Storage        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chat Message   │  ← User asks for quiz
│  with PDF URL   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  generateQuiz   │  ← AI Tool called
│  Tool           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Claude AI      │  ← Analyzes PDF
│  (Haiku 4.5)    │     Generates questions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  QuizResult     │  ← Interactive quiz
│  Component      │     displayed in chat
└─────────────────┘
```

---

## Chat Persistence

Chats are automatically saved to the database:

- **Chats** → Linked to user ID
- **Messages** → Stored with attachments
- **Quiz results** → Embedded in message parts

Users can access their chat history after logging in.

---

## Notes

- Quiz generation uses Claude Haiku 4.5 for fast, cost-effective processing
- PDFs are sent as base64 to the AI model
- Maximum PDF size: 10MB
- Quiz questions: 3-10 (default: 5)
- Google OAuth users are stored without passwords
- Guest users can convert to registered users
