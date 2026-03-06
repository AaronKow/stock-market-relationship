import { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import Card from '../components/ui/Card';

const graphData = {
  nodes: [
    { id: 'AAPL', group: 'tech' },
    { id: 'MSFT', group: 'tech' },
    { id: 'NVDA', group: 'semis' },
    { id: 'SPY', group: 'index' },
    { id: 'TSM', group: 'semis' },
  ],
  links: [
    { source: 'AAPL', target: 'MSFT', value: 2 },
    { source: 'AAPL', target: 'NVDA', value: 1 },
    { source: 'NVDA', target: 'TSM', value: 3 },
    { source: 'SPY', target: 'AAPL', value: 1 },
    { source: 'SPY', target: 'MSFT', value: 1 },
  ],
};

export default function GraphPage() {
  const data = useMemo(() => graphData, []);

  return (
    <Card title="Relationship Graph" subtitle="Explore company influence and dependency networks.">
      <div className="h-[560px] overflow-hidden rounded-lg border border-slate-200 bg-white">
        <ForceGraph2D
          graphData={data}
          nodeLabel="id"
          nodeAutoColorBy="group"
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={() => 0.004}
          width={1000}
          height={560}
        />
      </div>
    </Card>
  );
}
