import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Banks } from './pages/Banks';
import { Advances } from './pages/Advances';
import { Suspense } from './pages/Suspense';
import { Outstanding } from './pages/Outstanding';
import { Settings } from './pages/Settings';
import { authService, syncService } from './services/api';

type Page = 'dashboard' | 'banks' | 'advances' | 'suspense' | 'outstanding' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
    checkSyncStatus();
  }, []);

  const checkConnection = async () => {
    try {
      const status = await authService.getStatus();
      setIsConnected(status.authenticated);
    } catch (err) {
      setIsConnected(false);
    }
  };

  const checkSyncStatus = async () => {
    try {
      const status = await syncService.getStatus();
      setLastSync(status.last_sync);
      setIsConnected(status.authenticated);
    } catch (err) {
      console.error('Failed to check sync status:', err);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      // First try to connect if not connected
      if (!isConnected) {
        const connectResult = await authService.connect();
        if (!connectResult.success) {
          setError(connectResult.message);
          setIsSyncing(false);
          return;
        }
        setIsConnected(true);
      }

      // Then sync data
      const syncResult = await syncService.sync();
      if (syncResult.success) {
        setLastSync(syncResult.last_sync);
        // Refresh the current page
        setCurrentPage((prev) => prev);
      } else {
        setError(syncResult.message);
      }
    } catch (err) {
      setError('Sync failed. Please check your connection.');
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'banks':
        return <Banks />;
      case 'advances':
        return <Advances />;
      case 'suspense':
        return <Suspense />;
      case 'outstanding':
        return <Outstanding />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        isConnected={isConnected}
        lastSync={lastSync}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

        <main className="flex-1 p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {!isConnected && currentPage !== 'settings' && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">
                Not connected to Google Sheets. Click "Sync Data" to connect and load data.
              </p>
            </div>
          )}

          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
