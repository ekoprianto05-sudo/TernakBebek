import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onOpenQuickAdd: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onOpenQuickAdd }) => {
  const { currentUser } = useAuth();

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Farm Overview';
      case 'coops':
        return 'Duck Coops & Population';
      case 'production':
        return 'Daily Egg Production';
      case 'feed':
        return 'Feed Inventory & Logs';
      case 'sales':
        return 'Egg Sales & Invoices';
      case 'finance':
        return 'Finances & Profit';
      case 'health':
        return 'Health & Vitamins';
      case 'reports':
        return 'Farm Analytics & Reports';
      case 'backup_android':
        return 'SQLite Backup & Android APK';
      default:
        return 'DuckFarm Pro';
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
          {getTitle()}
        </h1>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>{todayStr}</span>
          <span aria-hidden="true">·</span>
          <span>Offline SQLite Active</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {currentUser && (
          <div className="flex items-center gap-1.5 pl-2 py-1 pr-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-sm">{currentUser.avatar || '🦆'}</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[90px] sm:max-w-[130px]">
              {currentUser.fullName.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
