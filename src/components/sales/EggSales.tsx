import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, CheckCircle, Clock, Trash2, Printer, Search, X, FileText } from 'lucide-react';
import { db } from '../../db/offlineStorage';
import { EggSale } from '../../types/farm';

export const EggSales: React.FC = () => {
  const [sales, setSales] = useState<EggSale[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<EggSale | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState<number>(300);
  const [unit, setUnit] = useState<'pieces' | 'trays' | 'kg'>('pieces');
  const [pricePerUnit, setPricePerUnit] = useState<number>(0.18);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partial'>('paid');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'credit'>('cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    setSales(db.getEggSales());
  };

  const calculatedTotal = Number((quantity * pricePerUnit).toFixed(2));

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || quantity <= 0) return;

    const newSale: EggSale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      date,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      totalAmount: calculatedTotal,
      paymentStatus,
      paidAmount: paymentStatus === 'paid' ? calculatedTotal : 0,
      paymentMethod,
      notes,
    };

    db.saveEggSale(newSale);
    setIsModalOpen(false);
    resetForm();
    loadSales();
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setQuantity(300);
    setPricePerUnit(0.18);
    setNotes('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this sale record? Associated financial entries will also be adjusted.')) {
      db.deleteEggSale(id);
      loadSales();
    }
  };

  const filteredSales = statusFilter === 'all'
    ? sales
    : sales.filter(s => s.paymentStatus === statusFilter);

  const totalRevenue = sales.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + s.totalAmount, 0);
  const pendingAmount = sales.filter(s => s.paymentStatus === 'pending').reduce((sum, s) => sum + s.totalAmount, 0);
  const totalEggsSold = sales.reduce((sum, s) => {
    if (s.unit === 'trays') return sum + (s.quantity * 30);
    return sum + s.quantity;
  }, 0);

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Egg Sales & Invoices
          </h2>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            ${totalRevenue.toFixed(2)} <span className="text-xs font-normal text-slate-500">Collected</span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Sale</span>
        </button>
      </div>

      {/* Mini metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Eggs Sold</div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
            {totalEggsSold.toLocaleString()} eggs
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Receivables</div>
          <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
            ${pendingAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {(['all', 'paid', 'pending'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              statusFilter === status
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {status} ({status === 'all' ? sales.length : sales.filter(s => s.paymentStatus === status).length})
          </button>
        ))}
      </div>

      {/* Sales Transactions List */}
      <div className="space-y-2.5">
        {filteredSales.map(sale => {
          const isPaid = sale.paymentStatus === 'paid';
          return (
            <div
              key={sale.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {sale.customerName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {sale.invoiceNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {sale.quantity} {sale.unit} @ ${sale.pricePerUnit}/{sale.unit} · {sale.date}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${sale.totalAmount.toFixed(2)}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {isPaid ? (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> Paid ({sale.paymentMethod})
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> Unpaid
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="text-slate-400">
                  {sale.notes ? `"${sale.notes}"` : 'Direct Delivery'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveInvoice(sale)}
                    className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Invoice</span>
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="text-slate-400 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Record Egg Sale
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Customer / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Toko Berkah Telur"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+62 812..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="pieces">Pieces (Butir)</option>
                    <option value="trays">Trays (30 eggs)</option>
                    <option value="kg">Kilogram (kg)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Price/Unit ($)
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    min="0"
                    required
                    value={pricePerUnit}
                    onChange={e => setPricePerUnit(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Automatic Total Preview */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-300">Total Invoice Amount:</span>
                <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  ${calculatedTotal.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                  >
                    <option value="paid">Paid (Cash/Transfer)</option>
                    <option value="pending">Pending / Credit</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="credit">Store Credit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Sale Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Delivery / Customer Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Picked up by buyer, delivered to market..."
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
                  Record & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Receipt Viewer Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Official Farm Receipt
              </span>
              <button
                onClick={() => setActiveInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 text-center border-b border-dashed border-slate-200 dark:border-slate-700 pb-3">
              <div className="text-2xl">🦆</div>
              <div className="font-bold text-base text-slate-900 dark:text-white mt-1">DUCKFARM PRO</div>
              <div className="text-[11px] text-slate-500">Fresh Duck Farm Operations & Salted Egg Supply</div>
              <div className="text-xs font-mono font-bold mt-2 text-slate-700 dark:text-slate-300">
                {activeInvoice.invoiceNumber}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span>{activeInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <span>Fresh Duck Eggs ({activeInvoice.quantity} {activeInvoice.unit})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Price:</span>
                <span>${activeInvoice.pricePerUnit} / {activeInvoice.unit}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-sm">
                <span>TOTAL:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">${activeInvoice.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1">
                <span className="text-slate-500">Status:</span>
                <span className="uppercase font-semibold text-emerald-600">{activeInvoice.paymentStatus} ({activeInvoice.paymentMethod})</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setActiveInvoice(null)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
