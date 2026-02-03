'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'app/components/ui/collapsible';
import { cn } from 'app/lib/utils';
import { Check, ChevronDown, Loader, Network } from 'lucide-react';
import React from 'react';

export function Plan({
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

export function PlanHeader({
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
      <div className="flex items-center gap-2">
        <Network />
        <p>Plan</p>
      </div>
      {children}
    </div>
  );
}

export function PlanStep({
  name,
  status,
  children,
}: {
  name: string;
  status: 'in-progress' | 'done' | 'initial';
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible
      className="flex w-full flex-col items-center justify-center gap-2"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <CollapsibleTrigger asChild>
        <div className="flex w-full cursor-pointer items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {status === 'in-progress' && <Loader className="animate-spin" />}
            {status === 'done' && <Check />}
            <p>{name}</p>
          </div>
          <ChevronDown
            className={cn('transform transition-transform', {
              'rotate-180': isOpen,
            })}
          />
        </div>
      </CollapsibleTrigger>
      {children && (
        <CollapsibleContent asChild>
          <div className="flex w-full flex-col items-center justify-center gap-2">
            {children}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function PlanContent({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex w-full items-center justify-center">{children}</div>
  );
}