import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Filter, Trash2, Calendar, PieChart, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { db } from '../../db/offlineStorage';
import { FinancialTransaction } from '../../types/farm';

export const FinancialManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'year'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState<FinancialTransaction['category']>('feed_purchase');
  const [formAmount, setFormAmount] = useState<number>(50);
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    setTransactions(db.getFinanceTransactions());
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription || formAmount <= 0) return;

    const newTx: FinancialTransaction = {
      id: `fin-${Date.now()}`,
      date: formDate,
      type: formType,
      category: formCategory,
      amount: Number(formAmount),
      description: formDescription,
    };

    db.saveFinanceTransaction(newTx);
    setIsModalOpen(false);
    resetForm();
    loadTransactions();
  };

  const resetForm = () => {
    setFormAmount(50);
    setFormDescription('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this financial entry?')) {
      db.deleteFinanceTransaction(id);
      loadTransactions();
    }
  };

  // Filter logic
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentYearPrefix = new Date().toISOString().substring(0, 4);

  const filteredByPeriod = transactions.filter(t => {
    if (periodFilter === 'month') return t.date.startsWith(currentMonthPrefix);
    if (periodFilter === 'year') return t.date.startsWith(currentYearPrefix);
    return true;
  });

  const filteredTransactions = filterType === 'all'
    ? filteredByPeriod
    : filteredByPeriod.filter(t => t.type === filterType);

  const totalIncome = filteredByPeriod.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredByPeriod.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const marginPercent = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Financials & Profit
          </h2>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            ${netProfit.toFixed(2)}{' '}
            <span className={`text-xs font-semibold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              ({marginPercent}% Margin)
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Period Filter (Month vs Year vs All) */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setPeriodFilter('month')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            periodFilter === 'month'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setPeriodFilter('year')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            periodFilter === 'year'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          This Year
        </button>
        <button
          onClick={() => setPeriodFilter('all')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            periodFilter === 'all'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Income vs Expense Financial Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Income</span>
            <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            +${totalIncome.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Egg sales & manure
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Expenses</span>
            <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-2">
            -${totalExpense.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Feed, medicine & upkeep
          </div>
        </div>
      </div>

      {/* Filter Tabs for Transactions */}
      <div className="flex items-center gap-1.5">
        {(['all', 'income', 'expense'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              filterType === type
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {type} ({type === 'all' ? filteredByPeriod.length : filteredByPeriod.filter(t => t.type === type).length})
          </button>
        ))}
      </div>

      {/* Transaction Ledger */}
      <div className="space-y-2">
        {filteredTransactions.map(tx => {
          const isIncome = tx.type === 'income';
          return (
            <div
              key={tx.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    isIncome
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                  }`}>
                    {tx.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {tx.date}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {tx.description}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`text-base font-bold font-mono ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
                </div>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Financial Record
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3 mt-3">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('expense');
                    setFormCategory('feed_purchase');
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    formType === 'expense'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Expense Out
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormType('income');
                    setFormCategory('egg_sales');
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    formType === 'income'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Income In
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                >
                  {formType === 'income' ? (
                    <>
                      <option value="egg_sales">Egg Sales</option>
                      <option value="duck_sales">Duck / Cull Sales</option>
                      <option value="manure_sales">Manure Fertilizer Sales</option>
                      <option value="other">Other Farm Income</option>
                    </>
                  ) : (
                    <>
                      <option value="feed_purchase">Feed Inventory Purchase</option>
                      <option value="medicines_vitamins">Vitamins & Vaccines</option>
                      <option value="coop_maintenance">Coop Upkeep & Repairs</option>
                      <option value="labor_salary">Worker Honorarium / Wages</option>
                      <option value="utilities">Electricity & Water</option>
                      <option value="other">Miscellaneous Farm Expense</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={formAmount}
                  onChange={e => setFormAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="e.g. 10 bags of Corn Grits or Water Trough repair"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
