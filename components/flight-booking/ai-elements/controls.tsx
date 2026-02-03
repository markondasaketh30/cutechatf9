'use client';

import { Controls as ControlsPrimitive } from '@xyflow/react';

import { cn } from 'app/lib/utils';

export function Controls({
  className,
  ...props
}: React.ComponentProps<typeof ControlsPrimitive>) {
  return (
    <ControlsPrimitive
      className={cn('shadow-none', className)}
      {...props}
    />
  );
}