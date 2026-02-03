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
  ChevronRight,
  Code,
  Loader,
  Terminal,
  Wrench,
  X,
} from 'lucide-react';
import React from 'react';
import { CodeBlock } from './code-block';
import { Shimmer } from './shimmer';
import { formatTime } from 'app/lib/utils';
import { StreamableValue } from 'ai/rsc';
import { useStreamableText } from 'app/lib/hooks/use-streamable-text';

const ToolContext = React.createContext<{
  isCollapsed: boolean;
}>({
  isCollapsed: false,
});

export function useTool() {
  const context = React.use(ToolContext);
  if (!context) {
    throw new Error('useTool must be used within a Tool');
  }
  return context;
}

export function Tool({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  return (
    <ToolContext.Provider value={{ isCollapsed }}>
      <Collapsible
        open={!isCollapsed}
        onOpenChange={isOpen => setIsCollapsed(!isOpen)}
        className={cn(
          'relative flex w-full flex-col gap-2 rounded-lg border bg-background p-2',
          className,
        )}
        {...props}
      >
        {children}
      </Collapsible>
    </ToolContext.Provider>
  );
}

export function ToolHeader({
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
        <Wrench />
        <p className="font-semibold">Tool</p>
      </div>
      {children}
    </div>
  );
}

export function ToolTrigger({
  status,
  name,
  duration,
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger> & {
  status: 'running' | 'success' | 'error';
  name: string;
  duration?: number;
}) {
  const { isCollapsed } = useTool();
  return (
    <CollapsibleTrigger asChild {...props}>
      <div className="flex w-full cursor-pointer items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'running' && <Loader className="animate-spin" />}
          {status === 'success' && <Check />}
          {status === 'error' && <X />}
          <p className="text-sm">{name}</p>
        </div>
        <div className="flex items-center gap-2">
          {duration && (
            <p className="text-sm text-muted-foreground">
              {formatTime(duration)}
            </p>
          )}
          {isCollapsed ? <ChevronRight /> : <ChevronDown />}
        </div>
      </div>
    </CollapsibleTrigger>
  );
}

export const ToolContent = React.forwardRef<
  React.ElementRef<typeof CollapsibleContent>,
  React.ComponentProps<typeof CollapsibleContent>
>(({ children, ...props }, ref) => {
  return (
    <CollapsibleContent
      ref={ref}
      className="flex w-full flex-col gap-2"
      {...props}
    >
      {children}
    </CollapsibleContent>
  );
});

ToolContent.displayName = 'ToolContent';

export function ToolInput({ value }: { value: any }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <Code />
        <p className="text-sm font-semibold">Input</p>
      </div>
      <CodeBlock language="json" value={JSON.stringify(value, null, 2)} />
    </div>
  );
}

export function ToolOutput({
  value,
}: {
  value: string | StreamableValue<string>;
}) {
  const text = useStreamableText(value);
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <Terminal />
        <p className="text-sm font-semibold">Output</p>
      </div>
      <pre className="w-full rounded-lg border bg-background p-2">
        <code>{text}</code>
      </pre>
    </div>
  );
}

export function ToolError({ value }: { value: string }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <Terminal />
        <p className="text-sm font-semibold">Error</p>
      </div>
      <pre className="w-full rounded-lg border bg-background p-2 text-red-500">
        <code>{value}</code>
      </pre>
    </div>
  );
}

export function ToolSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border bg-background p-2">
      <div className="flex w-full items-center justify-between">
        <Shimmer className="h-8 w-1/2" />
      </div>
      <Shimmer className="h-24 w-full" />
    </div>
  );
}