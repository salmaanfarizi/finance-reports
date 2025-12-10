import { useEffect, useState } from 'react';
import { ComparisonChart } from '../components/ComparisonChart';
import { comparisonService } from '../services/api';
import { ComparisonData } from '../types';

export function Advances() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await comparisonService.getAdvances();
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

  if (!data || data.months.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No data available. Please sync data first.</p>
      </div>
    );
  }

  const chartData = data.months.map((month, index) => ({
    month,
    opening_balance: data.metrics.opening_balance?.[index] || 0,
    advances_given: data.metrics.advances_given?.[index] || 0,
    advances_settled: data.metrics.advances_settled?.[index] || 0,
    closing_balance: data.metrics.closing_balance?.[index] || 0,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(value);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Advances Comparison</h2>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComparisonChart
          title="Closing Balance Trend"
          data={chartData}
          type="line"
          lines={[{ key: 'closing_balance', color: '#22c55e', name: 'Closing Balance' }]}
        />
        <ComparisonChart
          title="Advances Given vs Settled"
          data={chartData}
          type="bar"
          bars={[
            { key: 'advances_given', color: '#f59e0b', name: 'Given' },
            { key: 'advances_settled', color: '#10b981', name: 'Settled' },
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
            {Object.entries(data.metrics).map(([metric, values]) => (
              <tr key={metric} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                  {metric.replace(/_/g, ' ')}
                </td>
                {values.map((value, index) => (
                  <td
                    key={index}
                    className={`px-4 py-3 text-sm text-right ${
                      metric === 'closing_balance' ? 'font-semibold text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {formatCurrency(value)}
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
