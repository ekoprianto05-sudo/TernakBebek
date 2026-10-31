import React, { useState, useEffect } from 'react';
import { Home, Plus, AlertCircle, Edit2, Trash2, Skull, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { db } from '../../db/offlineStorage';
import { Coop, DuckMortalityLog } from '../../types/farm';

export const CoopManagement: React.FC = () => {
  const [coops, setCoops] = useState<Coop[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [selectedCoop, setSelectedCoop] = useState<Coop | null>(null);

  // Form states for Coop
  const [formData, setFormData] = useState<Partial<Coop>>({
    code: '',
    name: '',
    breed: 'Khaki Campbell',
    capacity: 400,
    currentDucks: 350,
    maleDucks: 10,
    femaleDucks: 340,
    ageInWeeks: 28,
    status: 'active',
    notes: '',
  });

  // Form states for Mortality
  const [mortalityData, setMortalityData] = useState({
    coopId: '',
    count: 1,
    cause: 'Natural / Old Age',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadCoops();
  }, []);

  const loadCoops = () => {
    setCoops(db.getCoops());
  };

  const handleOpenAdd = (coopToEdit?: Coop) => {
    if (coopToEdit) {
      setSelectedCoop(coopToEdit);
      setFormData(coopToEdit);
    } else {
      setSelectedCoop(null);
      const nextNum = coops.length + 1;
      setFormData({
        code: `CP-0${nextNum}`,
        name: `Coop ${String.fromCharCode(64 + nextNum)}`,
        breed: 'Khaki Campbell',
        capacity: 400,
        currentDucks: 300,
        maleDucks: 10,
        femaleDucks: 290,
        ageInWeeks: 24,
        status: 'active',
        notes: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveCoop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const coopToSave: Coop = {
      id: selectedCoop ? selectedCoop.id : `coop-${Date.now()}`,
      code: formData.code || 'CP-NEW',
      name: formData.name,
      breed: formData.breed || 'Khaki Campbell',
      capacity: Number(formData.capacity) || 100,
      currentDucks: Number(formData.currentDucks) || 0,
      maleDucks: Number(formData.maleDucks) || 0,
      femaleDucks: Number(formData.femaleDucks) || 0,
      ageInWeeks: Number(formData.ageInWeeks) || 1,
      status: (formData.status as Coop['status']) || 'active',
      notes: formData.notes || '',
      createdDate: selectedCoop ? selectedCoop.createdDate : new Date().toISOString().split('T')[0],
    };

    db.saveCoop(coopToSave);
    setIsAddModalOpen(false);
    loadCoops();
  };

  const handleDeleteCoop = (id: string) => {
    if (confirm('Are you sure you want to delete this coop and all associated local logs?')) {
      db.deleteCoop(id);
      loadCoops();
    }
  };

  const handleOpenMortality = (coop: Coop) => {
    setSelectedCoop(coop);
    setMortalityData({
      coopId: coop.id,
      count: 1,
      cause: 'Natural / Weakness',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsMortalityModalOpen(true);
  };

  const handleSaveMortality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mortalityData.coopId || mortalityData.count <= 0) return;

    const log: DuckMortalityLog = {
      id: `mort-${Date.now()}`,
      coopId: mortalityData.coopId,
      date: mortalityData.date,
      count: Number(mortalityData.count),
      cause: mortalityData.cause,
      notes: mortalityData.notes,
    };

    db.logMortality(log);
    setIsMortalityModalOpen(false);
    loadCoops();
  };

  const filteredCoops = filterStatus === 'all'
    ? coops
    : coops.filter(c => c.status === filterStatus);

  const totalDucks = coops.reduce((sum, c) => sum + c.currentDucks, 0);
  const totalCapacity = coops.reduce((sum, c) => sum + c.capacity, 0);
  const totalFemales = coops.reduce((sum, c) => sum + c.femaleDucks, 0);

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Top Header Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Duck Housing & Flock
          </h2>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {totalDucks} <span className="text-sm font-normal text-slate-500">/ {totalCapacity} Capacity</span>
          </div>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Coop</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {['all', 'active', 'molting', 'quarantine'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
              filterStatus === status
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {status} ({status === 'all' ? coops.length : coops.filter(c => c.status === status).length})
          </button>
        ))}
      </div>

      {/* Coop List Cards */}
      <div className="space-y-3">
        {filteredCoops.map(coop => {
          const occupancy = Math.round((coop.currentDucks / coop.capacity) * 100);
          return (
            <div
              key={coop.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {coop.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {coop.name}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Breed: <strong className="text-slate-700 dark:text-slate-300">{coop.breed}</strong> · Age: {coop.ageInWeeks} weeks
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenAdd(coop)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Edit Coop"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCoop(coop.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Delete Coop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Population Grid */}
              <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Ducks</div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {coop.currentDucks}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Female Layers</div>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {coop.femaleDucks}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Male Drakes</div>
                  <div className="text-base font-bold font-mono text-slate-700 dark:text-slate-300">
                    {coop.maleDucks}
                  </div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Occupancy ({occupancy}%)</span>
                  <span>{coop.currentDucks} / {coop.capacity} max</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, occupancy)}%` }}
                    className={`h-full rounded-full ${
                      occupancy >= 95 ? 'bg-red-500' : occupancy >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Status: <span className="capitalize font-medium text-slate-600 dark:text-slate-300">{coop.status}</span>
                </span>
                
                <button
                  onClick={() => handleOpenMortality(coop)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70 transition-colors"
                >
                  <Skull className="w-3.5 h-3.5" />
                  <span>Log Mortality / Cull</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Coop Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {selectedCoop ? 'Edit Duck Coop' : 'Add New Duck Coop'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoop} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Coop Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. CP-05"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Coop Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Coop Epsilon"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Breed / Type
                  </label>
                  <select
                    value={formData.breed}
                    onChange={e => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Khaki Campbell">Khaki Campbell (Top Layer)</option>
                    <option value="Indian Runner">Indian Runner (High Yield)</option>
                    <option value="Peking Layer">Peking Layer</option>
                    <option value="Bali Duck">Bali Duck (Local Native)</option>
                    <option value="Magpie Duck">Magpie Duck</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Age (Weeks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={formData.ageInWeeks}
                    onChange={e => setFormData({ ...formData, ageInWeeks: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Female Layers
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.femaleDucks}
                    onChange={e => {
                      const f = Number(e.target.value);
                      const m = Number(formData.maleDucks) || 0;
                      setFormData({ ...formData, femaleDucks: f, currentDucks: f + m });
                    }}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Male Drakes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maleDucks}
                    onChange={e => {
                      const m = Number(e.target.value);
                      const f = Number(formData.femaleDucks) || 0;
                      setFormData({ ...formData, maleDucks: m, currentDucks: f + m });
                    }}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Housing Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as Coop['status'] })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                >
                  <option value="active">Active (Egg Laying)</option>
                  <option value="molting">Molting (Rest & Feathering)</option>
                  <option value="quarantine">Quarantine (Isolation)</option>
                  <option value="cleaning">Cleaning / Sanitation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Feed formula, lighting program, or observations..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Save Coop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mortality / Culling Modal */}
      {isMortalityModalOpen && selectedCoop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600">
                <Skull className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Log Mortality / Cull
                </h3>
              </div>
              <button
                onClick={() => setIsMortalityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMortality} className="space-y-3 mt-3">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                Coop: <strong>{selectedCoop.code} - {selectedCoop.name}</strong><br />
                Current Ducks: <strong className="font-mono">{selectedCoop.currentDucks}</strong>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Number of Ducks Lost
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedCoop.currentDucks}
                  required
                  value={mortalityData.count}
                  onChange={e => setMortalityData({ ...mortalityData, count: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Primary Cause
                </label>
                <select
                  value={mortalityData.cause}
                  onChange={e => setMortalityData({ ...mortalityData, cause: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Natural / Weakness">Natural / Weakness</option>
                  <option value="Egg Bound Complication">Egg Bound Complication</option>
                  <option value="Culling (Non-Productive)">Culling (Non-Productive)</option>
                  <option value="Respiratory Illness">Respiratory Illness</option>
                  <option value="Predator Incident">Predator Incident</option>
                  <option value="Heat Stress">Heat Stress</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={mortalityData.date}
                  onChange={e => setMortalityData({ ...mortalityData, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Action Taken & Disposal Notes
                </label>
                <textarea
                  rows={2}
                  value={mortalityData.notes}
                  onChange={e => setMortalityData({ ...mortalityData, notes: e.target.value })}
                  placeholder="Buried with lime, post-mortem check, biosecurity..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMortalityModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Confirm & Deduct
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
