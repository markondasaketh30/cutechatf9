# CuteChat F9 - Frontend Integration Guide

## Authentication

CuteChat F9 uses NextAuth v5 with cookie-based sessions. All API requests must include session cookies for authentication.

### Credentials Login

```typescript
// 1. Fetch CSRF token
const csrfRes = await fetch('/api/auth/csrf');
const { csrfToken } = await csrfRes.json();

// 2. Login with credentials
const res = await fetch('/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    email: 'user@example.com',
    password: 'Password123!',
    csrfToken,
    redirect: 'false',
  }),
});

// 3. Session cookie is set automatically
```

### Google OAuth

Redirect the user to initiate the OAuth flow:

```typescript
// Redirect to Google OAuth
window.location.href = '/api/auth/signin/google';
```

NextAuth handles the callback at `/api/auth/callback/google` and sets session cookies.

### Guest Access

```typescript
// Guest login - redirects to home after auth
window.location.href = '/api/auth/guest?redirectUrl=/';
```

### Check Session

```typescript
const res = await fetch('/api/auth/session');
const session = await res.json();

if (session?.user) {
  console.log('Logged in as:', session.user.email);
} else {
  console.log('Not authenticated');
}
```

### Logout

```typescript
// Logout current session
await fetch('/api/logout', { method: 'POST' });

// Logout all sessions
await fetch('/api/logout?all=true', { method: 'POST' });
```

## Chat Integration (SSE Streaming)

The chat endpoint uses Server-Sent Events for real-time AI responses.

### Sending a Message

```typescript
const chatId = crypto.randomUUID();
const messageId = crypto.randomUUID();

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: chatId,
    message: {
      id: messageId,
      role: 'user',
      parts: [
        { type: 'text', text: 'Explain quantum computing' }
      ],
    },
    selectedChatModel: 'chat-model-small',
    selectedVisibilityType: 'private',
  }),
});

// Process SSE stream
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  // Each SSE event is formatted as: data: <json>\n\n
  const lines = chunk.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      // Handle different event types
      handleStreamEvent(data);
    }
  }
}
```

### Using the Vercel AI SDK (Recommended)

```typescript
import { useChat } from '@ai-sdk/react';

function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: {
      id: chatId,
      selectedChatModel: 'chat-model-small',
      selectedVisibilityType: 'private',
    },
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong>
          {m.parts?.map((part, i) => (
            <span key={i}>{part.type === 'text' ? part.text : ''}</span>
          ))}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### Message with File Attachment

```typescript
// 1. Upload file first
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadRes = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData,
});
const { url, pathname } = await uploadRes.json();

// 2. Send message with attachment
await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: chatId,
    message: {
      id: crypto.randomUUID(),
      role: 'user',
      parts: [
        { type: 'text', text: 'What is in this image?' },
        { type: 'file', mediaType: 'image/png', name: 'photo.png', url },
      ],
    },
    selectedChatModel: 'chat-model-small',
    selectedVisibilityType: 'private',
  }),
});
```

## File Upload

```typescript
const formData = new FormData();
formData.append('file', file);

const res = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData,
});

if (!res.ok) {
  const error = await res.json();
  console.error('Upload failed:', error.error);
  return;
}

const blob = await res.json();
// blob.url - public URL of the uploaded file
// blob.pathname - storage path
```

**Constraints:**
- Max size: 10MB
- Accepted types: `image/jpeg`, `image/png`, `application/pdf`

## Voting / Feedback

```typescript
// Get votes for a chat
const votesRes = await fetch(`/api/vote?chatId=${chatId}`);
const votes = await votesRes.json();

// Vote on a message (upvote or downvote)
await fetch('/api/vote', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId,
    messageId,
    type: 'up', // or 'down'
  }),
});
```

## Read Receipts

```typescript
// Mark all messages in a chat as read
await fetch('/api/messages/read', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chatId }),
});

// Mark a single message as read
await fetch('/api/messages/read', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messageId }),
});

// Get unread count
const res = await fetch('/api/messages/read');
const { unreadCount } = await res.json();
```

## Chat History

```typescript
// Get first page (10 chats)
const res = await fetch('/api/history?limit=10');
const chats = await res.json();

// Paginate forward
const nextRes = await fetch(
  `/api/history?limit=10&starting_after=${chats[chats.length - 1].id}`
);

// Paginate backward
const prevRes = await fetch(
  `/api/history?limit=10&ending_before=${chats[0].id}`
);

// Delete all chats
await fetch('/api/history', { method: 'DELETE' });
```

## Session Management

```typescript
// Get all active sessions
const res = await fetch('/api/sessions');
const { sessions } = await res.json();
// Each session: { id, ipAddress, userAgent, createdAt, lastActivityAt, expiresAt }

// Revoke a specific session
await fetch(`/api/sessions?id=${sessionId}`, { method: 'DELETE' });
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "code": "error_type:surface",
  "message": "Human-readable error message",
  "cause": "Optional additional context"
}
```

### Error Types

| HTTP Status | Error Type | Description |
|-------------|-----------|-------------|
| 400 | `bad_request` | Invalid request parameters |
| 401 | `unauthorized` | Authentication required |
| 403 | `forbidden` | Access denied |
| 404 | `not_found` | Resource not found |
| 429 | `rate_limit` | Too many requests |
| 503 | `offline` | Service unavailable |

### Example Error Handling

```typescript
const res = await fetch('/api/chat', { /* ... */ });

if (!res.ok) {
  const error = await res.json();
  switch (error.code) {
    case 'unauthorized:chat':
      // Redirect to login
      window.location.href = '/login';
      break;
    case 'rate_limit:chat':
      // Show rate limit message
      alert(error.message);
      break;
    case 'forbidden:chat':
      // Chat belongs to another user
      break;
    default:
      console.error('API error:', error.message);
  }
}
```

## Rate Limits

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1706140800
```

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 req | 15 min |
| Register | 5 req | 60 min |
| Forgot Password | 3 req | 60 min |
| Chat API | 60 req | 60 sec |
| Login Page | 10 req | 15 min |
