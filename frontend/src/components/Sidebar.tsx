import {
  LayoutDashboard,
  Building2,
  Wallet,
  HelpCircle,
  Users,
  Settings,
} from 'lucide-react';

type Page = 'dashboard' | 'banks' | 'advances' | 'suspense' | 'outstanding' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const menuItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'banks', label: 'Banks', icon: <Building2 className="w-5 h-5" /> },
  { id: 'advances', label: 'Advances', icon: <Wallet className="w-5 h-5" /> },
  { id: 'suspense', label: 'Suspense', icon: <HelpCircle className="w-5 h-5" /> },
  { id: 'outstanding', label: 'Outstanding', icon: <Users className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === item.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
