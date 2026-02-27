import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  Facebook, 
  Zap 
} from 'lucide-react';
import { motion } from 'motion/react';
import { createClient } from '@supabase/supabase-js';

// Types & Constants
import { Category, Service, Order, PaymentRecord, UserData, ApiService } from './types';
import { USD_TO_BDT } from './constants';

// Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NewOrder } from './components/NewOrder';
import { OrderHistory } from './components/OrderHistory';
import { AddFunds } from './components/AddFunds';
import { Support } from './components/Support';
import { Account } from './components/Account';
import { AuthModal } from './components/AuthModal';

// Supabase Client
const supabaseUrl = 'https://deqbjwcgpjnlkafucbxr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcWJqd2NncGpubGthZnVjYnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjUwMTMsImV4cCI6MjA4NzcwMTAxM30.zNQpwRS3vTkLuvURxWELB4bHynrP7OajfG69QO6B1ZM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState<'new-order' | 'orders' | 'add-funds' | 'support' | 'account'>('new-order');
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [charge, setCharge] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [balance, setBalance] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'nagad' | 'bkash'>('nagad');
  const [fundAmount, setFundAmount] = useState('');
  const [fundTransactionId, setFundTransactionId] = useState('');
  const [isFunding, setIsFunding] = useState(false);
  const [fundStep, setFundStep] = useState<'amount' | 'verify'>('amount');
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch Services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dummyServices = [
          { category: 'Facebook Services', service: 1, name: 'Facebook Page Likes', rate: '0.50', min: '100', max: '10000', type: 'Default', refill: true, cancel: false },
          { category: 'Facebook Services', service: 2, name: 'Facebook Post Likes', rate: '0.10', min: '100', max: '50000', type: 'Default', refill: false, cancel: false },
          { category: 'Facebook Services', service: 6, name: 'Facebook Video Views', rate: '0.05', min: '500', max: '100000', type: 'Default', refill: false, cancel: false },
          { category: 'TikTok Services', service: 3, name: 'TikTok Views', rate: '0.01', min: '1000', max: '1000000', type: 'Default', refill: false, cancel: false },
          { category: 'TikTok Services', service: 4, name: 'TikTok Followers', rate: '1.20', min: '100', max: '10000', type: 'Default', refill: true, cancel: false },
          { category: 'TikTok Services', service: 7, name: 'TikTok Likes', rate: '0.30', min: '100', max: '50000', type: 'Default', refill: false, cancel: false },
          { category: 'Instagram Services', service: 5, name: 'Instagram Followers', rate: '0.80', min: '100', max: '50000', type: 'Default', refill: true, cancel: true },
          { category: 'Instagram Services', service: 8, name: 'Instagram Likes', rate: '0.15', min: '100', max: '50000', type: 'Default', refill: false, cancel: false },
          { category: 'YouTube Services', service: 9, name: 'YouTube Subscribers', rate: '2.50', min: '100', max: '5000', type: 'Default', refill: true, cancel: true },
          { category: 'YouTube Services', service: 10, name: 'YouTube Views', rate: '0.40', min: '1000', max: '100000', type: 'Default', refill: false, cancel: false },
        ];
        processServices(dummyServices);
        setBalance('0.00');
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const processServices = (data: any[]) => {
      const grouped: { [key: string]: Category } = {};
      data.forEach((svc: ApiService) => {
        if (!grouped[svc.category]) {
          const isFB = svc.category.toLowerCase().includes('facebook');
          const isTT = svc.category.toLowerCase().includes('tiktok');
          grouped[svc.category] = {
            id: svc.category,
            name: svc.category,
            icon: isFB ? <Facebook className="w-4 h-4" /> : isTT ? <TrendingUp className="w-4 h-4" /> : <Zap className="w-4 h-4" />,
            services: []
          };
        }
        grouped[svc.category].services.push({
          id: svc.service.toString(),
          name: svc.name,
          ratePer1000: (parseFloat(svc.rate) * USD_TO_BDT) + 5,
          min: parseInt(svc.min),
          max: parseInt(svc.max),
          description: [
            `Type: ${svc.type}`,
            `Refill: ${svc.refill ? 'Yes' : 'No'}`,
            `Cancel: ${svc.cancel ? 'Yes' : 'No'}`,
            `Rate: ৳${((parseFloat(svc.rate) * USD_TO_BDT) + 5).toFixed(2)} per 1000`
          ]
        });
      });

      const catList = Object.values(grouped);
      setCategories(catList);
      if (catList.length > 0) {
        setSelectedCategory(catList[0]);
        setSelectedService(catList[0].services[0]);
      }
    };

    fetchData();
  }, []);

  // Auth Effects
  useEffect(() => {
    const fetchAndSetProfile = async (user: any) => {
      let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!profile) {
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const { data: newProfile } = await supabase.from('profiles').insert([{ 
          id: user.id,
          user_id: `TUBD-${randomId}`,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          balance: 0
        }]).select().single();
        if (newProfile) profile = newProfile;
      }

      if (profile) {
        setCurrentUser({
          userId: profile.user_id,
          email: user.email!,
          name: profile.full_name,
          balance: profile.balance
        });
        setIsLoggedIn(true);
      }
    };

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await fetchAndSetProfile(session.user);
      setIsLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchAndSetProfile(session.user);
        setShowAuthModal(false);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: authName } }
        });
        if (error) throw error;
        if (data.user && !data.session) {
          alert("Account created! Please login.");
          setAuthMode('login');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        setShowAuthModal(false);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleTabChange = (tab: any) => {
    if (!isLoggedIn && (tab === 'add-funds' || tab === 'account' || tab === 'orders')) {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    if (selectedService && quantity) {
      const qty = parseInt(quantity) || 0;
      const calculatedCharge = (qty / 1000) * selectedService.ratePer1000;
      setCharge(calculatedCharge + 5);
    } else {
      setCharge(0);
    }
  }, [quantity, selectedService]);

  const handleVerify = async () => {
    if (!transactionId || !selectedService) return;
    setIsVerifying(true);
    try {
      const orderRes = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', service: selectedService.id, link, quantity })
      });
      const orderData = await orderRes.json();
      if (orderData.order) {
        const newOrder: Order = {
          id: orderData.order.toString(),
          category: selectedCategory?.name || '',
          service: selectedService.name,
          link,
          quantity: parseInt(quantity),
          charge,
          transactionId,
          status: 'pending',
          createdAt: new Date().toLocaleString()
        };
        setOrders(prev => [newOrder, ...prev]);
        setIsSuccess(true);
        setActiveTab('orders');
      } else {
        alert("Error: " + (orderData.error || "Unknown error"));
      }
    } catch (error) {
      alert("Failed to verify transaction.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddFunds = () => {
    if (!fundAmount || !fundTransactionId) return;
    setIsFunding(true);
    setTimeout(() => {
      const newPayment: PaymentRecord = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        method: paymentMethod,
        amount: parseFloat(fundAmount),
        transactionId: fundTransactionId,
        status: 'pending',
        createdAt: new Date().toLocaleString()
      };
      setPaymentHistory(prev => [newPayment, ...prev]);
      alert("Fund request submitted!");
      setFundAmount('');
      setFundTransactionId('');
      setFundStep('amount');
      setIsFunding(false);
    }, 2000);
  };

  const refreshOrderStatus = async (id: string) => {
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', order: id })
      });
      const data = await res.json();
      if (data.status) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: data.status.toLowerCase() } : o));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Received!</h2>
          <p className="text-slate-600 mb-8">Your transaction ID <span className="font-mono font-bold">{transactionId}</span> has been verified.</p>
          <button onClick={() => { setStep('form'); setIsSuccess(false); setLink(''); setQuantity(''); setTransactionId(''); }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 font-bold animate-pulse">Loading Top Up BD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header 
        isLoggedIn={isLoggedIn} 
        balance={balance} 
        onTabChange={handleTabChange} 
        onShowAuth={() => setShowAuthModal(true)} 
      />

      <main className="max-w-lg mx-auto p-4 pb-24">
        {activeTab === 'new-order' && (
          <NewOrder 
            isLoading={isLoading}
            categories={categories}
            selectedCategory={selectedCategory}
            selectedService={selectedService}
            link={link}
            quantity={quantity}
            charge={charge}
            transactionId={transactionId}
            isVerifying={isVerifying}
            step={step}
            onCategoryChange={(e) => {
              const cat = categories.find(c => c.id === e.target.value);
              if (cat) { setSelectedCategory(cat); setSelectedService(cat.services[0]); }
            }}
            onServiceChange={(e) => {
              const svc = selectedCategory?.services.find(s => s.id === e.target.value);
              if (svc) setSelectedService(svc);
            }}
            onLinkChange={setLink}
            onQuantityChange={setQuantity}
            onTransactionIdChange={setTransactionId}
            onSubmitOrder={(e) => {
              e.preventDefault();
              if (!isLoggedIn) { setShowAuthModal(true); return; }
              if (!link || !quantity || !selectedService || parseInt(quantity) < selectedService.min) return;
              setStep('payment');
            }}
            onVerify={handleVerify}
            onSetStep={setStep}
            onCopy={(text) => navigator.clipboard.writeText(text.toString())}
          />
        )}

        {activeTab === 'orders' && (
          <OrderHistory 
            orders={orders} 
            onRefresh={refreshOrderStatus} 
            onRefreshAll={() => orders.forEach(o => refreshOrderStatus(o.id))}
            onNewOrder={() => setActiveTab('new-order')}
          />
        )}

        {activeTab === 'add-funds' && (
          <AddFunds 
            paymentMethod={paymentMethod}
            fundStep={fundStep}
            fundAmount={fundAmount}
            fundTransactionId={fundTransactionId}
            isFunding={isFunding}
            paymentHistory={paymentHistory}
            onSetPaymentMethod={setPaymentMethod}
            onSetFundStep={setFundStep}
            onFundAmountChange={setFundAmount}
            onFundTransactionIdChange={setFundTransactionId}
            onAddFunds={handleAddFunds}
            onCopy={(text) => navigator.clipboard.writeText(text.toString())}
          />
        )}

        {activeTab === 'support' && <Support />}

        {activeTab === 'account' && (
          <Account 
            currentUser={currentUser} 
            balance={balance} 
            orders={orders} 
            onLogout={handleLogout} 
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <AuthModal 
        show={showAuthModal}
        mode={authMode}
        email={authEmail}
        password={authPassword}
        name={authName}
        showPassword={showPassword}
        isLoading={isAuthLoading}
        onClose={() => setShowAuthModal(false)}
        onModeChange={setAuthMode}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onNameChange={setAuthName}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onSubmit={handleAuth}
      />
    </div>
  );
}
