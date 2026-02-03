import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'app/lib/utils';
import { Button } from 'app/components/ui/button';
import { Input } from 'app/components/ui/input';
import { Textarea } from 'app/components/ui/textarea';

const inputGroupVariants = cva(
  'relative flex items-center w-full overflow-hidden rounded-md border border-input focus-within:border-accent-foreground',
  {
    variants: {
      size: {
        default: 'h-10 text-sm',
        sm: 'h-9 text-xs',
        lg: 'h-11 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export interface InputGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inputGroupVariants> {}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(inputGroupVariants({ size, className }))}
      {...props}
    />
  ),
);
InputGroup.displayName = 'InputGroup';

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-center bg-secondary text-secondary-foreground h-full px-3',
      className,
    )}
    {...props}
  />
));
InputGroupAddon.displayName = 'InputGroupAddon';

const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn('rounded-l-none', className)}
    {...props}
  />
));
InputGroupButton.displayName = 'InputGroupButton';

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('p-2', className)}
    {...props}
  />
));
InputGroupText.displayName = 'InputGroupText';

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      'border-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0',
      className,
    )}
    {...props}
  />
));
InputGroupInput.displayName = 'InputGroupInput';

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea>
>(({ className, ...props }, ref) => (
  <Textarea
    ref={ref}
    className={cn(
      'border-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0',
      className,
    )}
    {...props}
  />
));
InputGroupTextarea.displayName = 'InputGroupTextarea';

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};