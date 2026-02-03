'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'app/components/ui/collapsible';
import { Button } from 'app/components/ui/button';
import { Input } from 'app/components/ui/input';
import { cn } from 'app/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Triangle,
  Code,
} from 'lucide-react';
import React from 'react';

export function WebPreview({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-lg border',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function WebPreviewNavigation({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-2 border-b bg-background p-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function WebPreviewNavigationButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function WebPreviewUrl({
  url,
  setUrl,
  className,
  ...props
}: {
  url: string;
  setUrl: (url: string) => void;
} & React.HTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      value={url}
      onChange={e => setUrl(e.target.value)}
      className={cn('h-8 w-full', className)}
      {...props}
    />
  );
}

export function WebPreviewBody({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex-1 bg-background', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function WebPreviewConsole({
  logs,
  className,
  ...props
}: { logs: string[] } & React.HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <CollapsibleTrigger asChild>
        <div className="flex w-full cursor-pointer items-center justify-between border-t bg-background p-2">
          <div className="flex items-center gap-2">
            <Code size={16} />
            <p className="text-sm">Console</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{logs.length} logs</p>
            {isOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2 p-2">
          {logs.map((log, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
            >
              <Triangle
                size={12}
                className="text-yellow-500"
              />
              <p className="text-sm">{log}</p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}