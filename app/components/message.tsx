// message.tsx
import * as React from 'react';
import { type CoreMessage } from 'ai';
import { cn } from 'app/lib/utils';
import { Message } from '../../components/flight-booking/ai-elements/message'; // Assuming Message is from ai-elements
import { SpinnerV2 } from '../../components/spinner'; // Assuming SpinnerV2 exists

// User Message
export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <Message origin="user">
      <Message.Avatar name="User" origin="user" />
      <Message.Content>{children}</Message.Content>
    </Message>
  );
}

// Bot Message
export function BotMessage({
  children,
  className,
  showSources = false,
}: {
  children: React.ReactNode;
  className?: string;
  showSources?: boolean;
}) {
  return (
    <Message origin="assistant">
      <Message.Avatar name="AI" origin="assistant" />
      <Message.Content>
        {children}
        {showSources && (
          <div className="bg-gray-100 p-2 rounded-md text-sm mt-2">
            {/* Placeholder for sources */}
            Sources will be displayed here.
          </div>
        )}
      </Message.Content>
    </Message>
  );
}
