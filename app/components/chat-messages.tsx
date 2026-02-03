// ChatMessages.tsx
import * as React from 'react';
import { type CoreMessage } from 'ai';
import { StreamableValue } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { BotMessage, UserMessage } from '../message'; // Corrected import
import { SpinnerV2 } from '../spinner'; // Corrected import
import {
  Conversation,
  ConversationContent,
  ConversationScrollToBottom,
} from '../flight-booking/ai-elements/conversation'; // Corrected import
import { Tool as ToolComponent } from '../flight-booking/ai-elements/tool'; // Corrected import
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