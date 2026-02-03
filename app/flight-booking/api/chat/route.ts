import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  render,
} from 'ai/rsc';
import { nanoid } from 'nanoid';
import { ExperimentalMessage } from 'ai';
import { ChevronsUpDown, Circle, CircleCheck, Plus } from 'lucide-react';

import { searchFlights, Flight } from 'app/lib/flights';

async function submit(formData?: FormData) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  const uiStream = createStreamableUI();

  // If the user has not provided a query, ask them for one.
  if (!formData) {
    uiStream.done(
      <div className="flex items-center gap-2">
        <Circle width={16} />
        <p className="text-sm">What are the best flights?</p>
      </div>,
    );
    return {
      id: nanoid(),
      role: 'assistant' as const,
      display: uiStream.value,
    };
  }

  const query = (formData.get('query') as string) ?? '';

  // If the user has provided a query, search for flights.
  uiStream.update(
    <div className="flex items-center gap-2">
      <ChevronsUpDown width={16} className="animate-spin" />
      <p className="text-sm">Searching for flights...</p>
    </div>,
  );

  const flights = await searchFlights(query);

  if (flights.length === 0) {
    uiStream.done(
      <div className="flex items-center gap-2">
        <Circle width={16} />
        <p className="text-sm">No flights found.</p>
      </div>,
    );
    aiState.done([
      ...aiState.get(),
      {
        role: 'assistant',
        name: 'searchFlights',
        content: `No flights found for "${query}"`,
      },
    ]);
    return {
      id: nanoid(),
      role: 'assistant' as const,
      display: uiStream.value,
    };
  }

  uiStream.done(
    <div className="flex items-center gap-2">
      <CircleCheck width={16} />
      <p className="text-sm">Found {flights.length} flights.</p>
    </div>,
  );

  aiState.done([
    ...aiState.get(),
    {
      role: 'assistant',
      name: 'searchFlights',
      content: JSON.stringify(flights),
    },
  ]);

  return {
    id: nanoid(),
    role: 'assistant' as const,
    display: uiStream.value,
  };
}

export type AIState = Array<ExperimentalMessage>;

export type UIState = Array<{
  id: string;
  role: 'user' | 'assistant';
  display: React.ReactNode;
}>;

export const AI = createAI<AIState, UIState>({
  actions: {
    submit,
  },
  initialUIState: [],
  initialAIState: [],
});