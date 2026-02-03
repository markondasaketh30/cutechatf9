'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'app/components/ui/collapsible';
import { cn } from 'app/lib/utils';
import {
  Check,
  ChevronDown,
  Loader,
  MessageSquare,
  Search,
} from 'lucide-react';
import React from 'react';

export function ChainOfThought({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 rounded-lg border bg-background p-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ChainOfThoughtHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex w-full flex-row items-center justify-between',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ChainOfThoughtStep({
  label,
  status,
  children,
  ...props
}: {
  label: string;
  status: 'in-progress' | 'done' | 'initial';
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible
      className="flex w-full flex-col items-center justify-center gap-2"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <CollapsibleTrigger asChild>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'in-progress' && <Loader className="animate-spin" />}
            {status === 'done' && <Check />}
            <p>{label}</p>
          </div>
          <ChevronDown
            className={cn('transform transition-transform', {
              'rotate-180': isOpen,
            })}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <div className="flex w-full flex-col items-center justify-center gap-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ChainOfThoughtSearchResults({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      {children}
    </div>
  );
}

export function ChainOfThoughtSearchResult({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex w-full items-center justify-between">{children}</div>
  );
}

export function ChainOfThoughtContent({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex w-full items-center justify-center">{children}</div>
  );
}

export function ChainOfThoughtImage({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex w-full items-center justify-center">{children}</div>
  );
}