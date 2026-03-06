import Card from '../components/ui/Card';
import { EmptyState } from '../components/ui/States';

export default function WatchlistPage() {
  return (
    <Card title="Watchlist" subtitle="Track priority symbols and relationship alerts.">
      <EmptyState message="Your watchlist is empty. Add tickers from the Companies page." />
    </Card>
  );
}
