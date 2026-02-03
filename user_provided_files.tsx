Here are the files:

```tsx
// Chat.tsx
import * as React from 'react';
import { cn } from 'app/lib/utils';

export const Chat = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative flex h-full overflow-hidden', className)}
    {...props}
  />
));
Chat.displayName = 'Chat';

// ChatPanel.tsx
import * as React from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { UserMessage } from './message';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from 'app/components/ui/button';
import { ChatInput } from 'app/components/ai-elements/chat-input';
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

// ChatMessages.tsx
import * as React from 'react';
import { type CoreMessage } from 'ai';
import { StreamableValue } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { BotMessage, UserMessage } from './message';
import { SpinnerV2 } from 'app/components/spinner';
import {
  Conversation,
  ConversationContent,
  ConversationScrollToBottom,
} from 'app/components/ai-elements/conversation';
import { Tool as ToolComponent } from 'app/components/ai-elements/tool';
import { WorkflowRun, useWorkflow } from 'app/lib/workflow';
import { getTools } from 'app/lib/tools';

interface ChatMessagesProps {
  messages: CoreMessage[];
  isLoading: boolean;
  isRunning: boolean;
  onNewStep: (step: any) => void;
  onFinish: (output: any) => void;
  onToolResult: (toolName: string, output: any) => void;
  sourcesForMessages: Record<string, any>;
}

export function ChatMessages({
  messages,
  isLoading,
  isRunning,
  onNewStep,
  onFinish,
  onToolResult,
  sourcesForMessages,
}: ChatMessagesProps) {
  const { isRunning: isWorkflowRunning, steps } = useWorkflow();

  return (
    <Conversation>
      <ConversationContent>
        {messages.map(message => {
          if (message.role === 'tool') {
            const toolInvocation = message.content[0];
            const tool = getTools().find(
              tool => tool.name === toolInvocation.tool_name,
            );

            if (!tool) {
              return null;
            }

            return (
              <ToolComponent key={message.id}>
                <ToolComponent.Header>
                  <ToolComponent.Trigger
                    name={tool.label}
                    status="running"
                  />
                </ToolComponent.Header>
                <ToolComponent.Content>
                  <ToolComponent.Input value={toolInvocation.tool_input} />
                </ToolComponent.Content>
              </ToolComponent>
            );
          }

          if (message.role === 'assistant') {
            const annotations = sourcesForMessages[message.id] || [];

            return (
              <BotMessage key={message.id} showSources={annotations.length > 0}>
                {message.content}
              </BotMessage>
            );
          }

          if (message.role === 'user') {
            return <UserMessage key={message.id}>{message.content}</UserMessage>;
          }
          return null;
        })}
        {isLoading && (
          <BotMessage key={nanoid()}>
            <SpinnerV2 />
          </BotMessage>
        )}
      </ConversationContent>
      <ConversationScrollToBottom />
    </Conversation>
  );
}
```