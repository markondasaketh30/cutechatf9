import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  ne,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/artifact";
import type { VisibilityType } from "@/components/visibility-selector";
import { ChatSDKError } from "../errors";
import { generateUUID } from "../utils";
import {
  type ActivityLog,
  activityLog,
  type Chat,
  chat,
  type DBMessage,
  document,
  message,
  type PasswordResetToken,
  passwordResetToken,
  type Suggestion,
  stream,
  suggestion,
  type User,
  user,
  type UserSession,
  userSession,
  vote,
} from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function createOAuthUser(email: string) {
  try {
    return await db
      .insert(user)
      .values({ email, password: null })
      .returning({
        id: user.id,
        email: user.email,
      });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create OAuth user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    return await db.update(message).set({ parts }).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
  } catch (error) {
    console.warn("Failed to update title for chat", chatId, error);
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

// ============================================
// Password Reset Token Functions
// ============================================

export async function createPasswordResetToken({
  userId,
  token,
  expiresAt,
}: {
  userId: string;
  token: string;
  expiresAt: Date;
}) {
  try {
    // Invalidate any existing tokens for this user
    await db
      .delete(passwordResetToken)
      .where(eq(passwordResetToken.userId, userId));

    return await db.insert(passwordResetToken).values({
      userId,
      token,
      expiresAt,
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create password reset token"
    );
  }
}

export async function getPasswordResetToken(
  token: string
): Promise<PasswordResetToken | null> {
  try {
    const [result] = await db
      .select()
      .from(passwordResetToken)
      .where(eq(passwordResetToken.token, token));
    return result || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get password reset token"
    );
  }
}

export async function invalidatePasswordResetToken(token: string) {
  try {
    return await db
      .update(passwordResetToken)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetToken.token, token));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to invalidate password reset token"
    );
  }
}

export async function updateUserPassword(userId: string, password: string) {
  const hashedPassword = generateHashedPassword(password);
  try {
    return await db
      .update(user)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(user.id, userId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update user password"
    );
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const [result] = await db.select().from(user).where(eq(user.id, userId));
    return result || null;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get user by id");
  }
}

// ============================================
// User Session Functions
// ============================================

export async function createUserSession({
  userId,
  sessionToken,
  ipAddress,
  userAgent,
  expiresAt,
}: {
  userId: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}): Promise<UserSession[]> {
  try {
    return await db
      .insert(userSession)
      .values({
        userId,
        sessionToken,
        ipAddress,
        userAgent,
        expiresAt,
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create user session"
    );
  }
}

export async function getUserSessions(userId: string): Promise<UserSession[]> {
  try {
    return await db
      .select()
      .from(userSession)
      .where(
        and(eq(userSession.userId, userId), gt(userSession.expiresAt, new Date()))
      )
      .orderBy(desc(userSession.lastActivityAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user sessions"
    );
  }
}

export async function validateSession(
  sessionToken: string
): Promise<UserSession | null> {
  try {
    const [session] = await db
      .select()
      .from(userSession)
      .where(
        and(
          eq(userSession.sessionToken, sessionToken),
          gt(userSession.expiresAt, new Date())
        )
      );

    if (session) {
      // Update last activity
      await db
        .update(userSession)
        .set({ lastActivityAt: new Date() })
        .where(eq(userSession.id, session.id));
    }

    return session || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to validate session"
    );
  }
}

export async function deleteSession(sessionToken: string) {
  try {
    return await db
      .delete(userSession)
      .where(eq(userSession.sessionToken, sessionToken));
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete session");
  }
}

export async function deleteSessionById(sessionId: string) {
  try {
    return await db
      .delete(userSession)
      .where(eq(userSession.id, sessionId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete session by id"
    );
  }
}

export async function deleteAllUserSessions(userId: string) {
  try {
    return await db
      .delete(userSession)
      .where(eq(userSession.userId, userId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all user sessions"
    );
  }
}

export async function deleteExpiredSessions() {
  try {
    return await db
      .delete(userSession)
      .where(lt(userSession.expiresAt, new Date()));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete expired sessions"
    );
  }
}

// ============================================
// Activity Log Functions
// ============================================

export async function logActivity({
  userId,
  action,
  metadata,
  ipAddress,
  userAgent,
}: {
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    return await db.insert(activityLog).values({
      userId,
      action,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (_error) {
    // Log errors but don't throw - activity logging shouldn't break functionality
    console.error("Failed to log activity:", _error);
  }
}

export async function getActivityLog(
  userId: string,
  limit = 50
): Promise<ActivityLog[]> {
  try {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get activity log"
    );
  }
}

// ============================================
// Failed Login & Account Lockout Functions
// ============================================

export async function incrementFailedLoginAttempts(userId: string) {
  try {
    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (!currentUser) return;

    const newAttempts = (currentUser.failedLoginAttempts || 0) + 1;
    const updateData: Partial<User> = {
      failedLoginAttempts: newAttempts,
      updatedAt: new Date(),
    };

    // Lock account after 5 failed attempts for 15 minutes
    if (newAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    return await db.update(user).set(updateData).where(eq(user.id, userId));
  } catch (_error) {
    console.error("Failed to increment failed login attempts:", _error);
  }
}

export async function resetFailedLoginAttempts(userId: string) {
  try {
    return await db
      .update(user)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
  } catch (_error) {
    console.error("Failed to reset failed login attempts:", _error);
  }
}

export async function isAccountLocked(userId: string): Promise<boolean> {
  try {
    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (!currentUser || !currentUser.lockedUntil) return false;
    return new Date() < currentUser.lockedUntil;
  } catch (_error) {
    return false;
  }
}

// ============================================
// Message Read Status Functions
// ============================================

export async function markMessageAsRead({
  messageId,
  readAt = new Date(),
}: {
  messageId: string;
  readAt?: Date;
}) {
  try {
    return await db
      .update(message)
      .set({ readAt })
      .where(eq(message.id, messageId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to mark message as read"
    );
  }
}

export async function markChatMessagesAsRead({
  chatId,
}: {
  chatId: string;
}) {
  try {
    // Mark all unread assistant messages in chat as read
    return await db
      .update(message)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(message.chatId, chatId),
          isNull(message.readAt),
          eq(message.role, "assistant")
        )
      );
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to mark chat messages as read"
    );
  }
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  try {
    const [result] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, userId),
          isNull(message.readAt),
          eq(message.role, "assistant")
        )
      );
    return result?.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get unread message count"
    );
  }
}
