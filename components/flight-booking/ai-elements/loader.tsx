import { cn } from 'app/lib/utils';
import { Loader as Icon } from 'lucide-react';

export function Loader({
  className,
  ...props
}: React.HTMLAttributes<SVGElement>) {
  return (
    <Icon
      className={cn('animate-spin text-muted-foreground', className)}
      {...props}
    />
  );
}