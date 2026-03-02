import { useReactFlow, BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FlowEdge({
  id,
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  selected,
  markerEnd,
}: EdgeProps) {
  const { deleteElements } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? '#7c4dff' : '#8c63f4',
          strokeWidth: selected ? 2.5 : 2,
        }}
      />

      {/* Delete button — only visible when the edge is selected */}
      <EdgeLabelRenderer>
        {selected && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button
              type="button"
              onClick={() => deleteElements({ edges: [{ id }] })}
              title="Delete connection"
              aria-label="Delete connection"
              className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center
                         justify-center border-2 border-white shadow-md cursor-pointer
                         hover:bg-red-600 transition-colors border-solid"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
