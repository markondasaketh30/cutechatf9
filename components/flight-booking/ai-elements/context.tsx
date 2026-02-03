'use client';

import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from 'app/components/ui/hover-card';
import { Progress } from 'app/components/ui/progress';
import { cn, compact } from 'app/lib/utils';
import { Model, estimateCost } from 'tokenlens';
import { Shimmer } from './shimmer';
import { Circle, MessageCircle, ChevronsRight, GitCommit } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export type Usage = {
  used: number;
  input: number;
  output: number;
  reasoning: number;
  cache: number;
};

export type ContextProps = {
  usage: Usage;
  max: number;
  modelId: Model;
  className?: string;
  style?: React.CSSProperties;
};

const ContextContext = React.createContext<{
  usage: Usage;
  max: number;
  modelId: Model;
}>({
  usage: {
    used: 0,
    input: 0,
    output: 0,
    reasoning: 0,
    cache: 0,
  },
  max: 0,
  modelId: 'gpt-4',
});

function useUsage() {
  const context = React.use(ContextContext);
  if (!context) {
    throw new Error('useUsage must be used within a ContextProvider');
  }
  return context;
}

export function Context({
  usage,
  max,
  modelId,
  children,
  ...props
}: {
  usage: Usage;
  max: number;
  modelId: Model;
  children: React.ReactNode;
}) {
  return (
    <ContextContext.Provider value={{ usage, max, modelId }}>
      <HoverCard {...props}>{children}</HoverCard>
    </ContextContext.Provider>
  );
}

export function ContextIcon({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { usage, max } = useUsage();
  const percentage = max > 0 ? (usage.used / max) * 100 : 0;
  return (
    <div
      className={cn(
        'relative h-8 w-8 rounded-full border bg-background',
        className,
      )}
      {...props}
    >
      <svg
        className="absolute left-0 top-0 h-full w-full -rotate-90"
        viewBox="0 0 24 24"
      >
        <circle
          className="stroke-muted"
          cx="12"
          cy="12"
          r="10"
          strokeWidth="2"
          fill="none"
        />
        <circle
          className="stroke-foreground"
          cx="12"
          cy="12"
          r="10"
          strokeWidth="2"
          fill="none"
          strokeDasharray="62.83"
          strokeDashoffset={`calc(62.83 - (62.83 * ${percentage}) / 100)`}
          pathLength="62.83"
        />
      </svg>
    </div>
  );
}

export const ContextTrigger = React.forwardRef<
  React.ElementRef<typeof HoverCardTrigger>,
  React.ComponentProps<typeof HoverCardTrigger>
>(({ children, ...props }, ref) => {
  const { usage, max } = useUsage();
  return (
    <HoverCardTrigger {...props}>
      <div className="flex cursor-pointer items-center justify-center gap-1 rounded-full border bg-background p-1 pr-2 text-xs text-muted-foreground">
        <p>{Math.round((usage.used / max) * 100)}%</p>
      </div>
    </HoverCardTrigger>
  );
});

ContextTrigger.displayName = 'ContextTrigger';

export const ContextContent = React.forwardRef<
  React.ElementRef<typeof HoverCardContent>,
  React.ComponentProps<typeof HoverCardContent>
>(({ children, ...props }, ref) => {
  return (
    <HoverCardContent
      ref={ref}
      className="flex min-w-80 flex-col items-center justify-center gap-2 p-2"
      {...props}
    >
      {children}
    </HoverCardContent>
  );
});

ContextContent.displayName = 'ContextContent';

export function ContextContentHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { usage, max } = useUsage();
  return (
    <div className={cn('flex w-full flex-col gap-1', className)} {...props}>
      <div className="flex w-full items-center justify-between">
        <p className="text-sm font-semibold">Context Usage</p>
        <p className="text-sm font-semibold">
          <span className="text-muted-foreground">
            {compact(usage.used)} / {compact(max)}
          </span>
        </p>
      </div>
      <Progress value={(usage.used / max) * 100} />
    </div>
  );
}

export function ContextContentBody({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ContextContentFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { usage, modelId } = useUsage();
  const cost = estimateCost({ modelId, usage });
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between',
        className,
      )}
      {...props}
    >
      <p className="text-sm text-muted-foreground">Total</p>
      <p className="text-sm font-semibold">
        ~
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 5,
        }).format(cost)}
      </p>
    </div>
  );
}

function TokensWithCost({
  tokens,
  cost,
}: {
  tokens: number;
  cost: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-sm text-muted-foreground">{compact(tokens)}</p>
      <p className="text-sm text-muted-foreground">
        ~
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 5,
        }).format(cost)}
      </p>
    </div>
  );
}

export function ContextInputUsage() {
  const { usage, modelId } = useUsage();
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <MessageCircle size={12} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Input</p>
      </div>
      <TokensWithCost
        tokens={usage.input}
        cost={estimateCost({ modelId, usage: { input: usage.input } })}
      />
    </div>
  );
}

export function ContextOutputUsage() {
  const { usage, modelId } = useUsage();
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <ChevronsRight size={12} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Output</p>
      </div>
      <TokensWithCost
        tokens={usage.output}
        cost={estimateCost({ modelId, usage: { output: usage.output } })}
      />
    </div>
  );
}

export function ContextReasoningUsage() {
  const { usage, modelId } = useUsage();
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <GitCommit size={12} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Reasoning</p>
      </div>
      <TokensWithCost
        tokens={usage.reasoning}
        cost={estimateCost({ modelId, usage: { reasoning: usage.reasoning } })}
      />
    </div>
  );
}

export function ContextCacheUsage() {
  const { usage, modelId } = useUsage();
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <Circle size={12} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cache</p>
      </div>
      <TokensWithCost
        tokens={usage.cache}
        cost={estimateCost({ modelId, usage: { cache: usage.cache } })}
      />
    </div>
  );
}

export function ContextSkeleton() {
  return <Shimmer className="h-8 w-12 rounded-full" />;
}