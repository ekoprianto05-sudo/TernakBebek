import React, { useState, useEffect } from 'react';
import {
  Egg,
  TrendingUp,
  Wheat,
  DollarSign,
  AlertTriangle,
  HeartPulse,
  Plus,
  ArrowUpRight,
  CheckCircle,
  Home,
  Users
} from 'lucide-react';
import { db } from '../../db/offlineStorage';
import { FarmOverviewStats, Coop, EggProductionRecord, FeedItem, HealthSchedule } from '../../types/farm';
import { NavTab } from '../layout/BottomNav';

interface FarmDashboardProps {
  onNavigate: (tab: NavTab) => void;
  onQuickAction: (action: 'egg' | 'feed' | 'sale' | 'health') => void;
}

export const FarmDashboard: React.FC<FarmDashboardProps> = ({ onNavigate, onQuickAction }) => {
  const [stats, setStats] = useState<FarmOverviewStats | null>(null);
  const [coops, setCoops] = useState<Coop[]>([]);
  const [recentProduction, setRecentProduction] = useState<EggProductionRecord[]>([]);
  const [lowStockFeeds, setLowStockFeeds] = useState<FeedItem[]>([]);
  const [upcomingHealth, setUpcomingHealth] = useState<HealthSchedule[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(db.getOverviewStats());
    setCoops(db.getCoops());
    setRecentProduction(db.getEggProductions().slice(0, 7));
    setLowStockFeeds(db.getFeedItems().filter(f => f.currentStock <= f.minThreshold));
    setUpcomingHealth(
      db.getHealthSchedules()
        .filter(h => h.status === 'scheduled' || h.status === 'overdue')
        .slice(0, 3)
    );
  };

  if (!stats) return null;

  // 7-day trend chart calculation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const recs = db.getEggProductions().filter(p => p.date === dateStr);
    const total = recs.reduce((sum, r) => sum + r.totalEggs, 0);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    return { date: dateStr, dayLabel, total };
  });

  const maxHarvest = Math.max(...last7Days.map(d => d.total), 500);

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
            Duck Farming Operations
          </div>
          <h2 className="text-lg sm:text-xl font-bold mt-0.5">
            Overview & Daily Harvest
          </h2>
          <div className="flex items-center gap-2 text-xs text-emerald-200 mt-1">
            <span>{stats.totalDucks} Active Ducks</span>
            <span aria-hidden="true">·</span>
            <span>{stats.activeCoopsCount} Coops</span>
            <span aria-hidden="true">·</span>
            <span>{stats.totalFemaleDucks} Layers</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-extrabold font-mono tabular-nums text-yellow-300">
            {stats.layingRatePercent}%
          </div>
          <div className="text-[11px] text-emerald-200">
            Laying Efficiency
          </div>
        </div>
      </div>

      {/* Critical Alert Banners if any */}
      {lowStockFeeds.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Low Feed Stock Warning ({lowStockFeeds.length} items)
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                {lowStockFeeds.map(f => `${f.name}: ${f.currentStock} ${f.unit}`).join(', ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('feed')}
            className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline shrink-0"
          >
            Restock
          </button>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Eggs */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Eggs Collected Today</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Egg className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {stats.todayEggs}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-0.5">
              <span>Grade A: {recentProduction[0]?.goodEggs || stats.todayEggs}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.layingRatePercent}%</span>
            </div>
          </div>
        </div>

        {/* Daily Feed Used */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Feed Consumption</span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Wheat className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {stats.todayFeedUsedKg} <span className="text-xs font-normal">kg</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              FCR: <strong className="text-slate-700 dark:text-slate-300 font-mono">{stats.fcrRatio}</strong> kg/dozen
            </div>
          </div>
        </div>

        {/* Monthly Net Profit */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Month Net Profit</span>
            <span className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              ${stats.monthNetProfit.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Margin: {stats.profitMarginPercent}%
            </div>
          </div>
        </div>

        {/* Health / Vaccine reminders */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Health & Vaccines</span>
            <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <HeartPulse className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {stats.pendingHealthAlertsCount} <span className="text-xs font-normal">tasks</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {upcomingHealth[0]?.title ? upcomingHealth[0].title.slice(0, 18) + '...' : 'All schedules on track'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Thumb Reach Zone) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          Quick Farm Actions
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onQuickAction('egg')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 transition-colors"
          >
            <Egg className="w-5 h-5 mb-1 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-semibold text-center leading-tight">Log Eggs</span>
          </button>

          <button
            onClick={() => onQuickAction('feed')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 transition-colors"
          >
            <Wheat className="w-5 h-5 mb-1 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] font-semibold text-center leading-tight">Log Feed</span>
          </button>

          <button
            onClick={() => onQuickAction('sale')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-800 dark:text-blue-300 transition-colors"
          >
            <DollarSign className="w-5 h-5 mb-1 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-semibold text-center leading-tight">Egg Sale</span>
          </button>

          <button
            onClick={() => onQuickAction('health')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-800 dark:text-rose-300 transition-colors"
          >
            <HeartPulse className="w-5 h-5 mb-1 text-rose-600 dark:text-rose-400" />
            <span className="text-[11px] font-semibold text-center leading-tight">Vitamins</span>
          </button>
        </div>
      </div>

      {/* 7-Day Egg Production Trend Chart */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              7-Day Harvest Trend
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Daily egg production across all coops
            </p>
          </div>
          <button
            onClick={() => onNavigate('production')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-32 pt-4 px-1 border-b border-slate-100 dark:border-slate-700/60">
          {last7Days.map((item, idx) => {
            const heightPercent = maxHarvest > 0 ? Math.max(12, Math.round((item.total / maxHarvest) * 100)) : 12;
            const isToday = idx === 6;
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mb-1">
                  {item.total > 0 ? item.total : '-'}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                    isToday
                      ? 'bg-emerald-600 dark:bg-emerald-500 shadow-sm'
                      : 'bg-emerald-200 dark:bg-emerald-900/60 hover:bg-emerald-300'
                  }`}
                />
                <span className={`text-[10px] mt-1.5 font-medium ${isToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                  {item.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Coops Snapshot */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Coops & Population
            </h3>
          </div>
          <button
            onClick={() => onNavigate('coops')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Manage Coops
          </button>
        </div>

        <div className="space-y-2">
          {coops.map(coop => {
            const occupancy = Math.round((coop.currentDucks / coop.capacity) * 100);
            return (
              <div
                key={coop.id}
                onClick={() => onNavigate('coops')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {coop.code}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      {coop.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({coop.breed})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {coop.currentDucks} ducks · {coop.femaleDucks} layers · {coop.ageInWeeks} wks
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {occupancy}%
                  </span>
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, occupancy)}%` }}
                      className={`h-full rounded-full ${
                        occupancy > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
