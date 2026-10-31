import React, { useState, useEffect } from 'react';
import { Wheat, Plus, AlertTriangle, ArrowDownRight, PackageCheck, History, X, RefreshCw } from 'lucide-react';
import { db } from '../../db/offlineStorage';
import { FeedItem, FeedUsageLog, Coop } from '../../types/farm';

export const FeedManagement: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedUsages, setFeedUsages] = useState<FeedUsageLog[]>([]);
  const [coops, setCoops] = useState<Coop[]>([]);

  // Modals
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  // Feed usage form
  const [usageForm, setUsageForm] = useState({
    coopId: '',
    feedItemId: '',
    quantityUsed: 35,
    timeOfDay: 'morning' as 'morning' | 'afternoon' | 'evening',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Restock form
  const [restockForm, setRestockForm] = useState({
    name: '',
    category: 'layer' as FeedItem['category'],
    unit: 'kg',
    quantityToAdd: 250,
    costPerUnit: 0.65,
    supplier: 'AgroFeed Millindo',
    recordExpense: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedItems = db.getFeedItems();
    const loadedCoops = db.getCoops();
    setFeedItems(loadedItems);
    setCoops(loadedCoops);
    setFeedUsages(db.getFeedUsages());

    if (loadedItems.length > 0 && !usageForm.feedItemId) {
      setUsageForm(prev => ({
        ...prev,
        feedItemId: loadedItems[0].id,
        coopId: loadedCoops.length > 0 ? loadedCoops[0].id : '',
      }));
    }
  };

  const handleSaveUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageForm.coopId || !usageForm.feedItemId || usageForm.quantityUsed <= 0) return;

    const log: FeedUsageLog = {
      id: `fu-${Date.now()}`,
      coopId: usageForm.coopId,
      feedItemId: usageForm.feedItemId,
      date: usageForm.date,
      quantityUsed: Number(usageForm.quantityUsed),
      timeOfDay: usageForm.timeOfDay,
      notes: usageForm.notes,
    };

    db.logFeedUsage(log);
    setIsUsageModalOpen(false);
    loadData();
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockForm.name || restockForm.quantityToAdd <= 0) return;

    // Check if item exists
    const existing = feedItems.find(f => f.name.toLowerCase() === restockForm.name.toLowerCase());
    const id = existing ? existing.id : `feed-${Date.now()}`;
    const newStock = existing ? existing.currentStock + Number(restockForm.quantityToAdd) : Number(restockForm.quantityToAdd);

    const feedItem: FeedItem = {
      id,
      name: restockForm.name,
      category: restockForm.category,
      unit: restockForm.unit,
      currentStock: newStock,
      minThreshold: existing ? existing.minThreshold : 200,
      costPerUnit: Number(restockForm.costPerUnit),
      supplier: restockForm.supplier,
      lastRestockedDate: new Date().toISOString().split('T')[0],
    };

    db.saveFeedItem(feedItem);

    // Optionally record expense in finance
    if (restockForm.recordExpense) {
      const totalCost = Number(restockForm.quantityToAdd) * Number(restockForm.costPerUnit);
      db.saveFinanceTransaction({
        id: `fin-feed-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: 'feed_purchase',
        amount: totalCost,
        description: `Purchased ${restockForm.quantityToAdd}${restockForm.unit} ${restockForm.name} from ${restockForm.supplier}`,
        referenceId: id,
      });
    }

    setIsRestockModalOpen(false);
    loadData();
  };

  const totalStockKg = feedItems.reduce((sum, f) => sum + f.currentStock, 0);
  const lowStockCount = feedItems.filter(f => f.currentStock <= f.minThreshold).length;

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Feed Inventory & Usage
          </h2>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {totalStockKg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg in Stock</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRestockModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Restock</span>
          </button>
          <button
            onClick={() => setIsUsageModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log Feeding</span>
          </button>
        </div>
      </div>

      {/* Low stock notice */}
      {lowStockCount > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{lowStockCount} feed item(s) below recommended safety buffer threshold!</span>
        </div>
      )}

      {/* Feed Stock Cards */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Feed Stock Depots
        </h3>
        {feedItems.map(item => {
          const isLow = item.currentStock <= item.minThreshold;
          const percentage = Math.min(100, Math.round((item.currentStock / (item.minThreshold * 3)) * 100));

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    {isLow && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Category: <span className="capitalize text-slate-700 dark:text-slate-300">{item.category}</span> · Cost: ${item.costPerUnit}/{item.unit}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                    {item.currentStock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Min buffer: {item.minThreshold} {item.unit}
                  </div>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-2.5 overflow-hidden">
                <div
                  style={{ width: `${percentage}%` }}
                  className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Feed Usage Logs */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Consumption Logs
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {feedUsages.length} entries
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {feedUsages.slice(0, 5).map(log => {
            const feed = feedItems.find(f => f.id === log.feedItemId);
            const coop = coops.find(c => c.id === log.coopId);
            return (
              <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {coop?.code || 'Coop'} · <span className="font-normal text-slate-500">{feed?.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {log.date} · {log.timeOfDay} ration {log.notes && `· "${log.notes}"`}
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                  -{log.quantityUsed} kg
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Feeding Modal */}
      {isUsageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-600" />
                <span>Log Daily Feeding</span>
              </h3>
              <button
                onClick={() => setIsUsageModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUsage} className="space-y-3 mt-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Coop
                </label>
                <select
                  value={usageForm.coopId}
                  onChange={e => setUsageForm({ ...usageForm, coopId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {coops.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} ({c.currentDucks} ducks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Feed Formula / Ration
                </label>
                <select
                  value={usageForm.feedItemId}
                  onChange={e => setUsageForm({ ...usageForm, feedItemId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {feedItems.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} (Stock: {f.currentStock} {f.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Quantity Used (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={usageForm.quantityUsed}
                    onChange={e => setUsageForm({ ...usageForm, quantityUsed: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Feeding Time
                  </label>
                  <select
                    value={usageForm.timeOfDay}
                    onChange={e => setUsageForm({ ...usageForm, timeOfDay: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                  >
                    <option value="morning">Morning Ration</option>
                    <option value="afternoon">Afternoon Ration</option>
                    <option value="evening">Evening Ration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={usageForm.date}
                  onChange={e => setUsageForm({ ...usageForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUsageModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                >
                  Log & Deduct
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Feed Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>Restock Feed Inventory</span>
              </h3>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestock} className="space-y-3 mt-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Feed Item Name
                </label>
                <input
                  type="text"
                  required
                  value={restockForm.name}
                  onChange={e => setRestockForm({ ...restockForm, name: e.target.value })}
                  placeholder="e.g. Duck Layer Mash Supreme"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Quantity to Add ({restockForm.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockForm.quantityToAdd}
                    onChange={e => setRestockForm({ ...restockForm, quantityToAdd: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Cost per Unit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={restockForm.costPerUnit}
                    onChange={e => setRestockForm({ ...restockForm, costPerUnit: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  value={restockForm.supplier}
                  onChange={e => setRestockForm({ ...restockForm, supplier: e.target.value })}
                  placeholder="e.g. AgroFeed Millindo"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                Total Purchase Cost:{' '}
                <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                  ${(restockForm.quantityToAdd * restockForm.costPerUnit).toFixed(2)}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recordExp"
                  checked={restockForm.recordExpense}
                  onChange={e => setRestockForm({ ...restockForm, recordExpense: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <label htmlFor="recordExp" className="text-xs text-slate-700 dark:text-slate-300">
                  Auto-record in Financial Expense Ledger
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
