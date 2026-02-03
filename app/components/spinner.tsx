// spinner.tsx
import * as React from 'react';
import { Loader } from 'lucide-react';
import { cn } from 'app/lib/utils';

export function SpinnerV2({
  className,
  ...props
}: React.HTMLAttributes<SVGElement>) {
  return (
    <Loader
      className={cn('animate-spin text-muted-foreground', className)}
      {...props}
    />
  );
}