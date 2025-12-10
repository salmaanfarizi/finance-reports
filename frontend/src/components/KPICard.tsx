import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  format?: 'currency' | 'number' | 'percent' | 'text';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
};

const iconBgClasses = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  red: 'bg-red-100',
  yellow: 'bg-yellow-100',
  purple: 'bg-purple-100',
};

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'blue',
  format = 'currency',
}: KPICardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-SA', {
          style: 'currency',
          currency: 'SAR',
          minimumFractionDigits: 2,
        }).format(val);
      case 'number':
        return new Intl.NumberFormat('en-SA').format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return String(val);
    }
  };

  return (
    <div className={`card border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}

          {trend && (
            <div className="mt-2 flex items-center space-x-1">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-500" />}
              <span
                className={`text-sm font-medium ${
                  trend === 'up'
                    ? 'text-green-600'
                    : trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
