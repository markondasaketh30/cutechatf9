'use client';

import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'app/components/ui/tooltip';
import { cn } from 'app/lib/utils';
import { Shimmer } from './shimmer';

export function Branch({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      {...props}
      style={{
        ...props.style,
      }}
    >
      {children}
    </div>
  );
}

export function BranchButton({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('flex items-center gap-2', className)}
      {...props}
      style={{
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}

export function BranchIcon({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-5 w-5 items-center justify-center rounded-full border bg-background text-foreground',
        className,
      )}
      {...props}
      style={{
        ...props.style,
      }}
    >
      {children}
    </div>
  );
}

export function BranchName({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
      style={{
        ...props.style,
      }}
    >
      {children}
    </p>
  );
}

export function BranchContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(className)}
      {...props}
      style={{
        ...props.style,
      }}
    >
      {children}
    </div>
  );
}

export function BranchNav({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex w-full items-center', className)}
      {...props}
      style={{
        ...props.style,
      }}
    >
      {children}
    </div>
  );
}

export function BranchDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
      style={{
        ...props.style,
      }}
    >
      {children}
    </p>
  );
}

export function BranchIndicator() {
  const [direction, setDirection] = React.useState('none');
  const [prevX, setPrevX] = React.useState(0);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      if (currentX > prevX) {
        setDirection('right');
      } else if (currentX < prevX) {
        setDirection('left');
      }
      setPrevX(currentX);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [prevX]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-full cursor-pointer items-center justify-center">
            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="flex w-full items-center justify-center text-center"
        >
          <p className="text-sm text-muted-foreground">Scroll to see options</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function BranchSkeleton() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <Shimmer className="h-8 w-1/2" />
      <div className="flex w-full items-center justify-between">
        <Shimmer className="h-4 w-12" />
        <Shimmer className="h-4 w-24" />
      </div>
    </div>
  );
}