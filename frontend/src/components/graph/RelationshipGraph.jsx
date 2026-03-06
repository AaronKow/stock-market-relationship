import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

function graphFromRelationships(relationships) {
  const nodeMap = new Map();
  const links = relationships.map((relationship) => {
    const source = relationship.sourceCompany;
    const target = relationship.targetCompany;

    if (source && !nodeMap.has(source.id)) {
      nodeMap.set(source.id, {
        id: source.id,
        ticker: source.ticker,
        name: source.name,
        sector: source.sector,
      });
    }

    if (target && !nodeMap.has(target.id)) {
      nodeMap.set(target.id, {
        id: target.id,
        ticker: target.ticker,
        name: target.name,
        sector: target.sector,
      });
    }

    return {
      id: relationship.id,
      source: relationship.sourceCompanyId,
      target: relationship.targetCompanyId,
      value: relationship.strength || 0.4,
      label: relationship.relationshipType,
      confidence: relationship.confidence,
    };
  });

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

function colorFromText(value) {
  const input = String(value || 'default');
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 65% 56%)`;
}

export default function RelationshipGraph({ relationships }) {
  const wrapRef = useRef(null);
  const graphRef = useRef(null);
  const [width, setWidth] = useState(900);
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    if (!wrapRef.current) {
      return undefined;
    }

    if (typeof ResizeObserver === 'undefined') {
      setWidth(wrapRef.current.clientWidth || 900);
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect?.width) {
        setWidth(Math.floor(entry.contentRect.width));
      }
    });

    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => graphFromRelationships(relationships), [relationships]);
  const nodeById = useMemo(() => new Map(data.nodes.map((node) => [node.id, node])), [data.nodes]);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) {
      return new Set();
    }

    const ids = new Set([selectedNodeId]);
    data.links.forEach((link) => {
      if (link.source.id === selectedNodeId || link.source === selectedNodeId) {
        ids.add(link.target.id || link.target);
      }
      if (link.target.id === selectedNodeId || link.target === selectedNodeId) {
        ids.add(link.source.id || link.source);
      }
    });
    return ids;
  }, [data.links, selectedNodeId]);

  const selectedNode = selectedNodeId ? nodeById.get(selectedNodeId) : null;

  return (
    <div className="space-y-3">
      <div ref={wrapRef} className="relative h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <button
            type="button"
            className="rounded-md bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-100"
            onClick={() => graphRef.current?.zoomToFit(450, 40)}
          >
            Fit view
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-100"
            onClick={() => {
              setSelectedNodeId('');
              setHoveredNode(null);
              setHoveredLink(null);
            }}
          >
            Clear focus
          </button>
        </div>

        <ForceGraph2D
          ref={graphRef}
          width={width}
          height={560}
          graphData={data}
          nodeRelSize={5}
          nodeLabel={(node) => `${node.ticker}: ${node.name}`}
          linkDirectionalParticles={(link) => {
            if (!selectedNodeId) {
              return 1;
            }

            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            return sourceId === selectedNodeId || targetId === selectedNodeId ? 2 : 0;
          }}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.0028}
          linkWidth={(link) => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            const focused = !selectedNodeId || sourceId === selectedNodeId || targetId === selectedNodeId;
            return focused ? 1 + Number(link.value || 0.5) * 2 : 0.5;
          }}
          linkColor={(link) => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            if (!selectedNodeId) {
              return 'rgba(148, 163, 184, 0.55)';
            }
            if (sourceId === selectedNodeId || targetId === selectedNodeId) {
              return 'rgba(56, 189, 248, 0.9)';
            }
            return 'rgba(71, 85, 105, 0.2)';
          }}
          onNodeHover={(node) => setHoveredNode(node || null)}
          onLinkHover={(link) => setHoveredLink(link || null)}
          onNodeClick={(node) => {
            setSelectedNodeId((prev) => (prev === node.id ? '' : node.id));
            graphRef.current?.centerAt(node.x || 0, node.y || 0, 500);
            graphRef.current?.zoom(2, 500);
          }}
          onBackgroundClick={() => setSelectedNodeId('')}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.ticker;
            const fontSize = 12 / globalScale;
            const focused = !selectedNodeId || connectedNodeIds.has(node.id);
            const isSelected = selectedNodeId === node.id;

            ctx.beginPath();
            ctx.arc(node.x, node.y, isSelected ? 8 : 6, 0, 2 * Math.PI, false);
            ctx.fillStyle = focused ? colorFromText(node.sector || node.ticker) : '#475569';
            ctx.fill();

            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = focused ? '#f8fafc' : '#64748b';
            ctx.fillText(label, node.x + 8, node.y + 4);
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">How to interact</p>
          <p className="mt-1">Drag to pan, scroll to zoom, click a node to focus direct relationships, click canvas to clear focus.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          {!selectedNode && !hoveredLink && !hoveredNode && <p>Hover a node or edge to inspect details.</p>}
          {selectedNode && (
            <p>
              <span className="font-semibold text-slate-700">{selectedNode.ticker}</span>
              {` (${selectedNode.name}) focused with ${Math.max(connectedNodeIds.size - 1, 0)} linked companies.`}
            </p>
          )}
          {!selectedNode && hoveredNode && (
            <p>
              Node: <span className="font-semibold text-slate-700">{hoveredNode.ticker}</span>
              {` - ${hoveredNode.name}`}
            </p>
          )}
          {hoveredLink && (
            <p className="mt-1">
              Edge: <span className="font-semibold text-slate-700">{hoveredLink.label || 'RELATIONSHIP'}</span>
              {` | strength ${(Number(hoveredLink.value) || 0).toFixed(2)} | confidence ${Math.round((Number(hoveredLink.confidence) || 0) * 100)}%`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
