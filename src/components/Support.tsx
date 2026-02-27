import React from 'react';
import { motion } from 'motion/react';
import { Headphones, Send, MessageCircle } from 'lucide-react';

export const Support: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-slate-900">Support Center</h2>
      
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
          <Headphones className="w-10 h-10 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Need Help?</h3>
          <p className="text-slate-500 text-sm">Our team is available 24/7 to assist you with your orders or payments.</p>
        </div>
        
        <div className="space-y-3">
          <a 
            href="https://t.me/topupbd1103" 
            target="_blank" 
            rel="noreferrer"
            className="w-full bg-[#229ED9] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Send className="w-5 h-5" /> Contact on Telegram
          </a>
          <a 
            href="https://chat.whatsapp.com/CtoQA0FhBNXCjDYlzpI1xr?mode=gi_t" 
            target="_blank" 
            rel="noreferrer"
            className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5" /> Join WhatsApp Group
          </a>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-3xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Join Community</p>
          <p className="text-lg font-bold">Get latest updates</p>
        </div>
        <a 
          href="https://t.me/topupbd1103" 
          target="_blank" 
          rel="noreferrer"
          className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm"
        >
          Join Now
        </a>
      </div>
    </motion.div>
  );
};
