import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, Settings, LogOut, ChevronDown } from 'lucide-react';
import { UserData, Order } from '../types';

interface AccountProps {
  currentUser: UserData | null;
  balance: string;
  orders: Order[];
  onLogout: () => void;
}

export const Account: React.FC<AccountProps> = ({ currentUser, balance, orders, onLogout }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden">
              <img src="https://picsum.photos/seed/user/200/200" alt="User" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{currentUser?.name || currentUser?.email}</h3>
            <p className="text-slate-400 text-sm font-mono font-bold">ID: {currentUser?.userId}</p>
            <p className="text-slate-400 text-[10px]">Member since Feb 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
          <div className="bg-slate-50 p-4 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Current Balance</p>
            <p className="text-xl font-black text-emerald-600">৳{parseFloat(balance).toFixed(2)}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Spent</p>
            <p className="text-xl font-black text-indigo-600">৳{orders.reduce((acc, o) => acc + o.charge, 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700">Payment History</span>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-300 -rotate-90" />
        </button>
        <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700">Settings</span>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-300 -rotate-90" />
        </button>
        <button 
          onClick={onLogout}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-rose-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-bold">Logout</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
};
