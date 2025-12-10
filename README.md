# Finance Reports - Monthly Accounting System

A web-based dashboard application for viewing and analyzing monthly financial reports from Google Sheets.

## Features

- **Dashboard**: KPIs and summary metrics (Bank Balance, Outstanding, Advances, Suspense)
- **Banks Comparison**: Monthly bank balance trends and cash flow analysis
- **Advances Comparison**: Staff advance tracking across months
- **Suspense Comparison**: Unidentified transaction monitoring
- **Outstanding Comparison**: Customer receivables by salesman with trends
- **Real-time Sync**: Connect to Google Sheets and sync data with one click

## Architecture

```
finance-reports/
├── backend/           # FastAPI Python backend
│   ├── main.py        # API endpoints
│   ├── google_sheets.py  # Google Sheets integration
│   ├── models.py      # Pydantic data models
│   ├── config.py      # Configuration
│   └── requirements.txt
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Google Cloud Setup (Required)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Sheets API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Desktop app" as application type
   - Download the JSON file
5. Rename the downloaded file to `credentials.json`
6. Place it in the `backend/` folder

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional - defaults are provided)
cp .env.example .env

# Run the backend
python main.py
# or
uvicorn main:app --reload --port 8000
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. First-Time Authentication

1. Open the frontend at `http://localhost:5173`
2. Click "Sync Data" button
3. A browser window will open for Google OAuth
4. Sign in with your Google account
5. Grant access to Google Sheets
6. Data will be synced automatically

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/status` | GET | Check authentication status |
| `/api/auth/connect` | POST | Initiate Google OAuth |
| `/api/sync` | POST | Sync all data from Google Sheets |
| `/api/dashboard` | GET | Get dashboard KPIs |
| `/api/comparison/banks` | GET | Get banks comparison data |
| `/api/comparison/advances` | GET | Get advances comparison data |
| `/api/comparison/suspense` | GET | Get suspense comparison data |
| `/api/comparison/outstanding` | GET | Get outstanding comparison data |
| `/api/outstanding/{month}` | GET | Get monthly outstanding details |
| `/api/settings` | GET | Get settings (banks, salesmen, areas) |

## Google Sheet Structure

The application expects a Google Sheet with the following sheets:

- `Dashboard` - Executive summary
- `Banks_Comparison` - Monthly bank comparison
- `Advances_Comparison` - Monthly advance comparison
- `Suspense_Comparison` - Monthly suspense comparison
- `Outstanding_Comparison` - Monthly outstanding comparison
- `Settings` - Master lists (banks, salesmen, areas)
- `Banks_[MMM-YYYY]` - Monthly bank data
- `Advances_[MMM-YYYY]` - Monthly advance data
- `Suspense_[MMM-YYYY]` - Monthly suspense data
- `Outstanding_[MMM-YYYY]` - Monthly outstanding data

## Configuration

Environment variables (in `backend/.env`):

```env
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_CREDENTIALS_FILE=credentials.json
GOOGLE_TOKEN_FILE=token.json
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:5173
```

## Development

### Backend
```bash
cd backend
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
```

## Deployment (Netlify + Railway)

### Frontend on Netlify

1. **Connect to Git**:
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build**:
   - Build settings are auto-detected from `netlify.toml`
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

3. **Set Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.railway.app`

4. **Deploy**: Netlify will auto-deploy on every push to main branch

### Backend on Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select the repository
4. Configure:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `GOOGLE_SHEET_ID` = your sheet ID
   - `FRONTEND_URL` = your Netlify URL
6. Add `credentials.json` content as a secret or use Service Account

### Alternative: Backend on Render

1. Go to [Render](https://render.com)
2. New → Web Service → Connect repo
3. Configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Troubleshooting

### "Authentication failed"
- Ensure `credentials.json` is in the backend folder
- Check that Google Sheets API is enabled in Cloud Console

### "No data available"
- Click "Sync Data" to fetch data from Google Sheets
- Check that the Sheet ID in config matches your spreadsheet

### "403 Permission Denied"
- Share the Google Sheet with the email in your credentials
- Or ensure the OAuth consent screen is configured properly

## License

Private - Internal Use Only
