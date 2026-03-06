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
      source: relationship.sourceCompanyId,
      target: relationship.targetCompanyId,
      value: relationship.strength || 0.4,
      label: relationship.relationshipType,
    };
  });

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

export default function RelationshipGraph({ relationships }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(900);

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

  return (
    <div ref={wrapRef} className="h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
      <ForceGraph2D
        width={width}
        height={560}
        graphData={data}
        nodeLabel={(node) => `${node.ticker}: ${node.name}`}
        nodeAutoColorBy="sector"
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.0028}
        linkColor={() => 'rgba(148, 163, 184, 0.45)'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.ticker;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(label, node.x + 8, node.y + 4);
        }}
      />
    </div>
  );
}
