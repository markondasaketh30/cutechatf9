'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'app/components/ui/tooltip';
import { Button } from 'app/components/ui/button';
import { cn } from 'app/lib/utils';
import { Check, Copy } from 'lucide-react';

export function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [isCopied, setIsCopied] = React.useState(false);

  const onCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(value);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="relative w-full rounded-lg border">
      <div className="absolute right-2 top-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onCopy}>
              {isCopied ? (
                <Check className="text-green-500" />
              ) : (
                <Copy className="text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy to clipboard</TooltipContent>
        </Tooltip>
      </div>
      <SyntaxHighlighter
        language={language}
        style={coldarkDark}
        customStyle={{
          width: '100%',
          padding: '1.5rem 1rem',
          borderRadius: '0.5rem',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono)',
          },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}