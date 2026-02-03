// ChatPanel.tsx
import * as React from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { UserMessage } from '../message'; // Corrected import
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '../flight-booking/ui/button'; // Corrected import
import { ChatInput } from '../flight-booking/ai-elements/prompt-input'; // Corrected import
import { type AI } from 'app/api/chat/route';

interface ChatPanelProps {
  messages: any[];
  onToolUse: (toolInvocation: any) => void;
  onNewMessage: (mentions: string[]) => void;
}

export function ChatPanel({
  messages,
  onToolUse,
  onNewMessage,
}: ChatPanelProps) {
  const [input, setInput] = React.useState('');
  const [aiMessages, setAIMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();

  const handleSubmit = async () => {
    setAIMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{input}</UserMessage>,
      },
    ]);

    const response = await submitUserMessage(input);
    setAIMessages(currentMessages => [...currentMessages, response]);
    setInput('');
  };

  return (
    <div className="relative flex flex-col bg-background px-4 pb-4">
      <div className="flex items-center justify-center py-4">
        <Button
          variant="outline"
          size="sm"
          className="pr-3"
          onClick={() => {
            setAIMessages([]);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={false}
        onSubmit={handleSubmit}
      />
    </div>
  );
}