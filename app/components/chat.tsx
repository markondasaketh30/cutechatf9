// Chat.tsx
import * as React from 'react';
import { cn } from 'app/lib/utils';

export const Chat = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative flex h-full overflow-hidden', className)}
    {...props}
  />
));
Chat.displayName = 'Chat';