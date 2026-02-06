# Environment Variables Setup Guide

Step-by-step guide to configure all environment variables for the CuteChat F9 Vercel deployment.

**Vercel Project Settings**: [cutechatf9-7xmh > Settings > Environment Variables](https://vercel.com/markondasaketh30s-projects/cutechatf9-7xmh/settings/environment-variables)

---

## Step 1: AUTH_SECRET (Required)

This is needed for NextAuth.js to encrypt sessions. **Auth will not work without this.**

1. Go to https://generate-secret.vercel.app/32
2. Copy the generated secret
3. Go to **Vercel Dashboard** > cutechatf9-7xmh > **Settings** > **Environment Variables**
4. Add:
   - **Key**: `AUTH_SECRET`
   - **Value**: paste the secret you copied
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**

---

## Step 2: POSTGRES_URL (Required)

Database for storing users, chats, messages, etc.

1. Go to **Vercel Dashboard** > **Storage** tab (top navigation)
2. Click **Create Database** > Select **Postgres**
3. Name it `cutechatf9-db`
4. Select region **Washington D.C. (iad1)** (same as deployment region)
5. Click **Create**
6. After creation, click **Connect to Project** > select **cutechatf9-7xmh**
7. This **automatically** sets `POSTGRES_URL` and related connection vars

---

## Step 3: REDIS_URL (Required)

Redis store for caching and rate limiting.

1. Go to **Vercel Dashboard** > **Storage** tab
2. Click **Create Database** > Select **Redis** (KV)
3. Name it `cutechatf9-redis`
4. Select region **Washington D.C. (iad1)**
5. Click **Create**
6. Click **Connect to Project** > select **cutechatf9-7xmh**
7. This **automatically** sets `REDIS_URL` and related vars

---

## Step 4: BLOB_READ_WRITE_TOKEN (Required)

Blob storage for file uploads and attachments.

1. Go to **Vercel Dashboard** > **Storage** tab
2. Click **Create Store** > Select **Blob**
3. Name it `cutechatf9-blob`
4. Click **Create**
5. Click **Connect to Project** > select **cutechatf9-7xmh**
6. This **automatically** sets `BLOB_READ_WRITE_TOKEN`

---

## Step 5: AI_GATEWAY_API_KEY (Required)

API key for Vercel AI Gateway to access AI models.

1. Go to https://vercel.com/ai-gateway
2. Create an API key
3. Go to **Vercel Dashboard** > cutechatf9-7xmh > **Settings** > **Environment Variables**
4. Add:
   - **Key**: `AI_GATEWAY_API_KEY`
   - **Value**: paste the API key
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**

---

## Step 6: Google OAuth (Required for Google Login)

Allows users to sign in with their Google account.

1. Go to https://console.cloud.google.com/apis/credentials
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `CuteChat F9`
   - Authorized JavaScript origins: `https://cutechatf9-7xmh-markondasaketh30s-projects.vercel.app`
   - Authorized redirect URI: `https://cutechatf9-7xmh-markondasaketh30s-projects.vercel.app/api/auth/callback/google`
3. Click **Create** and copy the **Client ID** and **Client Secret**
4. Go to **Vercel Dashboard** > cutechatf9-7xmh > **Settings** > **Environment Variables**
5. Add two variables:
   - **Key**: `AUTH_GOOGLE_ID` | **Value**: your Client ID
   - **Key**: `AUTH_GOOGLE_SECRET` | **Value**: your Client Secret
   - **Environments**: Select all
6. Click **Save**

---

## Step 7: Resend (Optional - Password Reset Emails)

Only needed if you want password reset functionality via email.

1. Go to https://resend.com and create an account
2. Go to https://resend.com/api-keys and create an API key
3. Go to **Vercel Dashboard** > cutechatf9-7xmh > **Settings** > **Environment Variables**
4. Add two variables:
   - **Key**: `RESEND_API_KEY` | **Value**: your Resend API key
   - **Key**: `EMAIL_FROM` | **Value**: `onboarding@resend.dev` (for testing) or your verified domain email
   - **Environments**: Select all
5. Click **Save**

---

## Step 8: App URL

Public URL used for password reset links and other absolute URLs.

1. Go to **Vercel Dashboard** > cutechatf9-7xmh > **Settings** > **Environment Variables**
2. Add:
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://cutechatf9-7xmh-markondasaketh30s-projects.vercel.app`
   - **Environments**: Production only
3. Click **Save**

---

## Step 9: Redeploy

After adding all environment variables, you need to redeploy for them to take effect.

1. Go to **Vercel Dashboard** > cutechatf9-7xmh > **Deployments** tab
2. Find the latest deployment
3. Click the **three dots** (menu) on the right
4. Click **Redeploy**
5. Wait for the build to complete

---

## Quick Reference Table

| Variable | Required | Source |
|----------|----------|--------|
| `AUTH_SECRET` | Yes | https://generate-secret.vercel.app/32 |
| `POSTGRES_URL` | Yes | Vercel Storage > Postgres (auto-linked) |
| `REDIS_URL` | Yes | Vercel Storage > Redis (auto-linked) |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Storage > Blob (auto-linked) |
| `AI_GATEWAY_API_KEY` | Yes | https://vercel.com/ai-gateway |
| `AUTH_GOOGLE_ID` | Yes | Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Yes | Google Cloud Console |
| `RESEND_API_KEY` | Optional | https://resend.com/api-keys |
| `EMAIL_FROM` | Optional | Your verified email |
| `NEXT_PUBLIC_APP_URL` | Yes | Your Vercel deployment URL |

---

## Priority Order

If you want to get the app working quickly, set them up in this order:

1. **AUTH_SECRET** - fixes the 500 auth error immediately
2. **Postgres** - needed for any data storage
3. **Redis** - needed for caching
4. **Blob** - needed for file uploads
5. **AI_GATEWAY_API_KEY** - needed for chat/AI to work
6. **Google OAuth** - needed for Google sign-in
7. **NEXT_PUBLIC_APP_URL** - needed for email links
8. **Resend** - optional, for password reset emails
