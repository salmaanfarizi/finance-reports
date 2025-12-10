export interface DashboardKPIs {
  latest_month: string;
  bank_balance: number;
  total_outstanding: number;
  advance_balance: number;
  suspense_balance: number;
  ytd_received: number;
  ytd_payments: number;
  net_cash_flow: number;
  avg_outstanding: number;
  months_tracked: number;
  highest_bank_balance: number;
  lowest_bank_balance: number;
  avg_monthly_revenue: number;
  outstanding_growth_rate: number;
  cash_position: number;
}

export interface ComparisonData {
  months: string[];
  metrics: Record<string, number[]>;
}

export interface OutstandingComparison {
  months: string[];
  salesmen: Record<string, number[]>;
  totals: number[];
  mom_changes: string[];
}

export interface SalesmanSummary {
  salesman: string;
  total_outstanding: number;
  customer_count: number;
  average: number;
}

export interface OutstandingEntry {
  customer_code: string;
  customer_name: string;
  area: string;
  salesman: string;
  invoice_amount: number;
  paid_amount: number;
  balance: number;
  days: number;
}

export interface MonthlyOutstanding {
  month: string;
  salesman_summary: SalesmanSummary[];
  total_outstanding: number;
  total_customers: number;
  entries: OutstandingEntry[];
}

export interface AuthStatus {
  authenticated: boolean;
  has_credentials: boolean;
  has_token: boolean;
  message: string;
}

export interface SyncStatus {
  success: boolean;
  message: string;
  last_sync: string | null;
  sheets_loaded: number;
}

export interface Settings {
  banks: string[];
  salesmen: string[];
  areas: string[];
}
