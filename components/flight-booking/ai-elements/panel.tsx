'use client';

import { Panel as PanelPrimitive } from '@xyflow/react';

import { cn } from 'app/lib/utils';

export function Panel({
  className,
  ...props
}: React.ComponentProps<typeof PanelPrimitive>) {
  return (
    <PanelPrimitive
      className={cn('shadow-none', className)}
      {...props}
    />
  );
}