'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { SchemaNode } from './SchemaNode';
import { Network, RefreshCw, LayoutDashboard } from 'lucide-react';
import { ApiClient } from '@/lib/api';

const nodeTypes = {
  tableNode: SchemaNode,
};

interface SchemaVisualizerProps {
    projectId: string;
    branchId: string;
    dbName: string;
}

const nodeWidth = 260;
const nodeHeight = 300; // estimated average

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, align: 'DL', nodesep: 60, ranksep: 180 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'left' as any,
      sourcePosition: 'right' as any,
      // We shift the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export function SchemaVisualizer({ projectId, branchId, dbName }: SchemaVisualizerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
        const edgeParams: any = { 
            ...params, 
            type: 'smoothstep', 
            animated: true,
            style: { stroke: '#60a5fa', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#60a5fa' }
        };
        setEdges((eds) => addEdge(edgeParams, eds));
    },
    [setEdges],
  );

  const fetchSchemaRelations = async () => {
      setLoading(true);
      try {
          const res = await ApiClient.get(`/projects/${projectId}/branches/${branchId}/databases/${dbName}/schema-relations`);
          
          if (!res || !res.tables) return;

          const initialNodes: Node[] = res.tables.map((table: any) => ({
              id: table.name,
              type: 'tableNode',
              position: { x: 0, y: 0 }, // Assigned by auto-layout later
              data: {
                  label: table.name,
                  columns: table.columns.map((c: any) => ({
                      ...c,
                      // Flag if is foreign key manually by checking if it exists in relations
                      isForeignKey: res.relations.some((rel: any) => rel.sourceTable === table.name && rel.sourceColumn === c.name)
                  }))
              }
          }));

          const initialEdges: Edge[] = res.relations.map((rel: any) => ({
              id: `e-${rel.sourceTable}-${rel.sourceColumn}-${rel.targetTable}-${rel.targetColumn}`,
              source: rel.sourceTable,
              target: rel.targetTable,
              sourceHandle: `${rel.sourceColumn}-source`,
              targetHandle: `${rel.targetColumn}-target`,
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#52525b', strokeWidth: 1.5, opacity: 0.8 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b' }
          }));

          // Apply Dagre layout on first render
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges, 'LR');
          
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);

      } catch (err) {
          console.error("Failed to load schema ERD:", err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchSchemaRelations();
  }, [projectId, branchId, dbName]);

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'LR');
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  if (loading) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-zinc-500">
              <RefreshCw className="animate-spin text-zinc-700 w-8 h-8" />
          </div>
      );
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        className="bg-[#0a0a0a]"
      >
        <Panel position="top-right" className="flex items-center gap-2 m-4">
            <button 
                onClick={onLayout}
                className="flex items-center justify-center gap-2 bg-[#111] border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-lg"
            >
                <Network size={14} className="text-blue-400" />
                Auto Layout
            </button>
            <button 
                onClick={fetchSchemaRelations}
                className="flex items-center justify-center p-1.5 bg-[#111] border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors shadow-lg"
            >
                <RefreshCw size={14} />
            </button>
        </Panel>

        <Controls className="bg-[#111] border border-zinc-800 fill-white !text-white overflow-hidden rounded-md shadow-lg" />
        <MiniMap 
            nodeColor={(n) => '#27272a'} // zinc-800
            maskColor="rgba(10, 10, 10, 0.7)"
            className="bg-[#0c0d0d] border border-zinc-800 rounded-lg overflow-hidden shadow-2xl !bottom-6 !right-6"
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#27272a" />
      </ReactFlow>
    </div>
  );
}
