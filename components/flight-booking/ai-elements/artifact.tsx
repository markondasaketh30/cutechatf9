import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'app/components/ui/card';
import { cn } from 'app/lib/utils';
import { Shimmer } from './shimmer';

export function Artifact({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn('h-full w-full overflow-hidden', className)}
      {...props}
    >
      <CardContent className="h-full w-full p-0">{children}</CardContent>
    </Card>
  );
}

export function ArtifactHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CardHeader
      className={cn(
        'user-select-none pointer-events-none flex flex-row items-center justify-between space-y-0',
        className,
      )}
      {...props}
    >
      {children}
    </CardHeader>
  );
}

export function ArtifactTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CardTitle className={cn('text-base', className)} {...props}>
      {children}
    </CardTitle>
  );
}

export function ArtifactDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CardDescription className={cn(className)} {...props}>
      {children}
    </CardDescription>
  );
}

export function ArtifactContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function ArtifactFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-4 pt-0 text-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ArtifactSkeleton() {
  return <Shimmer className="h-full w-full" />;
}