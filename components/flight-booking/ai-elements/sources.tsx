'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'app/components/ui/collapsible';
import { cn } from 'app/lib/utils';
import { Book as BookIcon, ChevronDown as ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

export const Sources = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <Collapsible
    className={cn('relative flex flex-col', className)}
    {...props}
  >
    {children}
  </Collapsible>
);

export const SourcesTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger>) => (
  <CollapsibleTrigger
    className={cn(
      'flex w-fit cursor-pointer items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground',
      className,
    )}
    {...props}
  >
    <BookIcon size={12} />
    Sources
    <ChevronDownIcon size={12} />
  </CollapsibleTrigger>
);

export const SourcesContent = ({
  className,
  ...props
}: React.ComponentProps<typeof CollapsibleContent>) => (
  <CollapsibleContent
    className={cn(
      'mt-2 flex flex-col gap-2 rounded-lg border bg-background p-2',
      className,
    )}
    {...props}
  />
);

export const Source = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex items-center gap-2', className)}
    {...props}
  >
    {children}
  </div>
);