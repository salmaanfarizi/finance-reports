import os
import re
from typing import List, Dict, Any, Optional, Tuple
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from config import GOOGLE_SHEET_ID, GOOGLE_CREDENTIALS_FILE, GOOGLE_TOKEN_FILE, SCOPES
from models import (
    BankEntry, BankSummary, AdvanceEntry, AdvanceSummary,
    SuspenseEntry, SuspenseSummary, OutstandingEntry, OutstandingSummary,
    SalesmanSummary, ComparisonData, DashboardKPIs, SheetInfo
)


class GoogleSheetsService:
    def __init__(self):
        self.creds = None
        self.service = None
        self.sheet_id = GOOGLE_SHEET_ID
        self._cached_data = {}

    def authenticate(self) -> bool:
        """Authenticate with Google Sheets API."""
        try:
            if os.path.exists(GOOGLE_TOKEN_FILE):
                self.creds = Credentials.from_authorized_user_file(GOOGLE_TOKEN_FILE, SCOPES)

            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                else:
                    if not os.path.exists(GOOGLE_CREDENTIALS_FILE):
                        return False
                    flow = InstalledAppFlow.from_client_secrets_file(GOOGLE_CREDENTIALS_FILE, SCOPES)
                    self.creds = flow.run_local_server(port=8080)

                with open(GOOGLE_TOKEN_FILE, 'w') as token:
                    token.write(self.creds.to_json())

            self.service = build('sheets', 'v4', credentials=self.creds)
            return True
        except Exception as e:
            print(f"Authentication error: {e}")
            return False

    def is_authenticated(self) -> bool:
        """Check if service is authenticated."""
        return self.service is not None

    def get_sheet_names(self) -> List[SheetInfo]:
        """Get all sheet names from the spreadsheet."""
        if not self.service:
            return []

        try:
            spreadsheet = self.service.spreadsheets().get(spreadsheetId=self.sheet_id).execute()
            sheets = []

            for sheet in spreadsheet.get('sheets', []):
                name = sheet['properties']['title']
                sheet_type, month = self._parse_sheet_name(name)
                sheets.append(SheetInfo(name=name, sheet_type=sheet_type, month=month))

            return sheets
        except HttpError as e:
            print(f"Error getting sheet names: {e}")
            return []

    def _parse_sheet_name(self, name: str) -> Tuple[str, Optional[str]]:
        """Parse sheet name to extract type and month."""
        month_pattern = r'([A-Z]{3}-\d{4})$'

        if name == 'Dashboard':
            return 'dashboard', None
        elif name == 'Settings':
            return 'settings', None
        elif '_Comparison' in name:
            return name.replace('_Comparison', '').lower() + '_comparison', None
        elif match := re.search(month_pattern, name):
            month = match.group(1)
            sheet_type = name.replace(f'_{month}', '').lower()
            return sheet_type, month
        return 'other', None

    def _get_sheet_data(self, range_name: str) -> List[List[Any]]:
        """Get data from a specific range."""
        if not self.service:
            return []

        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.sheet_id,
                range=range_name
            ).execute()
            return result.get('values', [])
        except HttpError as e:
            print(f"Error getting sheet data: {e}")
            return []

    def _parse_number(self, value: Any) -> float:
        """Parse a number from various formats."""
        if value is None or value == '':
            return 0.0
        if isinstance(value, (int, float)):
            return float(value)
        try:
            cleaned = str(value).replace(',', '').replace('$', '').replace('SAR', '').strip()
            return float(cleaned) if cleaned else 0.0
        except (ValueError, TypeError):
            return 0.0

    def get_banks_comparison(self) -> ComparisonData:
        """Get banks comparison data."""
        data = self._get_sheet_data('Banks_Comparison!A3:Z20')
        if not data:
            return ComparisonData(months=[], metrics={})

        months = [str(cell) for cell in data[0][1:] if cell] if data else []
        metrics = {}

        metric_names = ['opening_balance', 'total_received', 'bank_charges',
                       'total_payments', 'closing_balance', 'net_cash_flow', 'mom_percent']

        for i, row in enumerate(data[1:8]):
            if i < len(metric_names) and len(row) > 1:
                metrics[metric_names[i]] = [self._parse_number(cell) for cell in row[1:len(months)+1]]

        return ComparisonData(months=months, metrics=metrics)

    def get_advances_comparison(self) -> ComparisonData:
        """Get advances comparison data."""
        data = self._get_sheet_data('Advances_Comparison!A3:Z10')
        if not data:
            return ComparisonData(months=[], metrics={})

        months = [str(cell) for cell in data[0][1:] if cell] if data else []
        metrics = {}

        metric_names = ['opening_balance', 'advances_given', 'advances_settled', 'closing_balance']

        for i, row in enumerate(data[1:5]):
            if i < len(metric_names) and len(row) > 1:
                metrics[metric_names[i]] = [self._parse_number(cell) for cell in row[1:len(months)+1]]

        return ComparisonData(months=months, metrics=metrics)

    def get_suspense_comparison(self) -> ComparisonData:
        """Get suspense comparison data."""
        data = self._get_sheet_data('Suspense_Comparison!A3:Z10')
        if not data:
            return ComparisonData(months=[], metrics={})

        months = [str(cell) for cell in data[0][1:] if cell] if data else []
        metrics = {}

        metric_names = ['opening_balance', 'total_debits', 'total_credits', 'closing_balance']

        for i, row in enumerate(data[1:5]):
            if i < len(metric_names) and len(row) > 1:
                metrics[metric_names[i]] = [self._parse_number(cell) for cell in row[1:len(months)+1]]

        return ComparisonData(months=months, metrics=metrics)

    def get_outstanding_comparison(self) -> Dict[str, Any]:
        """Get outstanding comparison data with salesmen breakdown."""
        data = self._get_sheet_data('Outstanding_Comparison!A3:Z50')
        if not data:
            return {'months': [], 'salesmen': {}, 'totals': [], 'mom_changes': []}

        # First row is headers: Salesman, Trend, Month1, Month2, ...
        months = [str(cell) for cell in data[0][2:] if cell] if data else []

        salesmen = {}
        totals = []
        mom_changes = []

        for row in data[1:]:
            if not row or not row[0]:
                continue

            salesman = str(row[0]).strip()

            if salesman == 'TOTAL':
                totals = [self._parse_number(cell) for cell in row[2:len(months)+2]]
            elif salesman.startswith('MoM'):
                mom_changes = [str(cell) if cell else '' for cell in row[2:len(months)+2]]
            elif salesman and salesman not in ['Salesman', 'Trend']:
                values = [self._parse_number(cell) for cell in row[2:len(months)+2]]
                salesmen[salesman] = values

        return {
            'months': months,
            'salesmen': salesmen,
            'totals': totals,
            'mom_changes': mom_changes
        }

    def get_dashboard_kpis(self) -> DashboardKPIs:
        """Get dashboard KPIs."""
        banks = self.get_banks_comparison()
        outstanding = self.get_outstanding_comparison()
        advances = self.get_advances_comparison()
        suspense = self.get_suspense_comparison()

        months = banks.months
        latest_month = months[-1] if months else "N/A"

        closing_balances = banks.metrics.get('closing_balance', [])
        total_received = banks.metrics.get('total_received', [])
        total_payments = banks.metrics.get('total_payments', [])

        bank_balance = closing_balances[-1] if closing_balances else 0
        total_outstanding = outstanding['totals'][-1] if outstanding['totals'] else 0

        adv_closing = advances.metrics.get('closing_balance', [])
        sus_closing = suspense.metrics.get('closing_balance', [])

        advance_balance = adv_closing[-1] if adv_closing else 0
        suspense_balance = sus_closing[-1] if sus_closing else 0

        ytd_received = sum(total_received)
        ytd_payments = sum(total_payments)

        # Calculate growth rate
        first_outstanding = outstanding['totals'][0] if outstanding['totals'] else 0
        last_outstanding = outstanding['totals'][-1] if outstanding['totals'] else 0
        growth_rate = ((last_outstanding - first_outstanding) / first_outstanding * 100) if first_outstanding else 0

        return DashboardKPIs(
            latest_month=latest_month,
            bank_balance=bank_balance,
            total_outstanding=total_outstanding,
            advance_balance=advance_balance,
            suspense_balance=suspense_balance,
            ytd_received=ytd_received,
            ytd_payments=ytd_payments,
            net_cash_flow=ytd_received - ytd_payments,
            avg_outstanding=sum(outstanding['totals']) / len(outstanding['totals']) if outstanding['totals'] else 0,
            months_tracked=len(months),
            highest_bank_balance=max(closing_balances) if closing_balances else 0,
            lowest_bank_balance=min(closing_balances) if closing_balances else 0,
            avg_monthly_revenue=ytd_received / len(months) if months else 0,
            outstanding_growth_rate=growth_rate,
            cash_position=bank_balance - total_outstanding
        )

    def get_settings(self) -> Dict[str, List[str]]:
        """Get settings lists (banks, salesmen, areas)."""
        data = self._get_sheet_data('Settings!A14:F30')

        banks = []
        salesmen = []
        areas = []

        for row in data:
            if len(row) >= 1 and row[0] and row[0] not in ['BANKS', 'SALESMEN', 'AREAS']:
                banks.append(str(row[0]))
            if len(row) >= 3 and row[2] and row[2] not in ['BANKS', 'SALESMEN', 'AREAS']:
                salesmen.append(str(row[2]))
            if len(row) >= 5 and row[4] and row[4] not in ['BANKS', 'SALESMEN', 'AREAS']:
                areas.append(str(row[4]))

        return {
            'banks': [b for b in banks if b.strip()],
            'salesmen': [s for s in salesmen if s.strip()],
            'areas': [a for a in areas if a.strip()]
        }

    def get_monthly_outstanding(self, month: str) -> OutstandingSummary:
        """Get outstanding data for a specific month."""
        sheet_name = f'Outstanding_{month}'

        # Get salesman summary (rows 4-18 approximately)
        summary_data = self._get_sheet_data(f'{sheet_name}!A4:D20')
        salesman_summaries = []
        total_outstanding = 0
        total_customers = 0

        for row in summary_data:
            if not row or not row[0]:
                continue
            name = str(row[0]).strip()
            if name == 'TOTAL':
                total_outstanding = self._parse_number(row[1]) if len(row) > 1 else 0
                total_customers = int(self._parse_number(row[2])) if len(row) > 2 else 0
            elif name and name not in ['Salesman', 'GRAND TOTAL']:
                salesman_summaries.append(SalesmanSummary(
                    salesman=name,
                    total_outstanding=self._parse_number(row[1]) if len(row) > 1 else 0,
                    customer_count=int(self._parse_number(row[2])) if len(row) > 2 else 0,
                    average=self._parse_number(row[3]) if len(row) > 3 else 0
                ))

        # Get detailed entries (rows 19+)
        entries_data = self._get_sheet_data(f'{sheet_name}!A19:H502')
        entries = []

        for row in entries_data[1:]:  # Skip header
            if not row or not row[0]:
                continue
            if str(row[0]).strip() == 'GRAND TOTAL':
                break
            entries.append(OutstandingEntry(
                customer_code=str(row[0]) if len(row) > 0 else '',
                customer_name=str(row[1]) if len(row) > 1 else '',
                area=str(row[2]) if len(row) > 2 else '',
                salesman=str(row[3]) if len(row) > 3 else '',
                invoice_amount=self._parse_number(row[4]) if len(row) > 4 else 0,
                paid_amount=self._parse_number(row[5]) if len(row) > 5 else 0,
                balance=self._parse_number(row[6]) if len(row) > 6 else 0,
                days=int(self._parse_number(row[7])) if len(row) > 7 else 0
            ))

        return OutstandingSummary(
            month=month,
            salesman_summary=salesman_summaries,
            total_outstanding=total_outstanding,
            total_customers=total_customers,
            entries=entries
        )

    def sync_all_data(self) -> Dict[str, Any]:
        """Sync all data from Google Sheets."""
        if not self.is_authenticated():
            if not self.authenticate():
                return {'success': False, 'error': 'Authentication failed'}

        try:
            sheets = self.get_sheet_names()
            dashboard = self.get_dashboard_kpis()
            banks = self.get_banks_comparison()
            advances = self.get_advances_comparison()
            suspense = self.get_suspense_comparison()
            outstanding = self.get_outstanding_comparison()
            settings = self.get_settings()

            self._cached_data = {
                'sheets': sheets,
                'dashboard': dashboard,
                'banks_comparison': banks,
                'advances_comparison': advances,
                'suspense_comparison': suspense,
                'outstanding_comparison': outstanding,
                'settings': settings
            }

            return {
                'success': True,
                'sheets_loaded': len(sheets),
                'data': self._cached_data
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}


# Singleton instance
sheets_service = GoogleSheetsService()
