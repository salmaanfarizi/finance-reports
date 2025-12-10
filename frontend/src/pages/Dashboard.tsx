import { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Wallet,
  HelpCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { ComparisonChart } from '../components/ComparisonChart';
import { dashboardService, comparisonService } from '../services/api';
import { DashboardKPIs, ComparisonData, OutstandingComparison } from '../types';

export function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [banksData, setBanksData] = useState<ComparisonData | null>(null);
  const [outstandingData, setOutstandingData] = useState<OutstandingComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpisRes, banksRes, outstandingRes] = await Promise.all([
        dashboardService.getKPIs(),
        comparisonService.getBanks(),
        comparisonService.getOutstanding(),
      ]);
      setKpis(kpisRes);
      setBanksData(banksRes);
      setOutstandingData(outstandingRes);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Please sync first.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">{error || 'No data available. Please sync data first.'}</p>
      </div>
    );
  }

  // Prepare chart data for banks
  const banksChartData =
    banksData?.months.map((month, index) => ({
      month,
      closing_balance: banksData.metrics.closing_balance?.[index] || 0,
      total_received: banksData.metrics.total_received?.[index] || 0,
      total_payments: banksData.metrics.total_payments?.[index] || 0,
    })) || [];

  // Prepare chart data for outstanding totals
  const outstandingChartData =
    outstandingData?.months.map((month, index) => ({
      month,
      total: outstandingData.totals[index] || 0,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Latest: {kpis.latest_month}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Bank Balance"
          value={kpis.bank_balance}
          color="blue"
          icon={<Building2 className="w-6 h-6 text-blue-600" />}
          trend={kpis.net_cash_flow > 0 ? 'up' : 'down'}
          trendValue={`${kpis.net_cash_flow > 0 ? '+' : ''}${(kpis.net_cash_flow / 1000).toFixed(0)}K YTD`}
        />
        <KPICard
          title="Total Outstanding"
          value={kpis.total_outstanding}
          color="red"
          icon={<Users className="w-6 h-6 text-red-600" />}
          trend={kpis.outstanding_growth_rate > 0 ? 'up' : 'down'}
          trendValue={`${kpis.outstanding_growth_rate > 0 ? '+' : ''}${kpis.outstanding_growth_rate.toFixed(1)}%`}
        />
        <KPICard
          title="Advance Balance"
          value={kpis.advance_balance}
          color="green"
          icon={<Wallet className="w-6 h-6 text-green-600" />}
        />
        <KPICard
          title="Suspense Balance"
          value={kpis.suspense_balance}
          color="yellow"
          icon={<HelpCircle className="w-6 h-6 text-yellow-600" />}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="YTD Received"
          value={kpis.ytd_received}
          color="green"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <KPICard
          title="YTD Payments"
          value={kpis.ytd_payments}
          color="purple"
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
        />
        <KPICard
          title="Cash Position"
          value={kpis.cash_position}
          subtitle="Bank - Outstanding"
          color={kpis.cash_position > 0 ? 'green' : 'red'}
          icon={<Activity className="w-6 h-6" />}
        />
        <KPICard
          title="Months Tracked"
          value={kpis.months_tracked}
          format="number"
          color="blue"
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComparisonChart
          title="Bank Balance Trend"
          data={banksChartData}
          type="line"
          lines={[
            { key: 'closing_balance', color: '#2563eb', name: 'Closing Balance' },
          ]}
        />
        <ComparisonChart
          title="Outstanding Trend"
          data={outstandingChartData}
          type="line"
          lines={[{ key: 'total', color: '#dc2626', name: 'Total Outstanding' }]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ComparisonChart
          title="Monthly Cash Flow"
          data={banksChartData}
          type="bar"
          bars={[
            { key: 'total_received', color: '#22c55e', name: 'Received' },
            { key: 'total_payments', color: '#ef4444', name: 'Payments' },
          ]}
        />
      </div>
    </div>
  );
}
