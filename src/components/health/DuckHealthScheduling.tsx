import React, { useState, useEffect } from 'react';
import { HeartPulse, Plus, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Trash2, Calendar, X } from 'lucide-react';
import { db } from '../../db/offlineStorage';
import { HealthSchedule, Coop } from '../../types/farm';
import { useAuth } from '../../context/AuthContext';

export const DuckHealthScheduling: React.FC = () => {
  const { currentUser } = useAuth();
  const [schedules, setSchedules] = useState<HealthSchedule[]>([]);
  const [coops, setCoops] = useState<Coop[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'overdue' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HealthSchedule['type']>('vitamin');
  const [coopId, setCoopId] = useState('all');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [dosage, setDosage] = useState('5g per 10 liters drinking water');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSchedules(db.getHealthSchedules());
    setCoops(db.getCoops());
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dosage) return;

    const newSchedule: HealthSchedule = {
      id: `health-${Date.now()}`,
      title,
      type,
      coopId,
      scheduledDate,
      dosage,
      status: 'scheduled',
      notes,
    };

    db.saveHealthSchedule(newSchedule);
    setIsModalOpen(false);
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setTitle('');
    setType('vitamin');
    setDosage('5g per 10 liters drinking water');
    setNotes('');
  };

  const handleMarkCompleted = (schedule: HealthSchedule) => {
    const updated: HealthSchedule = {
      ...schedule,
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
      administeredBy: currentUser?.fullName || 'Farm Operator',
    };
    db.saveHealthSchedule(updated);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this health schedule?')) {
      db.deleteHealthSchedule(id);
      loadData();
    }
  };

  const filtered = filterStatus === 'all'
    ? schedules
    : schedules.filter(s => s.status === filterStatus);

  const pendingCount = schedules.filter(s => s.status === 'scheduled').length;
  const overdueCount = schedules.filter(s => s.status === 'overdue').length;
  const completedCount = schedules.filter(s => s.status === 'completed').length;

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Duck Health & Vitamins
          </h2>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {pendingCount + overdueCount} Pending Schedules
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Schedule</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'scheduled', 'overdue', 'completed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
              filterStatus === status
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {status} ({
              status === 'all'
                ? schedules.length
                : status === 'scheduled'
                ? pendingCount
                : status === 'overdue'
                ? overdueCount
                : completedCount
            })
          </button>
        ))}
      </div>

      {/* Health Schedules List */}
      <div className="space-y-2.5">
        {filtered.map(item => {
          const matchedCoop = coops.find(c => c.id === item.coopId);
          const isDone = item.status === 'completed';
          const isOverdue = item.status === 'overdue';

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {item.type}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Target: <strong>{matchedCoop ? `${matchedCoop.code} (${matchedCoop.name})` : 'All Farm Coops'}</strong> · Date: {item.scheduledDate}
                  </div>
                </div>

                <div>
                  {isDone ? (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  ) : isOverdue ? (
                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Scheduled
                    </span>
                  )}
                </div>
              </div>

              {/* Dosage and Details */}
              <div className="my-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs">
                <span className="text-slate-500">Dosage: </span>
                <strong className="text-slate-800 dark:text-slate-200">{item.dosage}</strong>
                {item.notes && (
                  <div className="text-[11px] text-slate-500 mt-1 italic">
                    "{item.notes}"
                  </div>
                )}
                {isDone && item.administeredBy && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Completed by {item.administeredBy} on {item.completedDate}
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-red-500 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>

                {!isDone && (
                  <button
                    onClick={() => handleMarkCompleted(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Administered</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                <span>New Health Schedule</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-3 mt-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Schedule Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. VitaStress Morning Booster"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Treatment Type
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                  >
                    <option value="vitamin">Vitamin / Supplement</option>
                    <option value="vaccine">Vaccine (AI/ND)</option>
                    <option value="deworming">Deworming</option>
                    <option value="antibiotic">Antibiotic</option>
                    <option value="disinfection">Coop Spray / Sanitation</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Coop
                  </label>
                  <select
                    value={coopId}
                    onChange={e => setCoopId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Coops (Entire Flock)</option>
                    {coops.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Dosage & Method
                </label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  placeholder="e.g. 5g per 10L water or injection 0.5ml"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes & Veterinary Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Administer early morning before sunlight heat..."
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
