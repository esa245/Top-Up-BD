import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Mail, Lock, EyeOff, Eye, LogOut, UserPlus, User } from 'lucide-react';

interface AuthModalProps {
  show: boolean;
  mode: 'login' | 'signup';
  email: string;
  password: string;
  name: string;
  showPassword: boolean;
  isLoading: boolean;
  isClosable?: boolean;
  onClose: () => void;
  onModeChange: (mode: 'login' | 'signup') => void;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onNameChange: (val: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  show,
  mode,
  email,
  password,
  name,
  showPassword,
  isLoading,
  isClosable = true,
  onClose,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onTogglePassword,
  onSubmit
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative"
          >
            {isClosable && (
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {mode === 'login' ? (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200 rotate-3">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                  <p className="text-slate-500 mt-2 font-medium">Please login to continue.</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                      <button 
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? <TrendingUp className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5 rotate-180" />}
                    {isLoading ? 'Logging in...' : 'Login Now'}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-slate-500 text-sm font-medium">
                    Don't have an account?
                    <button 
                      type="button"
                      onClick={() => onModeChange('signup')}
                      className="ml-2 text-indigo-600 font-bold hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <UserPlus className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Join Top Up BD</h2>
                  <p className="text-slate-500 mt-2 font-medium">Create an account to get started.</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                      <button 
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? <TrendingUp className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-slate-500 text-sm font-medium">
                    Already have an account?
                    <button 
                      type="button"
                      onClick={() => onModeChange('login')}
                      className="ml-2 text-indigo-600 font-bold hover:underline"
                    >
                      Login Here
                    </button>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
