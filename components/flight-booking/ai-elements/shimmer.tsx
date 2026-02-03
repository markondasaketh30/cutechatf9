'use client';

import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { cn } from 'app/lib/utils';
import { useRaf } from '@hooks/use-raf';

export function Shimmer({
  children,
  as: As = 'div',
  className,
  duration = 2000,
  spread = 0.2,
  ...props
}: {
  children?: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}) {
  const progress = useMotionValue(0);

  useRaf(t => {
    progress.set((t % duration) / duration);
  });

  const gradient = useMotionTemplate`radial-gradient(
    farthest-corner circle at 50% 50%,
    hsl(0 0% 100% / 8%) ${spread * 50}%,
    hsl(0 0% 100% / 0%) ${spread * 100}%
  )`;

  return (
    <As
      className={cn('relative overflow-hidden', 'shimmer', className)}
      {...props}
    >
      <motion.div
        className="shimmer-content"
        style={{
          // @ts-expect-error -- motion values not supported
          '--shimmer-gradient': gradient,
          '--shimmer-progress': progress,
        }}
      >
        {children}
      </motion.div>
    </As>
  );
}