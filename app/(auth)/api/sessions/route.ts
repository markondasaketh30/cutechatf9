import { auth } from "@/app/(auth)/auth";
import {
  deleteSessionById,
  getUserSessions,
  logActivity,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { authLogger } from "@/lib/logger";

/**
 * GET /api/sessions - Get all active sessions for the current user
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  try {
    const sessions = await getUserSessions(session.user.id);

    // Return sessions without the token for security
    const safeSessions = sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastActivityAt: s.lastActivityAt,
      expiresAt: s.expiresAt,
    }));

    return Response.json({ sessions: safeSessions });
  } catch (error) {
    authLogger.error({ error }, "Get sessions error");
    return new ChatSDKError("bad_request:auth").toResponse();
  }
}

/**
 * DELETE /api/sessions?id=<session_id> - Revoke a specific session
 */
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("id");

  if (!sessionId) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    // Verify the session belongs to the user
    const userSessions = await getUserSessions(session.user.id);
    const targetSession = userSessions.find((s) => s.id === sessionId);

    if (!targetSession) {
      return new ChatSDKError("not_found:auth").toResponse();
    }

    // Delete the session
    await deleteSessionById(sessionId);

    // Log the activity
    await logActivity({
      userId: session.user.id,
      action: "session_revoked",
      metadata: { revokedSessionId: sessionId },
    });

    return Response.json({ success: true });
  } catch (error) {
    authLogger.error({ error }, "Delete session error");
    return new ChatSDKError("bad_request:auth").toResponse();
  }
}
