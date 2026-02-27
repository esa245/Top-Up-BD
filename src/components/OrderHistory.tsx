import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, History } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onRefresh: (id: string) => void;
  onRefreshAll: () => void;
  onNewOrder: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onRefresh, onRefreshAll, onNewOrder }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Order History</h2>
        <button 
          onClick={onRefreshAll}
          className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No orders yet.</p>
          <button 
            onClick={onNewOrder}
            className="text-indigo-600 font-bold hover:underline"
          >
            Place your first order
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold text-slate-400">#{order.id}</span>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                  order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                  order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                  order.status === 'processing' || order.status === 'in progress' ? 'bg-indigo-500/10 text-indigo-500' :
                  'bg-rose-500/10 text-rose-500'
                }`}>
                  {order.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{order.service}</h3>
              <p className="text-xs text-slate-500 truncate mb-4">{order.link}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Quantity</p>
                    <p className="text-sm font-bold text-slate-700">{order.quantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Charge</p>
                    <p className="text-sm font-bold text-indigo-600">৳{order.charge.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                  <button 
                    onClick={() => onRefresh(order.id)}
                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
