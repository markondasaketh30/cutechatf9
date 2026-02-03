'use client';

import {
  EdgeProps,
  getBezierPath,
  Node,
  Handle,
  Position,
} from '@xyflow/react';
import { cn } from 'app/lib/utils';
import React from 'react';

function getHandleCoordsByPosition(
  node: Node,
  handlePosition: Position,
): [number, number] {
  const handle = node.internals.handleBounds?.source?.find(
    h => h.position === handlePosition,
  );

  if (!handle) {
    return [0, 0];
  }

  const offsetX = handle.width / 2;
  const offsetY = handle.height / 2;

  switch (handlePosition) {
    case 'right':
      return [node.position.x + handle.x + offsetX, node.position.y + offsetY];
    case 'left':
      return [node.position.x + handle.x + offsetX, node.position.y + offsetY];
    case 'top':
      return [
        node.position.x + handle.x + offsetX,
        node.position.y + handle.y + offsetY,
      ];
    case 'bottom':
      return [
        node.position.x + handle.x + offsetX,
        node.position.y + handle.y + offsetY,
      ];
  }
}

function getEdgeParams(source: Node, target: Node) {
  const sourceHandlePos = source.data.label.includes('Tool')
    ? Position.Right
    : Position.Bottom;
  const targetHandlePos = Position.Top;
  const sourceHandle = getHandleCoordsByPosition(source, sourceHandlePos);
  const targetHandle = getHandleCoordsByPosition(target, targetHandlePos);
  return {
    sx: sourceHandle[0],
    sy: sourceHandle[1],
    tx: targetHandle[0],
    ty: targetHandle[1],
    sourcePos: sourceHandlePos,
    targetPos: targetHandlePos,
  };
}

export function Temporary(props: EdgeProps) {
  const { source, target, ...rest } = props;
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    source,
    target,
  );
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
  });

  return (
    <path
      {...rest}
      path={edgePath}
      strokeDasharray="5 5"
      d={edgePath}
      className={cn('react-flow__edge-path', 'stroke-muted-foreground')}
    />
  );
}

export function Animated(props: EdgeProps) {
  const { source, target, ...rest } = props;
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    source,
    target,
  );
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
  });
  return (
    <g>
      <path
        {...rest}
        path={edgePath}
        d={edgePath}
        className={cn('react-flow__edge-path', 'stroke-muted-foreground')}
      />
      <circle
        r={3}
        className={cn('fill-muted-foreground', 'animate-edge-flow')}
        style={{
          offsetPath: `path("${edgePath}")`,
        }}
      ></circle>
    </g>
  );
}