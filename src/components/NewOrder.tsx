import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Info, ArrowLeft, Copy, Zap } from 'lucide-react';
import { Category, Service } from '../types';
import { paymentNumbers } from '../constants';

interface NewOrderProps {
  isLoading: boolean;
  isRealServices: boolean;
  servicesError: string | null;
  categories: Category[];
  selectedCategory: Category | null;
  selectedService: Service | null;
  link: string;
  quantity: string;
  charge: number;
  transactionId: string;
  isVerifying: boolean;
  step: 'form' | 'payment';
  userBalance: number;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onServiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onLinkChange: (val: string) => void;
  onQuantityChange: (val: string) => void;
  onTransactionIdChange: (val: string) => void;
  onSubmitOrder: (e: React.FormEvent) => void;
  onVerify: () => void;
  onSetStep: (step: 'form' | 'payment') => void;
  onCopy: (text: string | number) => void;
  onRefreshServices: () => void;
}

export const NewOrder: React.FC<NewOrderProps> = ({
  isLoading,
  isRealServices,
  servicesError,
  categories,
  selectedCategory,
  selectedService,
  link,
  quantity,
  charge,
  transactionId,
  isVerifying,
  step,
  userBalance,
  onCategoryChange,
  onServiceChange,
  onLinkChange,
  onQuantityChange,
  onTransactionIdChange,
  onSubmitOrder,
  onVerify,
  onSetStep,
  onCopy,
  onRefreshServices
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading services...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <Zap className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">No services available at the moment.</p>
      </div>
    );
  }

  const hasEnoughBalance = userBalance >= charge;

  return (
    <AnimatePresence mode="wait">
      {step === 'form' ? (
        <motion.div
          key="form"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          className="space-y-6"
        >
          {/* Category Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                Category
              </label>
              {isRealServices ? (
                <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Real Services
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  {servicesError && (
                    <span className="text-[10px] text-rose-500 font-medium" title={servicesError}>
                      API Error
                    </span>
                  )}
                  <button 
                    onClick={onRefreshServices}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Zap className="w-2.5 h-2.5" /> Load Real Services
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <select 
                value={selectedCategory?.id || ''}
                onChange={onCategoryChange}
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Service</label>
            <div className="relative">
              <select 
                value={selectedService?.id || ''}
                onChange={onServiceChange}
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              >
                {selectedCategory?.services.map(svc => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name} - ৳{svc.ratePer1000.toFixed(2)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Description Box */}
          {selectedService && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <Info className="w-4 h-4" /> Description
              </h3>
              <ul className="space-y-2">
                {selectedService.description.map((line, i) => (
                  <li key={i} className="text-xs text-indigo-800 flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-indigo-100">
                <p className="text-[10px] text-indigo-600 font-medium italic">
                  ★ Don't make multiple orders at the same time for the same link.
                </p>
              </div>
            </div>
          )}

          {/* Order Inputs */}
          <form onSubmit={onSubmitOrder} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Link</label>
              <input 
                type="url"
                placeholder="https://www.facebook.com/username"
                value={link}
                onChange={(e) => onLinkChange(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Quantity</label>
              <input 
                type="number"
                placeholder={selectedService ? `Min: ${selectedService.min} - Max: ${selectedService.max}` : "Enter quantity"}
                value={quantity}
                onChange={(e) => onQuantityChange(e.target.value)}
                min={selectedService?.min}
                max={selectedService?.max}
                required
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
              {selectedService && (
                <p className="text-[11px] text-slate-500 px-1">
                  Min: {selectedService.min.toLocaleString()} - Max: {selectedService.max.toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 flex items-center justify-between">
                Average time <Info className="w-3 h-3 text-slate-400" />
              </label>
              <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 text-slate-500 font-medium">
                ~ 1 hour 15 minutes
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Charge (BDT)</label>
              <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 text-indigo-600 font-bold text-lg">
                ৳ {charge.toFixed(2)}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Submit Order
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="payment"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="space-y-6"
        >
          <button 
            onClick={() => onSetStep('form')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Order
          </button>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
            {hasEnoughBalance ? (
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Confirm Order</h2>
                  <p className="text-slate-500 mt-2">You have sufficient balance to place this order.</p>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Order Charge:</span>
                    <span className="font-bold text-slate-900">৳{charge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Current Balance:</span>
                    <span className="font-bold text-emerald-600">৳{userBalance.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between text-lg">
                    <span className="font-bold text-slate-900">Remaining:</span>
                    <span className="font-black text-indigo-600">৳{(userBalance - charge).toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={onVerify}
                  disabled={isVerifying}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Nagad Header */}
                <div className="bg-slate-50 p-6 flex flex-col items-center border-b border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 p-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" alt="Nagad" className="w-full object-contain" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Top Up BD Payment</h2>
                  <div className="mt-4 text-3xl font-black text-indigo-600">
                    ৳ {charge.toFixed(2)} BDT
                  </div>
                  <p className="text-xs text-rose-500 font-bold mt-2">Insufficient Balance! Please pay manually.</p>
                </div>

                {/* Instructions */}
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                      <p className="text-sm text-slate-600 leading-relaxed">আপনার <span className="font-bold text-slate-900">Nagad</span> মোবাইল অ্যাপে যান।</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                      <p className="text-sm text-slate-600 leading-relaxed"><span className="font-bold text-slate-900">Send Money</span> -এ ক্লিক করুন।</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-slate-600">প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুনঃ</p>
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <span className="font-mono font-bold text-slate-900">{paymentNumbers.nagad}</span>
                          <button 
                            onClick={() => onCopy(paymentNumbers.nagad)}
                            className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Copy className="w-3 h-3" /> কপি করুন
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-slate-600">টাকার পরিমাণঃ <span className="font-bold text-slate-900">{charge.toFixed(2)} BDT</span></p>
                        <button 
                          onClick={() => onCopy(charge.toFixed(2))}
                          className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <Copy className="w-3 h-3" /> কপি করুন
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Transaction ID</label>
                      <input 
                        type="text"
                        placeholder="8N7X6W5V4U"
                        value={transactionId}
                        onChange={(e) => onTransactionIdChange(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                      />
                    </div>
                    <button 
                      onClick={onVerify}
                      disabled={!transactionId || isVerifying}
                      className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Payment'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
