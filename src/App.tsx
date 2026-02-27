/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ChevronDown, 
  Info, 
  Send, 
  MessageCircle, 
  CheckCircle2, 
  Copy, 
  ArrowLeft,
  Clock,
  Zap,
  ShieldCheck,
  TrendingUp,
  Facebook,
  Settings,
  Trash2,
  ExternalLink,
  Users,
  RefreshCw,
  Wallet,
  History,
  Headphones,
  User,
  LogOut,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@supabase/supabase-js';

// Supabase Client
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://deqbjwcgpjnlkafucbxr.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcWJqd2NncGpubGthZnVjYnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjUwMTMsImV4cCI6MjA4NzcwMTAxM30.zNQpwRS3vTkLuvURxWELB4bHynrP7OajfG69QO6B1ZMZM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
interface ApiService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

interface Service {
  id: string;
  name: string;
  ratePer1000: number;
  min: number;
  max: number;
  description: string[];
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  services: Service[];
}

interface Order {
  id: string;
  category: string;
  service: string;
  link: string;
  quantity: number;
  charge: number;
  transactionId: string;
  status: string;
  createdAt: string;
}

interface PaymentRecord {
  id: string;
  method: 'nagad' | 'bkash';
  amount: number;
  transactionId: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

interface UserData {
  userId: string;
  email: string;
  name: string;
  balance: number;
}

const USD_TO_BDT = 120;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [view, setView] = useState<'user' | 'admin'>('user');
  const [adminTab, setAdminTab] = useState<'orders' | 'users'>('orders');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
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
  
  const paymentNumbers = {
    nagad: '01792157184',
    bkash: '01753567152'
  };
  
  // Admin State
  const [orders, setOrders] = useState<Order[]>([]);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch Services and Balance
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch Balance
        const balanceRes = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'balance' })
        });
        
        if (!balanceRes.ok) {
          throw new Error(`HTTP error! status: ${balanceRes.status}`);
        }
        
        const balanceData = await balanceRes.json();
        if (balanceData.balance) {
          const bdtBalance = parseFloat(balanceData.balance) * USD_TO_BDT;
          setBalance(bdtBalance.toFixed(2));
        }

        // Fetch Services
        const servicesRes = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'services' })
        });
        
        if (!servicesRes.ok) {
          throw new Error(`HTTP error! status: ${servicesRes.status}`);
        }
        
        const servicesData: any = await servicesRes.json();
        
        if (servicesData.error) {
          console.error("MotherPanel API Error:", servicesData.error);
          alert(`MotherPanel API Error: ${servicesData.error}\nPlease check your MOTHER_PANEL_API_KEY.`);
          return;
        }

        if (!Array.isArray(servicesData)) {
          console.error("Unexpected API response format:", servicesData);
          return;
        }

        // Group by Category
        const grouped: { [key: string]: Category } = {};
        servicesData.forEach((svc: ApiService) => {
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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAndSetProfile = async (user: any) => {
      let { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profile) {
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            user_id: `TUBD-${randomId}`,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            balance: 0
          }])
          .select()
          .single();
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
          alert("Database error: Please make sure you have created the 'profiles' table in Supabase SQL Editor.");
        }
        
        if (!insertError && newProfile) {
          profile = newProfile;
        }
      }

      if (profile) {
        setCurrentUser({
          userId: profile.user_id,
          email: user.email!,
          name: profile.full_name,
          balance: profile.balance
        });
        setIsLoggedIn(true);
      } else {
        // Fallback if profile creation fails but user is authenticated
        setCurrentUser({
          userId: `TUBD-TEMP`,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          balance: 0
        });
        setIsLoggedIn(true);
      }
    };

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchAndSetProfile(session.user);
      } else {
        // Auto-login logic
        let localEmail = localStorage.getItem('tubd_email');
        let localPass = localStorage.getItem('tubd_pass');
        
        if (!localEmail || !localPass) {
          localEmail = `guest_${Date.now()}@topupbd.com`;
          localPass = `pass_${Math.random().toString(36).slice(-8)}`;
          localStorage.setItem('tubd_email', localEmail);
          localStorage.setItem('tubd_pass', localPass);
          
          const { data, error } = await supabase.auth.signUp({ 
            email: localEmail, 
            password: localPass,
            options: { data: { full_name: 'Guest User' } }
          });
          
          if (data.user) {
            await fetchAndSetProfile(data.user);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ 
            email: localEmail, 
            password: localPass 
          });
          if (data.user) {
            await fetchAndSetProfile(data.user);
          } else {
            // If login fails, clear and retry
            localStorage.removeItem('tubd_email');
            localStorage.removeItem('tubd_pass');
            checkUser();
            return;
          }
        }
      }
      
      // Fetch all users for admin
      const { data: users } = await supabase
        .from('profiles')
        .select('*');
      
      if (users) {
        setAllUsers(users.map(u => ({
          userId: u.user_id,
          email: u.email,
          name: u.full_name,
          balance: u.balance
        })));
      }
      setIsLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchAndSetProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authName,
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          if (authData.session) {
            alert("Account created successfully!");
          } else {
            // Even if session is null initially, if email confirmation is off, 
            // we can try to sign in immediately to get the session
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: authEmail,
              password: authPassword,
            });
            
            if (loginError) {
              alert("Account created! Please check your email for verification link.");
            } else {
              alert("Account created successfully!");
            }
          }
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (loginError) throw loginError;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = categories.find(c => c.id === e.target.value);
    if (cat) {
      setSelectedCategory(cat);
      setSelectedService(cat.services[0]);
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const svc = selectedCategory?.services.find(s => s.id === e.target.value);
    if (svc) setSelectedService(svc);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link || !quantity || !selectedService || parseInt(quantity) < selectedService.min) return;
    setStep('payment');
  };

  const handleVerify = async () => {
    if (!transactionId || !selectedService) return;
    setIsVerifying(true);
    try {
      // Submit Order to API
      const orderRes = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          service: selectedService.id,
          link: link,
          quantity: quantity
        })
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
        setActiveTab('orders'); // Navigate to orders after success
      } else {
        alert("Error placing order: " + (orderData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Verification Error:", error);
      alert("Failed to verify transaction. Please try again.");
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
      alert("Fund request submitted! It will be added after verification.");
      setFundAmount('');
      setFundTransactionId('');
      setFundStep('amount');
      setIsFunding(false);
    }, 2000);
  };

  // Hidden Admin Access
  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      setView(prev => prev === 'user' ? 'admin' : 'user');
    }, 2000); // 2 seconds long press
  };

  const stopLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
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
      } else if (data.error) {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
    }
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const copyToClipboard = (text: string | number) => {
    navigator.clipboard.writeText(text.toString());
  };

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-slate-800 p-6 rounded-3xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-slate-400">Manage all incoming orders</p>
              </div>
            </div>
            <button 
              onClick={() => setView('user')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold transition-colors"
            >
              Exit Admin
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Orders</p>
              <p className="text-3xl font-black">{orders.length}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Users</p>
              <p className="text-3xl font-black text-indigo-500">{allUsers.length}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Pending</p>
              <p className="text-3xl font-black text-amber-500">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Revenue</p>
              <p className="text-3xl font-black text-emerald-500">৳{orders.reduce((acc, o) => acc + o.charge, 0).toFixed(0)}</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
            <div className="p-2 border-b border-slate-700 flex">
              <button 
                onClick={() => setAdminTab('orders')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${adminTab === 'orders' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <History className="w-4 h-4" /> Orders
              </button>
              <button 
                onClick={() => setAdminTab('users')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${adminTab === 'users' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Users className="w-4 h-4" /> Users
              </button>
            </div>

            {adminTab === 'orders' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-700/50 text-xs uppercase font-bold text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Link</th>
                      <th className="px-6 py-4">Charge</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No orders found</td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-mono text-xs font-bold">{order.id}</p>
                            <p className="text-[10px] text-slate-500">{order.createdAt}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold truncate max-w-[150px]">{order.service}</p>
                            <p className="text-xs text-slate-400">Qty: {order.quantity}</p>
                          </td>
                          <td className="px-6 py-4">
                            <a href={order.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 text-xs">
                              Visit <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-500">৳{order.charge.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                              order.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                              order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                              order.status === 'processing' || order.status === 'in progress' ? 'bg-indigo-500/20 text-indigo-500' :
                              'bg-rose-500/20 text-rose-500'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => refreshOrderStatus(order.id)}
                                className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-lg transition-all"
                                title="Refresh Status"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteOrder(order.id)}
                                className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border-b border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Search User by ID, Name or Email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-700/50 text-xs uppercase font-bold text-slate-400">
                      <tr>
                        <th className="px-6 py-4">User ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {allUsers.filter(u => 
                        u.userId.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No users found</td>
                        </tr>
                      ) : (
                        allUsers.filter(u => 
                          u.userId.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                        ).map(user => (
                          <tr key={user.userId} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-mono text-xs font-bold text-indigo-400">{user.userId}</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-sm">{user.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                            <td className="px-6 py-4 font-bold text-emerald-500">৳{user.balance.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Received!</h2>
          <p className="text-slate-600 mb-8">Your transaction ID <span className="font-mono font-bold">{transactionId}</span> has been verified. Your service will start shortly.</p>
          <button 
            onClick={() => {
              setStep('form');
              setIsSuccess(false);
              setLink('');
              setQuantity('');
              setTransactionId('');
            }}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isLoggedIn) {
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onMouseDown={startLongPress}
            onMouseUp={stopLongPress}
            onMouseLeave={stopLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={stopLongPress}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Top Up BD</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Balance</span>
              <span className="text-sm font-bold text-emerald-600">৳ {parseFloat(balance).toFixed(2)}</span>
            </div>
            <div 
              onClick={() => setActiveTab('account')}
              className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors overflow-hidden"
            >
              <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 pb-24">
        {activeTab === 'new-order' && (
          <>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Loading services...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No services available at the moment.</p>
              </div>
            ) : (
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
                      <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        Category
                      </label>
                      <div className="relative">
                        <select 
                          value={selectedCategory?.id || ''}
                          onChange={handleCategoryChange}
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
                          onChange={handleServiceChange}
                          className="w-full bg-white border border-slate-200 rounded-2xl p-4 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        >
                          {selectedCategory?.services.map(svc => (
                            <option key={svc.id} value={svc.id}>{svc.name}</option>
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
                    <form onSubmit={handleSubmitOrder} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-600">Link</label>
                        <input 
                          type="url"
                          placeholder="https://www.facebook.com/username"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
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
                          onChange={(e) => setQuantity(e.target.value)}
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
                      onClick={() => setStep('form')}
                      className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Order
                    </button>

                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
                      {/* Nagad Header */}
                      <div className="bg-slate-50 p-6 flex flex-col items-center border-b border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 p-2">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" alt="Nagad" className="w-full object-contain" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Top Up BD Payment</h2>
                        <div className="mt-4 text-3xl font-black text-indigo-600">
                          ৳ {charge.toFixed(2)} BDT
                        </div>
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
                                  onClick={() => copyToClipboard(paymentNumbers.nagad)}
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
                                onClick={() => copyToClipboard(charge.toFixed(2))}
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
                              onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                            />
                          </div>
                          <button 
                            onClick={handleVerify}
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </>
        )}

        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Order History</h2>
              <button 
                onClick={() => {
                  orders.forEach(o => refreshOrderStatus(o.id));
                }}
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
                  onClick={() => setActiveTab('new-order')}
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
                      <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'add-funds' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold text-slate-900">Add Funds</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setPaymentMethod('nagad');
                  setFundStep('amount');
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
                  setPaymentMethod('bkash');
                  setFundStep('amount');
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
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-lg"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Note: ৳12 surcharge will be added to your payment.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (parseFloat(fundAmount) >= 20) setFundStep('verify');
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
                    onClick={() => setFundStep('amount')}
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
                            onClick={() => copyToClipboard(paymentNumbers[paymentMethod])}
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
                        onChange={(e) => setFundTransactionId(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                      />
                    </div>
                    <button 
                      onClick={handleAddFunds}
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
        )}

        {activeTab === 'support' && (
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
        )}

        {activeTab === 'account' && (
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
                onClick={handleLogout}
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
        )}
      </main>

      {/* Floating Action Buttons (Removed as requested, moved to Support tab) */}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around z-10">
        <button 
          onClick={() => setActiveTab('new-order')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'new-order' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">New Order</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'orders' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <History className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
        </button>
        <button 
          onClick={() => setActiveTab('add-funds')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'add-funds' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Add Funds</span>
        </button>
        <button 
          onClick={() => setActiveTab('support')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'support' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Headphones className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Support</span>
        </button>
      </nav>
    </div>
  );
}
