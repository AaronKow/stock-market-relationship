import { Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import SignalsPage from './pages/SignalsPage';
import GraphPage from './pages/GraphPage';
import WatchlistPage from './pages/WatchlistPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailsPage />} />
        <Route path="/signals" element={<SignalsPage />} />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
      </Routes>
    </AppShell>
  );
}
