import crypto from "crypto";
import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DUMMY_PASSWORD } from "@/lib/constants";
import {
  createGuestUser,
  createOAuthUser,
  createUserSession,
  deleteSession,
  getUser,
  incrementFailedLoginAttempts,
  isAccountLocked,
  logActivity,
  resetFailedLoginAttempts,
} from "@/lib/db/queries";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    sessionToken?: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        // Check if account is locked
        const locked = await isAccountLocked(user.id);
        if (locked) {
          // Account is locked, don't allow login
          return null;
        }

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          // Increment failed login attempts
          await incrementFailedLoginAttempts(user.id);
          return null;
        }

        // Reset failed login attempts on successful login
        await resetFailedLoginAttempts(user.id);

        return { ...user, type: "regular" };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  events: {
    async signIn({ user, account }) {
      if (user.id) {
        // Log login activity
        await logActivity({
          userId: user.id,
          action: "login",
          metadata: { provider: account?.provider },
        });
      }
    },
    async signOut({ token }) {
      if (token?.sessionToken) {
        // Delete the session from database
        await deleteSession(token.sessionToken as string);
      }
      if (token?.id) {
        // Log logout activity
        await logActivity({
          userId: token.id as string,
          action: "logout",
        });
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth user creation
      if (account?.provider === "google" && user.email) {
        const existingUsers = await getUser(user.email);
        if (existingUsers.length === 0) {
          // Create new user for Google OAuth (no password needed)
          const [newUser] = await createOAuthUser(user.email);
          user.id = newUser.id;
        } else {
          user.id = existingUsers[0].id;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id as string;
        // Google OAuth users are "regular" type
        token.type = account?.provider === "google" ? "regular" : user.type;

        // Create a database session on login
        const sessionToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        try {
          await createUserSession({
            userId: user.id as string,
            sessionToken,
            expiresAt,
          });
          token.sessionToken = sessionToken;
        } catch (error) {
          console.error("Failed to create session:", error);
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
