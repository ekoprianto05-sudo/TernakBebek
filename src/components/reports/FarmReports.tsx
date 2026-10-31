import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Calendar, FileSpreadsheet, CheckCircle2, TrendingUp, Egg, Wheat, DollarSign } from 'lucide-react';
import { db } from '../../db/offlineStorage';
import { EggProductionRecord, FeedUsageLog, FinancialTransaction, Coop } from '../../types/farm';

export const FarmReports: React.FC = () => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [productions, setProductions] = useState<EggProductionRecord[]>([]);
  const [feedUsages, setFeedUsages] = useState<FeedUsageLog[]>([]);
  const [finances, setFinances] = useState<FinancialTransaction[]>([]);
  const [coops, setCoops] = useState<Coop[]>([]);

  useEffect(() => {
    setProductions(db.getEggProductions());
    setFeedUsages(db.getFeedUsages());
    setFinances(db.getFinanceTransactions());
    setCoops(db.getCoops());
  }, []);

  // Filter records based on selected period
  const filterPredicate = (dateStr: string) => {
    if (reportType === 'daily') return dateStr === selectedDate;
    if (reportType === 'monthly') return dateStr.startsWith(selectedMonth);
    return dateStr.startsWith(selectedYear);
  };

  const currentProductions = productions.filter(p => filterPredicate(p.date));
  const currentFeedUsages = feedUsages.filter(f => filterPredicate(f.date));
  const currentFinances = finances.filter(f => filterPredicate(f.date));

  // Calculated Metrics
  const totalEggs = currentProductions.reduce((sum, p) => sum + p.totalEggs, 0);
  const totalGoodEggs = currentProductions.reduce((sum, p) => sum + p.goodEggs, 0);
  const totalCrackedEggs = currentProductions.reduce((sum, p) => sum + p.crackedEggs, 0);
  const avgLayingRate = currentProductions.length > 0
    ? (currentProductions.reduce((sum, p) => sum + p.layingRatePercent, 0) / currentProductions.length).toFixed(1)
    : '0';

  const totalFeedKg = currentFeedUsages.reduce((sum, f) => sum + f.quantityUsed, 0);
  const fcr = totalEggs > 0 ? (totalFeedKg / (totalEggs * 0.068)).toFixed(2) : '2.40';

  const totalIncome = currentFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const totalExpense = currentFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const marginPercent = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';
  const costPerEgg = totalEggs > 0 ? (totalExpense / totalEggs).toFixed(3) : '0.00';

  // Export to CSV
  const handleExportCSV = () => {
    let csv = `DUCKFARM PRO - ${reportType.toUpperCase()} REPORT\n`;
    csv += `Period: ${reportType === 'daily' ? selectedDate : reportType === 'monthly' ? selectedMonth : selectedYear}\n`;
    csv += `Generated: ${new Date().toISOString()}\n\n`;

    csv += `EXECUTIVE SUMMARY\n`;
    csv += `Total Eggs Harvested,${totalEggs}\n`;
    csv += `Grade A Eggs,${totalGoodEggs}\n`;
    csv += `Cracked/Damaged Eggs,${totalCrackedEggs}\n`;
    csv += `Average Laying Rate %,${avgLayingRate}%\n`;
    csv += `Total Feed Consumed (kg),${totalFeedKg}\n`;
    csv += `Feed Conversion Ratio (FCR),${fcr}\n`;
    csv += `Total Farm Revenue ($),${totalIncome.toFixed(2)}\n`;
    csv += `Total Farm Expenses ($),${totalExpense.toFixed(2)}\n`;
    csv += `Net Profit ($),${netProfit.toFixed(2)}\n`;
    csv += `Profit Margin %,${marginPercent}%\n`;
    csv += `Production Cost per Egg ($),$${costPerEgg}\n\n`;

    csv += `DAILY PRODUCTION DETAILS\n`;
    csv += `Date,Coop ID,Morning Eggs,Afternoon Eggs,Total Eggs,Good Eggs,Cracked Eggs,Laying Rate %\n`;
    currentProductions.forEach(p => {
      csv += `${p.date},${p.coopId},${p.morningEggs},${p.afternoonEggs},${p.totalEggs},${p.goodEggs},${p.crackedEggs},${p.layingRatePercent}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DuckFarm_Report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Farm Analytics & Reports
          </h2>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
            {reportType} Farm Performance
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            title="Download CSV Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs transition-colors"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Period Selector & Date Controls */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-850 rounded-xl">
          <button
            onClick={() => setReportType('daily')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              reportType === 'daily'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              reportType === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              reportType === 'yearly'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Date input corresponding to report type */}
        <div className="flex items-center gap-2 pt-1">
          <Calendar className="w-4 h-4 text-slate-400" />
          {reportType === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          )}
          {reportType === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          )}
          {reportType === 'yearly' && (
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          )}
        </div>
      </div>

      {/* KPI Performance Matrix */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Executive Performance Matrix
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-500">Egg Harvest:</span>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              {totalEggs.toLocaleString()} eggs
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Grade A: {totalGoodEggs} · Cracked: {totalCrackedEggs}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-500">Laying Rate:</span>
            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {avgLayingRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Target benchmark: &gt;80%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-500">Feed Consumed:</span>
            <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {totalFeedKg} kg
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              FCR: {fcr} kg/dozen eggs
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-500">Cost per Egg:</span>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              ${costPerEgg}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Total expense / egg count
            </div>
          </div>
        </div>

        {/* Financial P&L Statement Strip */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            Profit & Loss Summary
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Gross Farm Revenue:</span>
            <span className="font-mono font-bold text-emerald-400">+${totalIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Total Operational Expenses:</span>
            <span className="font-mono font-bold text-rose-400">-${totalExpense.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-700">
            <span>NET PROFIT:</span>
            <span className="font-mono text-yellow-400">${netProfit.toFixed(2)} ({marginPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Production Log Breakdown */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
          Daily Production Breakdown ({currentProductions.length} logs)
        </h3>

        {currentProductions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No harvest logs recorded for this period.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentProductions.map(p => {
              const coop = coops.find(c => c.id === p.coopId);
              return (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {p.date} · {coop?.code} ({coop?.name})
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Morn: {p.morningEggs} · Aft: {p.afternoonEggs} · Cracked: {p.crackedEggs}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {p.totalEggs} eggs
                    </div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      {p.layingRatePercent}% Laying
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
