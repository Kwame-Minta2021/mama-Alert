import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Mail, Lock, Phone, Hospital, AlertCircle, RefreshCw } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [clinic, setClinic] = useState('');
  const [role, setRole] = useState('Midwife/Nurse');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !clinic || !role) {
      return setError('Please fill in all fields.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    try {
      setError('');
      setLoading(true);
      await register(email, password, name, role, clinic, phone);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to register account. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main card */}
      <div className="w-full max-w-lg bg-white/95 rounded-2xl shadow-2xl p-8 border border-slate-100 relative z-10 glass-effect">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-green flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-purple/20 mb-3">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Register Staff</h2>
          <p className="text-slate-400 text-xs mt-1">Create MamaAlert Care Coordinator Account</p>
        </div>

        {/* Errors */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg flex items-start gap-2.5 mb-4 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Joyce Osei"
                  className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-purple"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nurse@mamaalert.org"
                  className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-purple"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-purple"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Facility / Clinic
              </label>
              <div className="relative">
                <Hospital className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                  placeholder="Kuntanase CHPS Compound"
                  className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-purple"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-purple"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-purple h-[38px]"
              >
                <option value="Midwife/Nurse">Midwife / Nurse</option>
                <option value="Clinic Administrator">Clinic Administrator</option>
                <option value="District Health Supervisor">District Health Supervisor</option>
                <option value="System Admin">System Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-purple to-brand-purple-dark text-white font-bold py-3 rounded-xl text-xs shadow-lg hover:shadow-brand-purple/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <span>Create Staff Account</span>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 font-medium">
          <span>Already have an account? </span>
          <Link to="/login" className="text-brand-purple font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
