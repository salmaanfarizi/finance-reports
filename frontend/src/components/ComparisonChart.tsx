import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ComparisonChartProps {
  data: { month: string; [key: string]: string | number }[];
  lines?: { key: string; color: string; name: string }[];
  bars?: { key: string; color: string; name: string }[];
  type?: 'line' | 'bar';
  title: string;
  height?: number;
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
};

export function ComparisonChart({
  data,
  lines = [],
  bars = [],
  type = 'line',
  title,
  height = 300,
}: ComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('en-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(value)
              }
            />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                name={line.name}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('en-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(value)
              }
            />
            <Legend />
            {bars.map((bar) => (
              <Bar key={bar.key} dataKey={bar.key} fill={bar.color} name={bar.name} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
