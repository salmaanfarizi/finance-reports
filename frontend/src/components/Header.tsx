import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  lastSync: string | null;
  onSync: () => void;
  isSyncing: boolean;
}

export function Header({ isConnected, lastSync, onSync, isSyncing }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FR</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Finance Reports</h1>
              <p className="text-sm text-gray-500">Monthly Accounting System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {lastSync && (
              <span className="text-sm text-gray-500">
                Last sync: {new Date(lastSync).toLocaleTimeString()}
              </span>
            )}

            <button
              onClick={onSync}
              disabled={isSyncing || !isConnected}
              className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
