'use client';

import React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'app/components/ui/collapsible';
import { cn } from 'app/lib/utils';
import { Shimmer } from './shimmer';
import { BrainCircuit, ChevronDown } from 'lucide-react';
import { formatTime } from 'app/lib/utils';

export function Reasoning({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Collapsible
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      {children}
    </Collapsible>
  );
}

export const ReasoningTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsibleTrigger>,
  React.ComponentProps<typeof CollapsibleTrigger> & {
    isThinking: boolean;
    duration?: number;
  }
>(({ children, isThinking, duration, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <CollapsibleTrigger
      ref={ref}
      asChild
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <div className="flex w-full cursor-pointer items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BrainCircuit size={12} />
          <p className="text-sm font-semibold">Reasoning</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {isThinking
              ? 'Thinking...'
              : duration
                ? formatTime(duration)
                : null}
          </p>
          <ChevronDown
            size={12}
            className={cn('transform transition-transform', {
              'rotate-180': isOpen,
            })}
          />
        </div>
      </div>
    </CollapsibleTrigger>
  );
});

ReasoningTrigger.displayName = 'ReasoningTrigger';

export const ReasoningContent = React.forwardRef<
  React.ElementRef<typeof CollapsibleContent>,
  React.ComponentProps<typeof CollapsibleContent>
>(({ children, ...props }, ref) => {
  return (
    <CollapsibleContent ref={ref} {...props}>
      <div className="relative flex w-full flex-col gap-2 rounded-lg border bg-background p-2">
        {children}
      </div>
    </CollapsibleContent>
  );
});

ReasoningContent.displayName = 'ReasoningContent';

export function ReasoningSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit size={12} />
          <p className="text-sm font-semibold">Reasoning</p>
        </div>
        <div className="flex items-center gap-2">
          <Shimmer className="h-4 w-12" />
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-2">
        <Shimmer className="h-8 w-full" />
      </div>
    </div>
  );
}