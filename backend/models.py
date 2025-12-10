from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class BankEntry(BaseModel):
    bank_name: str
    opening_balance: float = 0
    total_received: float = 0
    bank_charges: float = 0
    total_payments: float = 0
    closing_balance: float = 0
    notes: str = ""


class BankSummary(BaseModel):
    month: str
    banks: List[BankEntry]
    sub_total_sar: BankEntry
    usd_accounts: List[BankEntry]
    sub_total_usd: BankEntry
    grand_total: BankEntry


class AdvanceEntry(BaseModel):
    date: str = ""
    voucher_no: str = ""
    description: str = ""
    person_party: str = ""
    advance_given: float = 0
    amount_settled: float = 0
    running_balance: float = 0


class AdvanceSummary(BaseModel):
    month: str
    opening_balance: float
    closing_balance: float
    transactions: List[AdvanceEntry]
    total_given: float
    total_settled: float


class SuspenseEntry(BaseModel):
    date: str = ""
    journal_no: str = ""
    description: str = ""
    reference: str = ""
    debit: float = 0
    credit: float = 0
    running_balance: float = 0


class SuspenseSummary(BaseModel):
    month: str
    opening_balance: float
    closing_balance: float
    transactions: List[SuspenseEntry]
    total_debit: float
    total_credit: float


class OutstandingEntry(BaseModel):
    customer_code: str = ""
    customer_name: str = ""
    area: str = ""
    salesman: str = ""
    invoice_amount: float = 0
    paid_amount: float = 0
    balance: float = 0
    days: int = 0


class SalesmanSummary(BaseModel):
    salesman: str
    total_outstanding: float
    customer_count: int
    average: float


class OutstandingSummary(BaseModel):
    month: str
    salesman_summary: List[SalesmanSummary]
    total_outstanding: float
    total_customers: int
    entries: List[OutstandingEntry]


class ComparisonData(BaseModel):
    months: List[str]
    metrics: Dict[str, List[float]]


class DashboardKPIs(BaseModel):
    latest_month: str
    bank_balance: float
    total_outstanding: float
    advance_balance: float
    suspense_balance: float
    ytd_received: float
    ytd_payments: float
    net_cash_flow: float
    avg_outstanding: float
    months_tracked: int
    highest_bank_balance: float
    lowest_bank_balance: float
    avg_monthly_revenue: float
    outstanding_growth_rate: float
    cash_position: float


class SyncStatus(BaseModel):
    success: bool
    message: str
    last_sync: Optional[datetime] = None
    sheets_loaded: int = 0


class SheetInfo(BaseModel):
    name: str
    sheet_type: str
    month: Optional[str] = None
