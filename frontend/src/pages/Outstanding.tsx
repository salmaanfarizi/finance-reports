import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { comparisonService } from '../services/api';
import { OutstandingComparison } from '../types';

const COLORS = [
  '#2563eb', '#dc2626', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#0ea5e9', '#eab308', '#ef4444',
  '#10b981', '#3b82f6', '#f43f5e',
];

export function Outstanding() {
  const [data, setData] = useState<OutstandingComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSalesmen, setSelectedSalesmen] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await comparisonService.getOutstanding();
      if (res && res.salesmen && res.months) {
        setData(res);
        // Select top 5 salesmen by default
        const salesmen = Object.entries(res.salesmen || {})
          .map(([name, values]) => ({ name, total: (values || []).reduce((a, b) => a + b, 0) }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
          .map((s) => s.name);
        setSelectedSalesmen(salesmen);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSalesman = (name: string) => {
    setSelectedSalesmen((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
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

  // Prepare chart data
  const chartData = data.months.map((month, index) => {
    const point: Record<string, string | number> = { month };
    selectedSalesmen.forEach((salesman) => {
      point[salesman] = data.salesmen[salesman]?.[index] || 0;
    });
    point['Total'] = data.totals[index] || 0;
    return point;
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(value);

  // Calculate salesman totals for the table
  const salesmanTotals = Object.entries(data.salesmen || {})
    .filter(([, values]) => Array.isArray(values) && values.length > 0)
    .map(([name, values]) => ({
      name,
      values,
      total: values.reduce((a, b) => a + b, 0),
      average: values.reduce((a, b) => a + b, 0) / values.length,
      latest: values[values.length - 1] || 0,
    }))
    .sort((a, b) => b.latest - a.latest);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Outstanding Comparison</h2>

      {/* Salesman Filter */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Salesmen to Display</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(data.salesmen).map((name, index) => (
            <button
              key={name}
              onClick={() => toggleSalesman(name)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedSalesmen.includes(name)
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedSalesmen.includes(name)
                  ? COLORS[index % COLORS.length]
                  : undefined,
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Outstanding Trend by Salesman</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(value) =>
                value >= 1000000
                  ? `${(value / 1000000).toFixed(1)}M`
                  : value >= 1000
                  ? `${(value / 1000).toFixed(0)}K`
                  : value
              }
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend />
            {selectedSalesmen.map((salesman) => (
              <Line
                key={salesman}
                type="monotone"
                dataKey={salesman}
                stroke={COLORS[Object.keys(data.salesmen).indexOf(salesman) % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Total Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Total Outstanding Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(value) =>
                value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`
              }
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Line
              type="monotone"
              dataKey="Total"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Salesman Summary</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Salesman
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Latest
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Average
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {salesmanTotals.map((row) => (
              <tr key={row.name} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">
                  {formatCurrency(row.latest)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">
                  {formatCurrency(row.average)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">
                  {data.totals[data.totals.length - 1]
                    ? ((row.latest / data.totals[data.totals.length - 1]) * 100).toFixed(1)
                    : 0}
                  %
                </td>
              </tr>
            ))}
            <tr className="bg-yellow-50 font-semibold">
              <td className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {formatCurrency((data.totals || [])[data.totals?.length - 1] || 0)}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {formatCurrency((data.totals || []).length > 0 ? (data.totals || []).reduce((a, b) => a + b, 0) / data.totals.length : 0)}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MoM Changes */}
      {data.mom_changes.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Month-over-Month Changes</h3>
          <div className="flex flex-wrap gap-2">
            {data.months.map((month, index) => (
              <div
                key={month}
                className={`px-4 py-2 rounded-lg text-sm ${
                  data.mom_changes[index]?.includes('▲')
                    ? 'bg-red-100 text-red-700'
                    : data.mom_changes[index]?.includes('▼')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="font-medium">{month}:</span> {data.mom_changes[index] || '-'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
