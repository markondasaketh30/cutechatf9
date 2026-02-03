'use client';

import * as React from 'react';
import useStickToBottom from 'use-stick-to-bottom';

import { cn } from 'app/lib/utils';
import { Button, type ButtonProps } from 'app/components/ui/button';
import { ArrowDown } from 'lucide-react';

const ConversationContext = React.createContext<{
  isAtBottom: boolean;
  scrollToBottom: () => void;
}>({
  isAtBottom: true,
  scrollToBottom: () => {},
});

export function useConversation() {
  const context = React.use(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a Conversation');
  }
  return context;
}

const Conversation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { stickToBottom, isAtBottom, scrollableNodeRef, scrollToBottom } =
    useStickToBottom();
  return (
    <ConversationContext.Provider value={{ isAtBottom, scrollToBottom }}>
      <div
        ref={scrollableNodeRef}
        className={cn('h-full w-full overflow-y-auto', className)}
        {...props}
      >
        {children}
      </div>
    </ConversationContext.Provider>
  );
});
Conversation.displayName = 'Conversation';

const ConversationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pb-16 pt-4',
      className,
    )}
    {...props}
  />
));
ConversationContent.displayName = 'ConversationContent';

const ConversationEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex h-full items-center justify-center', className)}
    {...props}
  />
));
ConversationEmpty.displayName = 'ConversationEmpty';

const ConversationScrollToBottom = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, ...props }, ref) => {
  const { isAtBottom, scrollToBottom } = useConversation();

  return (
    <Button
      ref={ref}
      onClick={scrollToBottom}
      size="icon"
      variant="outline"
      className={cn(
        'absolute right-10 top-10 z-10 bg-background transition-opacity duration-300',
        isAtBottom ? 'opacity-0' : 'opacity-100',
        className,
      )}
      {...props}
    >
      <ArrowDown />
    </Button>
  );
});
ConversationScrollToBottom.displayName = 'ConversationScrollToBottom';

export {
  Conversation,
  ConversationContent,
  ConversationScrollToBottom,
  ConversationEmpty,
};