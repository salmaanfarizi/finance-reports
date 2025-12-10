import { useEffect, useState } from 'react';
import { ComparisonChart } from '../components/ComparisonChart';
import { comparisonService } from '../services/api';
import { ComparisonData } from '../types';

export function Banks() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await comparisonService.getBanks();
      setData(res);
    } catch (err) {
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

  if (!data || !data.months || data.months.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No data available. Please sync data first.</p>
      </div>
    );
  }

  const chartData = data.months.map((month, index) => ({
    month,
    opening_balance: data.metrics.opening_balance?.[index] || 0,
    total_received: data.metrics.total_received?.[index] || 0,
    bank_charges: data.metrics.bank_charges?.[index] || 0,
    total_payments: data.metrics.total_payments?.[index] || 0,
    closing_balance: data.metrics.closing_balance?.[index] || 0,
    net_cash_flow: data.metrics.net_cash_flow?.[index] || 0,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(value);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Banks Comparison</h2>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComparisonChart
          title="Closing Balance Trend"
          data={chartData}
          type="line"
          lines={[{ key: 'closing_balance', color: '#2563eb', name: 'Closing Balance' }]}
        />
        <ComparisonChart
          title="Cash Flow (Received vs Payments)"
          data={chartData}
          type="bar"
          bars={[
            { key: 'total_received', color: '#22c55e', name: 'Received' },
            { key: 'total_payments', color: '#ef4444', name: 'Payments' },
          ]}
        />
      </div>

      {/* Data Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Monthly Data</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Metric
              </th>
              {data.months.map((month) => (
                <th
                  key={month}
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Object.entries(data.metrics || {}).map(([metric, values]) => (
              <tr key={metric} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                  {metric.replace(/_/g, ' ')}
                </td>
                {(values || []).map((value, index) => (
                  <td
                    key={index}
                    className={`px-4 py-3 text-sm text-right ${
                      metric === 'closing_balance' ? 'font-semibold text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {metric === 'mom_percent'
                      ? `${(value * 100).toFixed(1)}%`
                      : formatCurrency(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
