import NextImage, { ImageProps } from 'next/image';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from 'app/components/ui/context-menu';

export function Image({ alt, ...props }: ImageProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <NextImage alt={alt} {...props} />
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Save</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}