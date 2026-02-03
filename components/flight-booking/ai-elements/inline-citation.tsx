'use client';

import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from 'app/components/ui/hover-card';
import { cn } from 'app/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from 'app/components/ui/carousel';
import { Book, Check } from 'lucide-react';

const InlineCitationContext = React.createContext<{
  source: any;
}>({
  source: {},
});

function useInlineCitation() {
  const context = React.use(InlineCitationContext);
  if (!context) {
    throw new Error(
      'useInlineCitation must be used within an InlineCitationProvider',
    );
  }
  return context;
}

export function InlineCitation({
  source,
  children,
  ...props
}: {
  source: any;
  children: React.ReactNode;
}) {
  return (
    <InlineCitationContext.Provider value={{ source }}>
      <HoverCard {...props}>{children}</HoverCard>
    </InlineCitationContext.Provider>
  );
}

export function InlineCitationText({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { source } = useInlineCitation();
  const [copied, setCopied] = React.useState(false);
  return (
    <HoverCardTrigger asChild>
      <span
        className={cn(
          'cursor-pointer rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground',
          className,
        )}
        {...props}
      >
        {source.name}
      </span>
    </HoverCardTrigger>
  );
}

export const InlineCitationContent = React.forwardRef<
  React.ElementRef<typeof HoverCardContent>,
  React.ComponentProps<typeof HoverCardContent>
>(({ children, ...props }, ref) => {
  return (
    <HoverCardContent
      ref={ref}
      className="flex min-w-80 flex-col items-center justify-center gap-2 p-2"
      {...props}
    >
      {children}
    </HoverCardContent>
  );
});

InlineCitationContent.displayName = 'InlineCitationContent';

export function InlineCitationContentHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex w-full flex-col gap-1', className)}
      {...props}
    ></div>
  );
}

export function InlineCitationCarousel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { source } = useInlineCitation();
  return (
    <Carousel className={cn('w-full', className)}>
      <CarouselContent>
        {source.map((s: any) => (
          <CarouselItem key={s.name}>
            <div className="flex w-full flex-col gap-2 rounded-lg border bg-background p-2">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <Book size={12} />
                  <p className="text-sm">{s.name}</p>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export function InlineCitationSource({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { source } = useInlineCitation();
  const [copied, setCopied] = React.useState(false);
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-lg border bg-background p-2',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Book size={12} />
          <p className="text-sm">{source.name}</p>
        </div>
        <button
          className="rounded-full bg-muted p-1 text-muted-foreground"
          onClick={() => {
            setCopied(true);
            navigator.clipboard.writeText(source.url);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check size={12} /> : <Book size={12} />}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">{source.description}</p>
    </div>
  );
}