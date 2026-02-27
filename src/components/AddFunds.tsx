import React from 'react';
import { motion } from 'motion/react';
import { History, ArrowLeft, Copy } from 'lucide-react';
import { PaymentRecord } from '../types';
import { paymentNumbers } from '../constants';

interface AddFundsProps {
  paymentMethod: 'nagad' | 'bkash';
  fundStep: 'amount' | 'verify';
  fundAmount: string;
  fundTransactionId: string;
  isFunding: boolean;
  paymentHistory: PaymentRecord[];
  onSetPaymentMethod: (method: 'nagad' | 'bkash') => void;
  onSetFundStep: (step: 'amount' | 'verify') => void;
  onFundAmountChange: (val: string) => void;
  onFundTransactionIdChange: (val: string) => void;
  onAddFunds: () => void;
  onCopy: (text: string | number) => void;
}

export const AddFunds: React.FC<AddFundsProps> = ({
  paymentMethod,
  fundStep,
  fundAmount,
  fundTransactionId,
  isFunding,
  paymentHistory,
  onSetPaymentMethod,
  onSetFundStep,
  onFundAmountChange,
  onFundTransactionIdChange,
  onAddFunds,
  onCopy
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-slate-900">Add Funds</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => {
            onSetPaymentMethod('nagad');
            onSetFundStep('amount');
          }}
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
        >
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" alt="Nagad" className="w-full object-contain" />
          </div>
          <span className={`text-xs font-bold ${paymentMethod === 'nagad' ? 'text-orange-600' : 'text-slate-500'}`}>Nagad</span>
        </button>
        <button 
          onClick={() => {
            onSetPaymentMethod('bkash');
            onSetFundStep('amount');
          }}
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
        >
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BKash_Logo.svg/1200px-BKash_Logo.svg.png" alt="Bkash" className="w-full object-contain" />
          </div>
          <span className={`text-xs font-bold ${paymentMethod === 'bkash' ? 'text-pink-600' : 'text-slate-500'}`}>Bkash</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
        {fundStep === 'amount' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Enter Amount (BDT)</label>
              <input 
                type="number"
                placeholder="Min: 20 BDT"
                value={fundAmount}
                onChange={(e) => onFundAmountChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-lg"
              />
              <p className="text-[10px] text-slate-400 font-medium">Note: ৳12 surcharge will be added to your payment.</p>
            </div>
            <button 
              onClick={() => {
                if (parseFloat(fundAmount) >= 20) onSetFundStep('verify');
                else alert("Minimum amount is 20 BDT");
              }}
              disabled={!fundAmount}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 ${paymentMethod === 'nagad' ? 'bg-orange-600 text-white shadow-orange-200 hover:bg-orange-700' : 'bg-pink-600 text-white shadow-pink-200 hover:bg-pink-700'}`}
            >
              Next Step
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <button 
              onClick={() => onSetFundStep('amount')}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Change Amount
            </button>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${paymentMethod === 'nagad' ? 'bg-orange-100 text-orange-600' : 'bg-pink-100 text-pink-600'}`}>1</div>
                <p className="text-sm text-slate-600 leading-relaxed">আপনার <span className="font-bold text-slate-900 uppercase">{paymentMethod}</span> অ্যাপে যান এবং <span className="font-bold text-slate-900">Send Money</span> করুন।</p>
              </div>
              <div className="flex items-start gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${paymentMethod === 'nagad' ? 'bg-orange-100 text-orange-600' : 'bg-pink-100 text-pink-600'}`}>2</div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-slate-600">এই নম্বরে টাকা পাঠানঃ</p>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="font-mono font-bold text-slate-900">{paymentNumbers[paymentMethod]}</span>
                    <button 
                      onClick={() => onCopy(paymentNumbers[paymentMethod])}
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors ${paymentMethod === 'nagad' ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-pink-600 bg-pink-50 hover:bg-pink-100'}`}
                    >
                      <Copy className="w-3 h-3" /> কপি
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${paymentMethod === 'nagad' ? 'bg-orange-100 text-orange-600' : 'bg-pink-100 text-pink-600'}`}>3</div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600 leading-relaxed">টাকার পরিমাণ (Surcharge সহ):</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">৳ {parseFloat(fundAmount) + 12} BDT</p>
                  <p className="text-[10px] text-slate-400 mt-1">আপনার ব্যালেন্সে ৳{fundAmount} যোগ হবে।</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Transaction ID</label>
                <input 
                  type="text"
                  placeholder="8N7X6W5V4U"
                  value={fundTransactionId}
                  onChange={(e) => onFundTransactionIdChange(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                />
              </div>
              <button 
                onClick={onAddFunds}
                disabled={!fundTransactionId || isFunding}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${paymentMethod === 'nagad' ? 'bg-orange-600 text-white shadow-orange-200 hover:bg-orange-700' : 'bg-pink-600 text-white shadow-pink-200 hover:bg-pink-700'}`}
              >
                {isFunding ? 'Processing...' : 'Verify Payment'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Payment History (Last 7 Days)</h3>
          <History className="w-4 h-4 text-slate-400" />
        </div>
        
        {paymentHistory.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
            <p className="text-sm text-slate-400">No payment history found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentHistory.map(payment => (
              <div key={payment.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 ${payment.method === 'nagad' ? 'bg-orange-50' : 'bg-pink-50'}`}>
                    <img 
                      src={payment.method === 'nagad' ? "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" : "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BKash_Logo.svg/1200px-BKash_Logo.svg.png"} 
                      alt={payment.method} 
                      className="w-full object-contain" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">৳{payment.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{payment.transactionId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                    payment.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    payment.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {payment.status}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1">{payment.createdAt.split(',')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
