'use client';

import React from 'react';

import ReactFlow, { Background, Controls } from '@xyflow/react';

export function Canvas({
  children,
  ...props
}: React.ComponentProps<typeof ReactFlow>) {
  return (
    <ReactFlow {...props}>
      <Background />
      <Controls />
      {children}
    </ReactFlow>
  );
}