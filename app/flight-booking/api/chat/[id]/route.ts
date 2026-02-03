import { AI } from 'app/api/chat/route';
import { chatMessageHook } from 'app/lib/hooks/chat-message-hook';

export const maxDuration = 30;

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { messages } = await req.json();
  const hook = chatMessageHook(params.id);
  const result = await hook(messages);
  return result;
}