from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime
import os

from config import FRONTEND_URL, API_HOST, API_PORT
from google_sheets import sheets_service
from models import (
    ComparisonData, DashboardKPIs, SyncStatus,
    OutstandingSummary, SheetInfo
)

app = FastAPI(
    title="Finance Reports API",
    description="API for Monthly Accounting Report System",
    version="1.0.0"
)


@app.on_event("startup")
async def startup_event():
    """Authenticate with Google Sheets on startup."""
    print("Starting up - attempting Google Sheets authentication...")
    success = sheets_service.authenticate()
    if success:
        print("Successfully authenticated with Google Sheets!")
    else:
        print("Warning: Could not authenticate with Google Sheets. Check credentials.")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store last sync time
last_sync_time: Optional[datetime] = None


@app.get("/")
async def root():
    """API health check."""
    return {
        "status": "ok",
        "service": "Finance Reports API",
        "version": "1.0.0"
    }


@app.get("/api/auth/status")
async def auth_status():
    """Check authentication status."""
    is_auth = sheets_service.is_authenticated()
    has_credentials = os.path.exists("credentials.json") or os.getenv("GOOGLE_CREDENTIALS_JSON")
    has_token = os.path.exists("token.json") or os.getenv("GOOGLE_TOKEN_JSON")

    return {
        "authenticated": is_auth,
        "has_credentials": has_credentials,
        "has_token": has_token,
        "message": "Ready" if is_auth else "Authentication required"
    }


@app.post("/api/auth/connect")
async def connect_sheets():
    """Initiate Google Sheets authentication."""
    try:
        success = sheets_service.authenticate()
        if success:
            return {"success": True, "message": "Connected to Google Sheets"}
        else:
            return {"success": False, "message": "Authentication failed. Check credentials.json"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/sync")
async def sync_data():
    """Sync all data from Google Sheets."""
    global last_sync_time

    try:
        result = sheets_service.sync_all_data()

        if result['success']:
            last_sync_time = datetime.now()
            return SyncStatus(
                success=True,
                message="Data synchronized successfully",
                last_sync=last_sync_time,
                sheets_loaded=result['sheets_loaded']
            )
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Sync failed'))
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Sync error: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sync/status")
async def sync_status():
    """Get last sync status."""
    return {
        "last_sync": last_sync_time.isoformat() if last_sync_time else None,
        "authenticated": sheets_service.is_authenticated()
    }


@app.get("/api/sheets")
async def get_sheets():
    """Get list of all sheets."""
    if not sheets_service.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")

    sheets = sheets_service.get_sheet_names()
    return {"sheets": [s.dict() for s in sheets]}


@app.get("/api/dashboard")
async def get_dashboard():
    """Get dashboard KPIs."""
    if not sheets_service.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        kpis = sheets_service.get_dashboard_kpis()
        return kpis.dict()
    except Exception as e:
        import traceback
        print(f"Dashboard error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/comparison/banks")
async def get_banks_comparison():
    """Get banks comparison data."""
    if not sheets_service.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        data = sheets_service.get_banks_comparison()
        return data.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/comparison/advances")
async def get_advances_comparison():
    """Get advances comparison data."""
    if not sheets_service.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        data = sheets_service.get_advances_comparison()
        return data.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/comparison/suspense")
async def get_suspense_comparison():
    """Get suspense comparison data."""
    if not sheets_service.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        data = sheets_service.get_suspense_comparison()
        return data.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/comparison/outstanding")
async def get_outstanding_comparison():
    """Get outstanding comparison data with salesmen breakdown."""
    if not sheets_service.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        data = sheets_service.get_outstanding_comparison()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/outstanding/{month}")
async def get_monthly_outstanding(month: str):
    """Get outstanding data for a specific month."""
    if not sheets_service.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        data = sheets_service.get_monthly_outstanding(month)
        return data.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/settings")
async def get_settings():
    """Get settings (banks, salesmen, areas lists)."""
    if not sheets_service.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        settings = sheets_service.get_settings()
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/reports/salesman/{salesman}")
async def get_salesman_report(salesman: str):
    """Get outstanding report for a specific salesman."""
    if not sheets_service.is_authenticated():
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        outstanding = sheets_service.get_outstanding_comparison()
        salesman_data = outstanding['salesmen'].get(salesman, [])

        return {
            "salesman": salesman,
            "months": outstanding['months'],
            "values": salesman_data,
            "total": sum(salesman_data) if salesman_data else 0,
            "average": sum(salesman_data) / len(salesman_data) if salesman_data else 0,
            "trend": "up" if len(salesman_data) > 1 and salesman_data[-1] > salesman_data[0] else "down"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)
