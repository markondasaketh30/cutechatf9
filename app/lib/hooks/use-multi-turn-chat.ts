'use client';

import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  StreamableValue,
  createStreamableUI,
  createStreamableValue,
  useActions,
  useUIState,
} from 'ai/rsc';
import { Message, UIState } from 'app/lib/chat/utils';
import { WorkflowRun, WorkflowRunStep, useWorkflow } from 'app/lib/workflow';
import { ChatPanel } from 'app/components/chat-panel';
import { UserMessage } from 'app/components/message';
import { ArrowRight } from 'lucide-react';
import { Button } from 'app/components/ui/button';
import { Workflow } from 'app/lib/workflows';
import { getTools } from 'app/lib/tools';

const MULTI_TURN_MAGIC_MENTION = '@multi-turn';

/**
 * Custom hook for multi-turn chat sessions.
 * @param workflows - An array of workflow definitions.
 * @returns An object containing the current input, a function to handle input changes, and a function to submit a new message.
 */
export function useMultiTurnChat<W extends Workflow[]>(workflows: W) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useUIState();
  const { continueWorkflow } = useActions();

  // If there's an ongoing run, the input should be used to continue the run.
  const hasPendingRun = useRef(false);

  // If there are tool messages that can resume a workflow, show a button to do so.
  const toolMessages = messages.filter(
    (message: Message) => message.role === 'tool' && !message.output,
  );

  const onSubmit = useCallback(
    async (value: string) => {
      setInput('');
      const customData = {
        mentions: value.match(/@(\w+)/g)?.map(match => match.slice(1)) || [],
      };

      setMessages((currentMessages: UIState) => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>,
        },
      ]);

      let runId = null;
      if (
        hasPendingRun.current === true ||
        value.includes(MULTI_TURN_MAGIC_MENTION)
      ) {
        // If it's a multi-turn conversation, send the message to the current workflow.
        // If there's no runId yet, create a temporary one.
        const workflowMessage = messages.find(
          (message: Message) =>
            message.data?.workflowId && !message.output?.value,
        );
        runId = workflowMessage?.data?.workflowId || nanoid();
        hasPendingRun.current = true;
      }

      const response = await continueWorkflow(
        value,
        customData,
        runId,
        workflows.map(workflow => workflow.id),
      );

      // If the response is a UI stream, add it to the messages.
      if (response.value) {
        setMessages((currentMessages: UIState) => [
          ...currentMessages,
          {
            id: nanoid(),
            display: response.value,
          },
        ]);
      }
    },
    [continueWorkflow, messages, setMessages, workflows],
  );

  // If there are tool messages that can resume a workflow, show a button to do so.
  const onToolUse = useCallback(
    ({
      tool_invocation,
    }: {
      tool_invocation: { tool_name: string; tool_input: any };
    }) => {
      const tool = getTools().find(
        tool => tool.name === tool_invocation.tool_name,
      );

      if (!tool) {
        return;
      }

      setMessages((currentMessages: UIState) => [
        ...currentMessages,
        {
          id: nanoid(),
          display: (
            <div className="flex w-full flex-col gap-2 p-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="text-muted-foreground">
                  Continue workflow
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ),
          data: {
            tool_invocation,
          },
        },
      ]);
    },
    [setMessages],
  );

  return {
    input,
    handleInputChange: (e: any) => setInput(e.target.value),
    handleSubmit: onSubmit,
    onToolUse,
    messages,
  };
}