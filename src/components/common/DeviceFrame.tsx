import React from 'react';
import { Smartphone, Tablet, Monitor, Shield, Lock, Moon, Sun, Download, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export type DeviceMode = 'phone' | 'tablet' | 'desktop';

interface DeviceFrameProps {
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceMode,
  setDeviceMode,
  isDark,
  setIsDark,
  children,
}) => {
  const { currentUser, lockScreen } = useAuth();
  const { isInstallable, install } = usePWAInstall();
  const [isOnline, setIsOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} flex flex-col`}>
      {/* Top Device Bar (Simulates Android Hardware / Preview Switcher) */}
      <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 z-30 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Offline status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                🦆
              </span>
              <div className="leading-tight">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block">
                  DuckFarm Pro
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Android & Tablet Offline Suite
                </span>
              </div>
            </div>

            {/* Offline state indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>SQLite Offline Storage Ready</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-500" />
                  <span>Offline Mode (Local SQLite Active)</span>
                </>
              )}
            </div>
          </div>

          {/* Center: Device Preview Switcher */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setDeviceMode('phone')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                deviceMode === 'phone'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Android Smartphone Portrait (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone</span>
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                deviceMode === 'tablet'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Android Tablet (820px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Full Width Responsive"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
          </div>

          {/* Right Controls: PWA install, Theme, Lock, User */}
          <div className="flex items-center gap-2">
            {isInstallable && (
              <button
                onClick={install}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install APK</span>
              </button>
            )}

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser && (
              <button
                onClick={lockScreen}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                title="Lock Session with PIN"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Lock PIN</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 flex justify-center items-start p-0 md:p-3 overflow-x-hidden">
        {deviceMode === 'phone' ? (
          <div className="w-full max-w-[420px] my-0 md:my-2 bg-white dark:bg-slate-900 rounded-none md:rounded-[36px] shadow-2xl border-0 md:border-[10px] md:border-slate-800 dark:md:border-slate-800 overflow-hidden min-h-[92vh] flex flex-col relative transition-all">
            {/* Phone Top Notch / Speaker & Status Bar */}
            <div className="hidden md:flex items-center justify-between px-6 py-2 bg-slate-900 text-white text-[11px] font-mono">
              <span>9:41</span>
              <div className="w-16 h-4 bg-slate-950 rounded-full mx-auto" />
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              {children}
            </div>
            {/* Android Navigation Pill bar */}
            <div className="hidden md:flex justify-center items-center py-2 bg-white dark:bg-slate-900">
              <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
          </div>
        ) : deviceMode === 'tablet' ? (
          <div className="w-full max-w-[860px] my-0 md:my-2 bg-white dark:bg-slate-900 rounded-none md:rounded-[28px] shadow-2xl border-0 md:border-[10px] md:border-slate-800 dark:md:border-slate-800 overflow-hidden min-h-[92vh] flex flex-col relative transition-all">
            {/* Tablet Status Bar */}
            <div className="hidden md:flex items-center justify-between px-6 py-1.5 bg-slate-900 text-white text-[11px] font-mono">
              <span className="text-emerald-400 font-semibold">DuckFarm OS Tablet</span>
              <span>100% Battery · Local SQLite Active</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              {children}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-none md:rounded-2xl shadow-sm border-0 md:border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[90vh]">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
