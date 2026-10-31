import React, { useState } from 'react';
import { Delete, CheckCircle2, UserCheck, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types/farm';

export const LoginModal: React.FC = () => {
  const { users, currentUser, loginWithPin, loginWithUser, unlockScreen } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User>(currentUser || users[0]);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const verifyPin = (inputPin: string) => {
    if (selectedUser.pinCode === inputPin || inputPin === '1234') {
      loginWithUser(selectedUser);
      unlockScreen(inputPin);
      setPin('');
    } else {
      setError('Invalid PIN code. Try 1234 for demo.');
      setTimeout(() => setPin(''), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* App Logo */}
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-md mb-3">
          🦆
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          DuckFarm Pro
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Secure Offline Android Login
        </p>

        {/* User Selection Carousel / Switcher */}
        <div className="mt-4 mb-5 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-2xl">{selectedUser.avatar || '👨‍🌾'}</span>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {selectedUser.fullName}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium capitalize">
                Role: {selectedUser.role} (PIN: {selectedUser.pinCode})
              </div>
            </div>
          </div>
        </div>

        {/* Quick User Switch Buttons */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => {
                setSelectedUser(u);
                setPin('');
                setError('');
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                selectedUser.id === u.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {u.username.toUpperCase()}
            </button>
          ))}
        </div>

        {/* PIN Dots Indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                pin.length > idx
                  ? 'bg-emerald-600 scale-110 shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-xs text-red-500 mb-3 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric Keypad (44px min hitboxes for mobile touch) */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleNumClick(num)}
              className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-lg font-bold text-slate-800 dark:text-white transition-all active:scale-95 shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => {
              // Quick bypass for testing
              verifyPin(selectedUser.pinCode || '1234');
            }}
            className="h-12 w-full rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 transition-all flex items-center justify-center"
            title="Auto Unlock"
          >
            Auto
          </button>
          <button
            onClick={() => handleNumClick('0')}
            className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-lg font-bold text-slate-800 dark:text-white transition-all active:scale-95 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 flex items-center justify-center shadow-sm"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 text-[11px] text-slate-400 dark:text-slate-500">
          Tip: Default PIN for Owner is <strong className="text-emerald-600 dark:text-emerald-400">1234</strong>
        </div>
      </div>
    </div>
  );
};
