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
  const [relationshipType, setRelationshipType] = useState('ALL');
  const [minimumStrength, setMinimumStrength] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGraphData = async () => {
    setLoading(true);
    setError('');
    try {
      const [relationshipPayload, companyPayload] = await Promise.all([apiFetch('/relationships'), apiFetch('/companies')]);
      setRelationships(Array.isArray(relationshipPayload) ? relationshipPayload : []);
      setCompanies(Array.isArray(companyPayload) ? companyPayload : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraphData();
  }, []);

  const relationshipTypes = useMemo(
    () => ['ALL', ...Array.from(new Set(relationships.map((relationship) => relationship.relationshipType).filter(Boolean))).sort()],
    [relationships],
  );

  const filtered = useMemo(() => {
    return relationships.filter((relationship) => {
      const byCompany =
        selectedCompany === 'ALL' ||
        relationship.sourceCompanyId === selectedCompany ||
        relationship.targetCompanyId === selectedCompany;
      const byType = relationshipType === 'ALL' || relationship.relationshipType === relationshipType;
      const byStrength = minimumStrength === 'ALL' || (Number(relationship.strength) || 0) >= Number(minimumStrength);
      return byCompany && byType && byStrength;
    });
  }, [relationships, selectedCompany, relationshipType, minimumStrength]);

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
        <FilterControls
          showSearch={false}
          rightContent={
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => {
                setSelectedCompany('ALL');
                setRelationshipType('ALL');
                setMinimumStrength('ALL');
              }}
            >
              Reset filters
            </button>
          }
        >
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
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={relationshipType}
            onChange={(event) => setRelationshipType(event.target.value)}
          >
            {relationshipTypes.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? 'All relationship types' : value}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={minimumStrength}
            onChange={(event) => setMinimumStrength(event.target.value)}
          >
            <option value="ALL">Any strength</option>
            <option value="0.8">Strong only (0.8+)</option>
            <option value="0.6">Medium+ (0.6+)</option>
            <option value="0.4">Weak+ (0.4+)</option>
          </select>
        </FilterControls>

        {loading && <LoadingState message="Loading relationship graph..." details="Building graph nodes and directional edges from relationship records." />}
        {!loading && error && <ErrorState message={error} onAction={loadGraphData} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            message="No relationships found for selected filters."
            details="Try a different company, relationship type, or lower strength filter."
            actionLabel="Reset filters"
            onAction={() => {
              setSelectedCompany('ALL');
              setRelationshipType('ALL');
              setMinimumStrength('ALL');
            }}
          />
        )}
        {!loading && !error && filtered.length > 0 && <RelationshipGraph relationships={filtered} />}
      </Card>
    </div>
  );
}
