'use client';

import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from 'app/components/ui/avatar';
import { cn } from 'app/lib/utils';
import { StreamableValue } from 'ai/rsc';
import { useStreamableText } from 'app/lib/hooks/use-streamable-text';

const messageVariants = cva('flex w-full flex-col items-start gap-2', {
  variants: {
    origin: {
      user: 'items-end',
      assistant: 'items-start',
    },
  },
  defaultVariants: {
    origin: 'assistant',
  },
});

export interface MessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageVariants> {
  children: React.ReactNode;
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, origin, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(messageVariants({ origin, className }))}
      {...props}
    />
  ),
);
Message.displayName = 'Message';

const contentVariants = cva(
  'relative flex w-fit max-w-[90%] flex-col gap-2 rounded-lg border bg-background p-2',
  {
    variants: {
      variant: {
        contained: '',
        flat: 'border-none bg-transparent p-0',
      },
    },
    defaultVariants: {
      variant: 'contained',
    },
  },
);

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof contentVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(contentVariants({ variant, className }))}
    {...props}
  />
));
MessageContent.displayName = 'MessageContent';

const MessageAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  React.ComponentPropsWithoutRef<typeof Avatar> & {
    name: string;
    origin?: 'user' | 'assistant';
  }
>(({ className, name, origin, ...props }, ref) => (
  <Avatar ref={ref} className={cn(className)} {...props}>
    <AvatarImage src={`https://avatar.vercel.sh/${name}`} alt={name} />
    <AvatarFallback>
      {origin === 'user' ? 'U' : 'A'}
    </AvatarFallback>
  </Avatar>
));
MessageAvatar.displayName = 'MessageAvatar';

export { Message, MessageContent, MessageAvatar };