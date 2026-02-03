import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'app/components/ui/tooltip';
import { Button } from 'app/components/ui/button';
import { cn } from 'app/lib/utils';
import { MousePointer2 } from 'lucide-react';
import React from 'react';

export const Actions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-8 items-center justify-center rounded-lg border bg-background text-sm text-muted-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  );
});

Actions.displayName = 'Actions';

export function Action({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <MousePointer2 size={12} />
          Click to run
        </div>
      </TooltipContent>
    </Tooltip>
  );
}