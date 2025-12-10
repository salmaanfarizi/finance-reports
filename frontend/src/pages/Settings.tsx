import { useEffect, useState } from 'react';
import { settingsService, authService } from '../services/api';
import { Settings as SettingsType, AuthStatus } from '../types';

export function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, authRes] = await Promise.all([
        settingsService.get().catch(() => null),
        authService.getStatus(),
      ]);
      setSettings(settingsRes);
      setAuthStatus(authRes);
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Connection Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Google Sheets Connection</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Authentication Status</span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                authStatus?.authenticated
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {authStatus?.authenticated ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Credentials File</span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                authStatus?.has_credentials
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {authStatus?.has_credentials ? 'Found' : 'Missing'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Token File</span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                authStatus?.has_token
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {authStatus?.has_token ? 'Found' : 'Not Generated'}
            </span>
          </div>
        </div>

        {!authStatus?.has_credentials && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800">Setup Required</h4>
            <p className="text-sm text-yellow-700 mt-1">
              To connect to Google Sheets, you need to:
            </p>
            <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 space-y-1">
              <li>Go to Google Cloud Console and create a project</li>
              <li>Enable the Google Sheets API</li>
              <li>Create OAuth 2.0 credentials (Desktop app)</li>
              <li>Download the credentials and save as `credentials.json` in the backend folder</li>
              <li>Restart the backend server</li>
            </ol>
          </div>
        )}
      </div>

      {/* Master Lists */}
      {settings && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Banks</h3>
            <ul className="space-y-2">
              {settings.banks.map((bank, index) => (
                <li
                  key={index}
                  className="px-3 py-2 bg-blue-50 rounded text-sm text-blue-700"
                >
                  {bank}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Salesmen</h3>
            <ul className="space-y-2">
              {settings.salesmen.map((salesman, index) => (
                <li
                  key={index}
                  className="px-3 py-2 bg-green-50 rounded text-sm text-green-700"
                >
                  {salesman}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Areas</h3>
            <ul className="space-y-2">
              {settings.areas.map((area, index) => (
                <li
                  key={index}
                  className="px-3 py-2 bg-purple-50 rounded text-sm text-purple-700"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Sheet ID */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Google Sheet Configuration</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Sheet ID</label>
          <input
            type="text"
            readOnly
            value="1FfofGkKptykgc4_1Df6CMgcm-D3Jo52qWnq4oBHcxUQ"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
          />
          <p className="text-xs text-gray-500">
            This is configured in the backend .env file
          </p>
        </div>
      </div>
    </div>
  );
}
