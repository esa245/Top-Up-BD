import React from 'react';
import { TrendingUp, History, Wallet, Headphones } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around z-10">
      <button 
        onClick={() => onTabChange('new-order')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'new-order' ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <TrendingUp className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-wider">New Order</span>
      </button>
      <button 
        onClick={() => onTabChange('orders')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'orders' ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <History className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
      </button>
      <button 
        onClick={() => onTabChange('add-funds')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'add-funds' ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <Wallet className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Add Funds</span>
      </button>
      <button 
        onClick={() => onTabChange('support')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'support' ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <Headphones className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Support</span>
      </button>
    </nav>
  );
};
