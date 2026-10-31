/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DeviceFrame, DeviceMode } from './components/common/DeviceFrame';
import { Navbar } from './components/layout/Navbar';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { LoginModal } from './components/auth/LoginModal';
import { FarmDashboard } from './components/dashboard/FarmDashboard';
import { CoopManagement } from './components/coops/CoopManagement';
import { EggProduction } from './components/production/EggProduction';
import { FeedManagement } from './components/feed/FeedManagement';
import { EggSales } from './components/sales/EggSales';
import { FinancialManagement } from './components/finance/FinancialManagement';
import { DuckHealthScheduling } from './components/health/DuckHealthScheduling';
import { FarmReports } from './components/reports/FarmReports';
import { BackupRestore } from './components/backup/BackupRestore';

const MainAppContent: React.FC = () => {
  const { isLocked } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('phone');
  const [isDark, setIsDark] = useState<boolean>(false);

  // Sync dark class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleQuickAction = (action: 'egg' | 'feed' | 'sale' | 'health') => {
    switch (action) {
      case 'egg':
        setCurrentTab('production');
        break;
      case 'feed':
        setCurrentTab('feed');
        break;
      case 'sale':
        setCurrentTab('sales');
        break;
      case 'health':
        setCurrentTab('health');
        break;
    }
  };

  return (
    <DeviceFrame
      deviceMode={deviceMode}
      setDeviceMode={setDeviceMode}
      isDark={isDark}
      setIsDark={setIsDark}
    >
      {/* Top Android App Bar */}
      <Navbar
        currentTab={currentTab}
        onOpenQuickAdd={() => setCurrentTab('production')}
      />

      {/* Screen Body Viewports */}
      <div className="flex-1 overflow-y-auto">
        {currentTab === 'dashboard' && (
          <FarmDashboard
            onNavigate={(tab) => setCurrentTab(tab)}
            onQuickAction={handleQuickAction}
          />
        )}
        {currentTab === 'coops' && <CoopManagement />}
        {currentTab === 'production' && <EggProduction />}
        {currentTab === 'feed' && <FeedManagement />}
        {currentTab === 'sales' && <EggSales />}
        {currentTab === 'finance' && <FinancialManagement />}
        {currentTab === 'health' && <DuckHealthScheduling />}
        {currentTab === 'reports' && <FarmReports />}
        {currentTab === 'backup_android' && <BackupRestore />}
      </div>

      {/* Bottom Android Navigation Bar */}
      <BottomNav
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
      />

      {/* PIN Lock Screen Overlay */}
      {isLocked && <LoginModal />}
    </DeviceFrame>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
