import { NextRequest } from 'next/server';
import { getWorkflow, bookFlight } from 'app/lib/workflows';
import { Reservation } from 'app/lib/flights';

export const maxDuration = 30;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id, price, query, result } = await req.json();

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  // TODO: resume the workflow
  const workflow = await getWorkflow(id);
  const reservation: Reservation = {
    price,
    ...JSON.parse(result),
  };
  await workflow.resume(bookFlight, {
    query,
    result: reservation,
  });

  return new Response('OK');
}