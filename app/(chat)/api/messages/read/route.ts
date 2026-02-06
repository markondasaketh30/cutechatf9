import { auth } from "@/app/(auth)/auth";
import {
  getChatById,
  getUnreadMessageCount,
  markChatMessagesAsRead,
  markMessageAsRead,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { chatLogger } from "@/lib/logger";

/**
 * POST /api/messages/read - Mark messages as read
 * Body: { chatId: string } or { messageId: string }
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  try {
    const body = await request.json();
    const { chatId, messageId } = body;

    if (!chatId && !messageId) {
      return new ChatSDKError("bad_request:api").toResponse();
    }

    if (chatId) {
      // Verify the chat belongs to the user
      const chat = await getChatById({ id: chatId });

      if (!chat || chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }

      // Mark all messages in the chat as read
      await markChatMessagesAsRead({ chatId });

      return Response.json({ success: true, chatId });
    }

    if (messageId) {
      // Mark a single message as read
      await markMessageAsRead({ messageId });

      return Response.json({ success: true, messageId });
    }

    return new ChatSDKError("bad_request:api").toResponse();
  } catch (error) {
    chatLogger.error({ error }, "Mark read error");
    return new ChatSDKError("bad_request:chat").toResponse();
  }
}

/**
 * GET /api/messages/read - Get unread message count for the current user
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  try {
    const count = await getUnreadMessageCount(session.user.id);

    return Response.json({ unreadCount: count });
  } catch (error) {
    chatLogger.error({ error }, "Get unread count error");
    return new ChatSDKError("bad_request:chat").toResponse();
  }
}
