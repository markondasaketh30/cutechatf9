'use client';
import { StreamableValue } from 'ai/rsc';
import { useStreamableText } from 'app/lib/hooks/use-streamable-text';
import { memo } from 'react';
import { Markdown } from './markdown';

export const Response = memo(
  ({ content }: { content: string | StreamableValue<string> }) => {
    const text = useStreamableText(content);
    return <Markdown content={text} />;
  },
);

Response.displayName = 'Response';