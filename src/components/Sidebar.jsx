import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  AlertTriangle, 
  Cpu, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut,
  Heart,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { logout, userProfile } = useAuth();
  const { alerts } = useLiveMonitoring();

  // Active unacknowledged alerts count
  const newAlertsCount = alerts.filter(a => a.status === 'New').length;

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Midwife/Nurse', 'Clinic Administrator', 'District Health Supervisor', 'System Admin'] },
    { name: 'Live Monitoring', path: '/live', icon: Activity, roles: ['Midwife/Nurse', 'Clinic Administrator', 'District Health Supervisor', 'System Admin'] },
    { name: 'Patients Registry', path: '/patients', icon: Users, roles: ['Midwife/Nurse', 'Clinic Administrator', 'District Health Supervisor', 'System Admin'] },
    { name: 'Emergency Alerts', path: '/alerts', icon: AlertTriangle, roles: ['Midwife/Nurse', 'Clinic Administrator', 'District Health Supervisor', 'System Admin'], badge: newAlertsCount },
    { name: 'Devices', path: '/devices', icon: Cpu, roles: ['Clinic Administrator', 'District Health Supervisor', 'System Admin'] },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['Clinic Administrator', 'District Health Supervisor', 'System Admin'] },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['Midwife/Nurse', 'Clinic Administrator', 'District Health Supervisor', 'System Admin'] },
  ];

  // Filter menu based on user role
  const userRole = userProfile?.role || 'Midwife/Nurse';
  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar aside */}
      <aside className={`bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col h-screen transition-all duration-300 z-50
        ${isOpen ? 'fixed inset-y-0 left-0 w-64 shadow-2xl md:shadow-none' : 'w-64 md:flex hidden flex-col sticky top-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-green flex items-center justify-center text-white shadow-md shadow-brand-purple/20">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight">MamaAlert</h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full">
                Care Dashboard
              </span>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-purple/10 text-brand-purple font-medium shadow-sm shadow-brand-purple/5'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-brand-purple' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-650'
                }`} />
                <span className="text-sm">{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className={`text-[11px] px-2 py-0.5 font-bold rounded-full transition-colors ${
                  isActive ? 'bg-brand-purple text-white' : 'bg-red-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Info & Log Out */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-brand-purple/10 flex items-center justify-center font-bold text-brand-purple text-sm">
            {userProfile?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{userProfile?.name || 'User'}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{userProfile?.role || 'Staff'}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  </>
  );
}
