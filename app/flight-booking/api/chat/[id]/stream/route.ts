import { getRun } from 'app/lib/runs';
import { createUIMessageStreamResponse } from 'app/lib/utils';
import { URL } from 'url';

// export const maxDuration = 5;

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const url = new URL(req.url);
  const startIndex = url.searchParams.get('startIndex');
  // It's possible that the run is not yet created.
  const run = await getRun(params.id);
  const stream = await run.stream(Number(startIndex));
  return createUIMessageStreamResponse(stream);
}