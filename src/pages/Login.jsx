import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, AlertCircle, RefreshCw } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password.');
    }
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 border border-slate-100 relative z-10 glass-effect">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-green flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-purple/20 mb-4 animate-pulse-slow">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">MamaAlert 2.0</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Smart Maternal & Neonatal Emergency Monitor</p>
        </div>

        {/* Errors */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg flex items-start gap-2.5 mb-5 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nurse@mamaalert.org"
                className="w-full bg-slate-50 text-slate-800 text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-purple transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Access Code / Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-[11px] font-semibold text-brand-purple hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 text-slate-800 text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-purple transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-purple to-brand-purple-dark text-white font-bold py-3.5 rounded-xl text-sm shadow-lg hover:shadow-brand-purple/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <span>Access Care Portal</span>
            )}
          </button>
        </form>

        {/* Demo Fast Login Tray */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="text-center mb-3">
            <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 px-2 py-1 bg-slate-50 rounded">
              IEEE WIE Judge Demo Access
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Select a role (Demo Password: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">demo1234</code>)</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
            <button
              onClick={() => handleAutofill('nurse@mamaalert.org')}
              className="bg-slate-50 border border-slate-200 hover:border-brand-purple py-2 px-3 rounded-lg hover:bg-brand-purple/5 transition-all text-left truncate flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-brand-green shrink-0"></span>
              <span>Midwife/Nurse</span>
            </button>
            <button
              onClick={() => handleAutofill('admin@mamaalert.org')}
              className="bg-slate-50 border border-slate-200 hover:border-brand-purple py-2 px-3 rounded-lg hover:bg-brand-purple/5 transition-all text-left truncate flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-brand-purple shrink-0"></span>
              <span>Clinic Admin</span>
            </button>
            <button
              onClick={() => handleAutofill('supervisor@mamaalert.org')}
              className="bg-slate-50 border border-slate-200 hover:border-brand-purple py-2 px-3 rounded-lg hover:bg-brand-purple/5 transition-all text-left truncate flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span>District Supervisor</span>
            </button>
            <button
              onClick={() => handleAutofill('sysadmin@mamaalert.org')}
              className="bg-slate-50 border border-slate-200 hover:border-brand-purple py-2 px-3 rounded-lg hover:bg-brand-purple/5 transition-all text-left truncate flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-slate-800 shrink-0"></span>
              <span>Sys Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          <span>Need an account? </span>
          <Link to="/register" className="text-brand-purple font-bold hover:underline">
            Register Staff Account
          </Link>
        </div>
      </div>
    </div>
  );
}
