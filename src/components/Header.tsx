import React from 'react';
import { TrendingUp } from 'lucide-react';
import { UserData } from '../types';

interface HeaderProps {
  isLoggedIn: boolean;
  balance: string;
  onTabChange: (tab: any) => void;
  onShowAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, balance, onTabChange, onShowAuth }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Top Up BD</h1>
        </div>
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <button 
              onClick={onShowAuth}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Login
            </button>
          ) : (
            <>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Balance</span>
                <span className="text-sm font-bold text-emerald-600">৳ {parseFloat(balance).toFixed(2)}</span>
              </div>
              <div 
                onClick={() => onTabChange('account')}
                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors overflow-hidden"
              >
                <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
