import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  reconnectEdge,
  MarkerType,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type NodeTypes,
  type EdgeTypes,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { UpdateContactFieldNode } from './components/UpdateContactFieldNode';
import { FlowEdge } from './components/FlowEdge';
import './App.css';

const nodeTypes: NodeTypes = {
  updateContactField: UpdateContactFieldNode,
};

const edgeTypes: EdgeTypes = {
  default: FlowEdge,
};

const defaultEdgeOptions = {
  type: 'default',
  style: { stroke: '#8c63f4', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#8c63f4', width: 18, height: 18 },
};

function UserPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );


  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, ...defaultEdgeOptions }, eds)),
    []
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) =>
      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds)),
    []
  );

  const handleStartJourney = useCallback(() => {
    const newNode = { id: `node-${Date.now()}`, type: 'updateContactField', position: { x: 200, y: 120 }, data: {} };
    console.log('handleStartJourney → creating node:', newNode);
    setNodes([newNode]);
  }, []);

  const isEmpty = nodes.length === 0;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f8fafc' }} className="relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        reconnectRadius={20}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        minZoom={0.3}
        maxZoom={1.5}
        fitView={!isEmpty}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cfd5df" />
        <Controls />
      </ReactFlow>

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="pointer-events-auto flex flex-col items-center gap-4 select-none">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-brand/30
                            flex items-center justify-center bg-white/80">
              <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand">
                <UserPlusIcon />
              </div>
            </div>

            <div className="text-center">
              <p className="text-[15px] font-semibold text-gray-700">Your journey is empty</p>
              <p className="text-[13px] text-gray-400 mt-0.5">Add your first step to get started</p>
            </div>

            <button
              type="button"
              onClick={handleStartJourney}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-[13px]
                         font-medium rounded-lg hover:bg-brand-dark transition-colors
                         border-none cursor-pointer shadow-sm"
            >
              <span className="text-lg font-light leading-none">+</span>
              Start journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
