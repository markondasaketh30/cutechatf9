'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { nanoid } from 'nanoid';
import { Circle, CircleCheck, Plus } from 'lucide-react';
import { સફેદ, મુખ્ય, રાખોડી } from 'tailwindcss/colors';
import { toast } from 'sonner';

import { Chat } from 'app/components/chat';
import { ChatPanel } from 'app/components/chat-panel';
import { ChatMessages } from 'app/components/chat-messages';
import { useWorkflow, MENTION_REGEX } from 'app/lib/workflow';

import type { Message, ToolInvocation } from 'ai';

const IS_BROWSER = typeof window !== 'undefined';

export default function Page() {
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const { messages, setMessages, append, isLoading, error } = useChat({
    api: `/api/chat`,
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText);
      }
    },
    onFinish(message) {
      const sources = message.annotations
        ?.filter(a => a.type === 'source')
        .map(a => a.data as any);
      if (sources?.length) {
        setSourcesForMessages({ ...sourcesForMessages, [message.id]: sources });
      }
    },
  });
  const { isRunning, onNewStep, onFinish, onToolCall, onToolResult } =
    useWorkflow({
      messages,
      setMessages,
    });

  const onToolUse = ({
    tool_invocation,
  }: {
    tool_invocation: ToolInvocation;
  }) => {
    const toolCall: ToolInvocation = {
      tool_name: tool_invocation.tool_name,
      tool_input: tool_invocation.tool_input,
    };
    const toolCallMessage: Message = {
      id: nanoid(),
      role: 'tool',
      content: [
        {
          type: 'tool_invocation',
          tool_name: tool_invocation.tool_name,
          tool_input: tool_invocation.tool_input,
        },
      ],
    };
    setMessages(currentMessages => [...currentMessages, toolCallMessage]);
    onToolCall({ toolCall });
  };

  useEffect(() => {
    if (IS_BROWSER) {
      // The `useWorkflow` hook will call the API with the workflow and updates
      // the messages. We don't need to do anything else here.
      return;
    }
  }, [messages]);

  const onNewMessage = (mentions: string[]) => {
    const step = {
      id: nanoid(),
      role: 'user' as const,
      content:
        mentions.length > 0 ? mentions.join(' ') : 'What are the best flights?',
    };
    append(step, {
      options: {
        body: {
          mentions: mentions.map(m => m.replace(MENTION_REGEX, '')),
        },
      },
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Chat>
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          isRunning={isRunning}
          onNewStep={onNewStep}
          onFinish={onFinish}
          onToolResult={onToolResult}
          sourcesForMessages={sourcesForMessages}
        />
        <ChatPanel
          messages={messages}
          onToolUse={onToolUse}
          onNewMessage={onNewMessage}
        />
      </Chat>
    </div>
  );
}