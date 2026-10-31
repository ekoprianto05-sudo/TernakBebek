import React, { useState, useEffect } from 'react';
import { Egg, Plus, Calendar, Filter, Trash2, CheckCircle2, AlertTriangle, TrendingUp, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../db/offlineStorage';
import { EggProductionRecord, Coop } from '../../types/farm';
import { useAuth } from '../../context/AuthContext';

export const EggProduction: React.FC = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<EggProductionRecord[]>([]);
  const [coops, setCoops] = useState<Coop[]>([]);
  const [selectedCoopId, setSelectedCoopId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCoopId, setFormCoopId] = useState('');
  const [morningEggs, setMorningEggs] = useState<number>(250);
  const [afternoonEggs, setAfternoonEggs] = useState<number>(100);
  const [crackedEggs, setCrackedEggs] = useState<number>(5);
  const [smallEggs, setSmallEggs] = useState<number>(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedCoops = db.getCoops();
    setCoops(loadedCoops);
    if (loadedCoops.length > 0 && !formCoopId) {
      setFormCoopId(loadedCoops[0].id);
    }
    setRecords(db.getEggProductions());
  };

  const currentSelectedCoop = coops.find(c => c.id === formCoopId);
  const totalEggs = Number(morningEggs) + Number(afternoonEggs);
  const goodEggs = Math.max(0, totalEggs - (Number(crackedEggs) + Number(smallEggs)));
  const femaleDucks = currentSelectedCoop?.femaleDucks || 1;
  const calculatedLayingRate = Number(((totalEggs / femaleDucks) * 100).toFixed(1));

  const handleSaveProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCoopId || totalEggs <= 0) return;

    const newRecord: EggProductionRecord = {
      id: `ep-${Date.now()}`,
      coopId: formCoopId,
      date: formDate,
      morningEggs: Number(morningEggs),
      afternoonEggs: Number(afternoonEggs),
      totalEggs,
      goodEggs,
      crackedEggs: Number(crackedEggs),
      smallEggs: Number(smallEggs),
      layingRatePercent: calculatedLayingRate,
      notes,
      loggedBy: currentUser?.fullName || 'Farm Operator',
    };

    db.saveEggProduction(newRecord);
    
    // Celebration if high laying rate
    if (calculatedLayingRate >= 80) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this egg production record?')) {
      db.deleteEggProduction(id);
      loadData();
    }
  };

  const filteredRecords = selectedCoopId === 'all'
    ? records
    : records.filter(r => r.coopId === selectedCoopId);

  const totalCollected = filteredRecords.reduce((sum, r) => sum + r.totalEggs, 0);
  const totalGood = filteredRecords.reduce((sum, r) => sum + r.goodEggs, 0);
  const totalCracked = filteredRecords.reduce((sum, r) => sum + r.crackedEggs, 0);
  const avgRate = filteredRecords.length > 0
    ? (filteredRecords.reduce((sum, r) => sum + r.layingRatePercent, 0) / filteredRecords.length).toFixed(1)
    : '0';

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Egg Production Tracking
          </h2>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {totalCollected} Eggs <span className="text-xs font-normal text-slate-500">Collected</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (coops.length > 0 && !formCoopId) setFormCoopId(coops[0].id);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record Daily Harvest</span>
        </button>
      </div>

      {/* 3 Metric Mini Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Grade A Quality</div>
          <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {totalGood}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Laying Rate</div>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
            {avgRate}%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Cracked / Damaged</div>
          <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
            {totalCracked}
          </div>
        </div>
      </div>

      {/* Coop Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCoopId('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            selectedCoopId === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          All Coops
        </button>
        {coops.map(coop => (
          <button
            key={coop.id}
            onClick={() => setSelectedCoopId(coop.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCoopId === coop.id
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {coop.code} - {coop.name.split('-')[0]}
          </button>
        ))}
      </div>

      {/* Records Table / List */}
      <div className="space-y-2">
        {filteredRecords.map(record => {
          const matchedCoop = coops.find(c => c.id === record.coopId);
          return (
            <div
              key={record.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {matchedCoop?.code || 'Coop'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {record.date}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                    {record.layingRatePercent}% Rate
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Total: <strong className="font-mono">{record.totalEggs}</strong> (Morning: {record.morningEggs} · Afternoon: {record.afternoonEggs})
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span>Grade A: {record.goodEggs}</span>
                  <span>·</span>
                  <span>Cracked: {record.crackedEggs}</span>
                  <span>·</span>
                  <span>By: {record.loggedBy}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(record.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Record Harvest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Egg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Daily Egg Harvest Entry
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduction} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Coop
                  </label>
                  <select
                    value={formCoopId}
                    onChange={e => setFormCoopId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {coops.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name} ({c.femaleDucks} layers)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Egg Quantities */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Morning Harvest (Eggs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={morningEggs}
                    onChange={e => setMorningEggs(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Afternoon Harvest (Eggs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={afternoonEggs}
                    onChange={e => setAfternoonEggs(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Quality Sorting */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Cracked / Damaged
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={crackedEggs}
                    onChange={e => setCrackedEggs(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Small / Dirty Eggs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={smallEggs}
                    onChange={e => setSmallEggs(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Automatic Calculation Preview */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">Total Harvest:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{totalEggs} eggs</strong>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-600 dark:text-slate-300">Grade A Clean Eggs:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{goodEggs} eggs</strong>
                </div>
                <div className="flex items-center justify-between text-xs mt-1 font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Laying Efficiency:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                    {calculatedLayingRate}%
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Observations / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Egg shell thickness, duck appetite, weather condition..."
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
