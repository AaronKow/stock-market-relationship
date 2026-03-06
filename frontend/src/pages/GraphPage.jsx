import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import RelationshipGraph from '../components/graph/RelationshipGraph';
import Card from '../components/ui/Card';
import FilterControls from '../components/ui/FilterControls';
import StatCard from '../components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';

export default function GraphPage() {
  const [relationships, setRelationships] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([apiFetch('/relationships'), apiFetch('/companies')])
      .then(([relationshipPayload, companyPayload]) => {
        if (!active) {
          return;
        }
        setRelationships(Array.isArray(relationshipPayload) ? relationshipPayload : []);
        setCompanies(Array.isArray(companyPayload) ? companyPayload : []);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (selectedCompany === 'ALL') {
      return relationships;
    }
    return relationships.filter(
      (relationship) =>
        relationship.sourceCompanyId === selectedCompany || relationship.targetCompanyId === selectedCompany,
    );
  }, [relationships, selectedCompany]);

  const uniqueNodes = useMemo(() => {
    const ids = new Set();
    filtered.forEach((relationship) => {
      ids.add(relationship.sourceCompanyId);
      ids.add(relationship.targetCompanyId);
    });
    return ids.size;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Relationships" value={filtered.length} helper="Edges in current graph" accent="blue" />
        <StatCard label="Companies" value={uniqueNodes} helper="Nodes represented" accent="emerald" />
        <StatCard label="Filter" value={selectedCompany === 'ALL' ? 'Global' : 'Focused'} helper="Graph scope" accent="amber" />
      </div>

      <Card title="Relationship Graph" subtitle="Explore directional relationships between companies.">
        <FilterControls showSearch={false}>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={selectedCompany}
            onChange={(event) => setSelectedCompany(event.target.value)}
          >
            <option value="ALL">All companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.ticker} - {company.name}
              </option>
            ))}
          </select>
        </FilterControls>

        {loading && <LoadingState message="Loading relationship graph..." />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && filtered.length === 0 && <EmptyState message="No relationships found for selected company." />}
        {!loading && !error && filtered.length > 0 && <RelationshipGraph relationships={filtered} />}
      </Card>
    </div>
  );
}
