'use client';

import React from 'react';
import { cn } from 'app/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'app/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'app/components/ui/collapsible';
import { Button } from 'app/components/ui/button';
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export interface Message {
  id: string;
  type: string;
  text: string;
  image?: string;
}

export interface Todo {
  id: string;
  type: string;
  text: string;
  checked: boolean;
}

export function Queue({
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

export function QueueList({
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

export function QueueItem({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn('rounded-2xl', className)}
      {...props}
    >
      {children}
    </Card>
  );
}

export function QueueItemContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CardContent
      className={cn('p-4', className)}
      {...props}
    >
      {children}
    </CardContent>
  );
}

export function QueueItemDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CardDescription
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </CardDescription>
  );
}

export function QueueItemAction({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function QueueItemImage({
  src,
  alt,
  className,
  ...props
}: {
  src: string;
  alt: string;
} & React.HTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('w-full rounded-lg', className)}
      {...props}
    />
  );
}

export function QueueItemFile({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-muted p-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CollapsibleQueueList({
  title,
  children,
  className,
  ...props
}: { title: string } & React.HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = React.useState(true);
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <QueueList>{children}</QueueList>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function QueueItemSwitch({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function QueueItemSeparator() {
  return (
    <div className="flex h-4 w-full items-center justify-center">
      <div className="w-px flex-1 border-t border-dashed" />
      <ArrowDown className="mx-2 h-3 w-3 text-muted-foreground" />
      <div className="w-px flex-1 border-t border-dashed" />
    </div>
  );
}