'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'app/components/ui/collapsible';
import { cn } from 'app/lib/utils';
import { Check, ChevronDown, Loader } from 'lucide-react';
import React from 'react';

export function Task({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function TaskTrigger({
  children,
  className,
  status,
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger> & {
  status: 'in-progress' | 'done' | 'initial';
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <CollapsibleTrigger
      className={cn(
        'flex w-full cursor-pointer items-center justify-between',
        className,
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {status === 'in-progress' && <Loader className="animate-spin" />}
        {status === 'done' && <Check />}
        <p>Task</p>
      </div>
      <ChevronDown
        className={cn('transform transition-transform', {
          'rotate-180': isOpen,
        })}
      />
    </CollapsibleTrigger>
  );
}

export function TaskContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CollapsibleContent
      className={cn(
        'flex w-full flex-col gap-2 rounded-lg border bg-background p-2',
        className,
      )}
      {...props}
    >
      {children}
    </CollapsibleContent>
  );
}