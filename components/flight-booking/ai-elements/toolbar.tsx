'use client';
import { NodeToolbar } from '@xyflow/react';
import { cn } from 'app/lib/utils';
import type { ComponentProps } from 'react';

export const Toolbar = ({
  className,
  ...props
}: ComponentProps<typeof NodeToolbar>) => (
  <NodeToolbar
    position="bottom"
    className={cn(
      'flex h-auto w-auto items-center gap-1 rounded-md border bg-background p-1',
      className,
    )}
    {...props}
  />
);