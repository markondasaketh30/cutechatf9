import { auth, signOut } from "@/app/(auth)/auth";
import {
  deleteAllUserSessions,
  deleteSession,
  logActivity,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { authLogger } from "@/lib/logger";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const { searchParams } = new URL(request.url);
  const logoutAll = searchParams.get("all") === "true";

  try {
    if (logoutAll) {
      // Delete all sessions for the user
      await deleteAllUserSessions(session.user.id);
      await logActivity({
        userId: session.user.id,
        action: "logout_all_sessions",
      });
    }

    // Sign out from NextAuth
    await signOut({ redirect: false });

    return Response.json({ success: true });
  } catch (error) {
    authLogger.error({ error }, "Logout error");
    return new ChatSDKError("bad_request:auth").toResponse();
  }
}
