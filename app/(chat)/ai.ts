import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { Weather } from '@/components/weather';
import { getLanguageModel } from '@/lib/ai/providers';
import { nanoid } from 'nanoid';
import { systemPrompt } from '@/lib/ai/prompts';
import { Text } from '@/components/text';

// Define the AI state and UI state types
export type AIState = {
  chatId: string;
  messages: Message[];
};

export type UIState = {
  id: string;
  display: ReactNode;
  isGenerating?: boolean;
}[];

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolInvocations?: ToolInvocations;
};

export type ToolInvocations = {
  toolName: string;
  args: any;
  result: any;
}[];

async function chatWorkflow(input: string) {
  "use workflow";

  const history = getMutableAIState<typeof AI>();
  history.update({
    ...history.get(),
    messages: [
      ...history.get().messages,
      { id: nanoid(), role: 'user', content: input },
    ],
  });

  const result = await streamUI({
    model: getLanguageModel('openai:gpt-4-turbo-preview'),
    system: systemPrompt({}),
    prompt: input,
    text: ({ content }) => {
      return <Text text={content} />
    },
    tools: {
      getWeather: {
        description: 'Get the weather for a location.',
        parameters: z.object({
          city: z.string().describe('The city to get the weather for.'),
          unit: z
            .enum(['celsius', 'fahrenheit'])
            .describe('The unit to display the temperature in').default('celsius'),
        }),
        generate: async function* ({ city, unit }) {
          yield <div>Loading weather...</div>;
          const weather = await getWeather.execute({ city, unit });
          history.done({
            ...history.get(),
            messages: [
              ...history.get().messages,
              {
                id: nanoid(),
                role: 'tool',
                content: JSON.stringify(weather),
                toolInvocations: [
                  {
                    toolName: 'getWeather',
                    args: { city, unit },
                    result: weather,
                  },
                ],
              },
            ],
          });
          return <Weather weatherAtLocation={weather} />;
        },
      },
    },
  });

  return {
    id: nanoid(),
    display: result.value,
  };
}

export const AI = createAI<AIState, UIState>({
  actions: {
    sendMessage: chatWorkflow,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
});