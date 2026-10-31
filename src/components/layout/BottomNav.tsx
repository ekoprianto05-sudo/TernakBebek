import React from 'react';
import {
  LayoutDashboard,
  Home,
  Egg,
  Wheat,
  DollarSign,
  HeartPulse,
  BarChart3,
  Database,
  Smartphone
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'coops'
  | 'production'
  | 'feed'
  | 'sales'
  | 'finance'
  | 'health'
  | 'reports'
  | 'backup_android';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'coops', label: 'Coops', icon: Home },
    { id: 'production', label: 'Eggs', icon: Egg },
    { id: 'feed', label: 'Feed', icon: Wheat },
    { id: 'sales', label: 'Sales', icon: DollarSign },
    { id: 'finance', label: 'Profit', icon: BarChart3 },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'backup_android', label: 'APK & DB', icon: Smartphone },
  ];

  // For phone viewports, show top 5 primary tabs + scrollable or responsive items
  return (
    <nav className="no-print sticky bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-1 py-1 transition-colors">
      <div className="flex items-center justify-around overflow-x-auto no-scrollbar max-w-full">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center min-w-[54px] sm:min-w-[64px] h-12 py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute top-1 w-6 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[56px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
