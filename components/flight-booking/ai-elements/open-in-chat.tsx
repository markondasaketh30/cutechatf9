'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'app/components/ui/dropdown-menu';
import { cn } from 'app/lib/utils';
import { Code, MessageCircle } from 'lucide-react';
import { copyToClipboard } from 'app/lib/utils';

export type Provider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'cohere';

export const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    url: 'https://chat.openai.com',
  },
  anthropic: {
    name: 'Anthropic',
    url: 'https://claude.ai',
  },
  google: {
    name: 'Google',
    url: 'https://gemini.google.com',
  },
  mistral: {
    name: 'Mistral',
    url: 'https://chat.mistral.ai',
  },
  cohere: {
    name: 'Cohere',
    url: 'https://cohere.com',
  },
};

export function OpenInChat({
  children,
  content,
  className,
  ...props
}: {
  children: React.ReactNode;
  content: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer items-center justify-center gap-1 rounded-full border bg-background p-1 pr-2 text-xs text-muted-foreground">
              <MessageCircle size={12} />
              <p>Open in</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Chat</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(PROVIDERS).map(([key, provider]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => {
                  copyToClipboard(content);
                  window.open(provider.url, '_blank');
                }}
              >
                {provider.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Code</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                copyToClipboard(content);
              }}
            >
              <div className="flex items-center gap-2">
                <Code size={12} />
                <p>Copy to clipboard</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {children}
    </div>
  );
}