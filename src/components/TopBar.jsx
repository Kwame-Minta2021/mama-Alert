import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { Volume2, VolumeX, Cloud, CloudOff, User, Sun, Moon, Menu, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TopBar({ onMenuClick, onAiClick }) {
  const { userProfile, darkMode, toggleDarkMode } = useAuth();
  const { soundEnabled, setSoundEnabled, useLocalSimulation } = useLiveMonitoring();
  const location = useLocation();

  // Get Page Title from pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Maternal & Neonatal Overview';
    if (path === '/live') return 'Live Patient Monitoring';
    if (path === '/patients') return 'Patient Registry';
    if (path === '/patients/add') return 'Register New Patient';
    if (path.startsWith('/patients/details/')) return 'Patient Case File';
    if (path === '/alerts') return 'Emergency Response Logs';
    if (path.startsWith('/alerts/details/')) return 'Emergency Case Details';
    if (path === '/devices') return 'Hardware Node Manager';
    if (path === '/reports') return 'System Performance & Analytics';
    if (path === '/settings') return 'Account & Clinic Settings';
    return 'MamaAlert care';
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          title="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm md:text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[130px] sm:max-w-none">
            {getPageTitle()}
          </h2>
          <p className="text-[9px] md:text-xs text-slate-400 dark:text-slate-500">MamaAlert Care Coordination Portal</p>
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* Connection status badge */}
        <div className="flex items-center">
          {useLocalSimulation ? (
            <span className="flex items-center gap-1.5 px-2 md:px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[10px] md:text-xs font-semibold rounded-full border border-amber-200 dark:border-amber-900/50">
              <CloudOff className="w-3.5 h-3.5" />
              <span className="sm:inline hidden">Local Demo Mode</span>
              <span className="sm:hidden inline">Demo</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 md:px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] md:text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-900/50">
              <Cloud className="w-3.5 h-3.5" />
              <span className="sm:inline hidden">Firebase Connected</span>
              <span className="sm:hidden inline">Live</span>
            </span>
          )}
        </div>

        {/* AI Copilot Toggle Button */}
        <button
          onClick={onAiClick}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-brand-purple hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="Open AI Clinical Copilot"
        >
          <Sparkles className="w-4 h-4 fill-current animate-pulse-slow" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Audio Toggle button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all border cursor-pointer ${
            soundEnabled
              ? 'bg-brand-purple text-white border-brand-purple hover:bg-brand-purple-dark'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          title={soundEnabled ? "Mute alarm sound" : "Unmute alarm sound"}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span className="xs:inline hidden">Alarms On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span className="xs:inline hidden">Muted</span>
            </>
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 md:gap-3 border-l border-slate-200 dark:border-slate-800 pl-3 md:pl-6">
          <div className="text-right sm:block hidden">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">{userProfile?.name || 'Medical Staff'}</h5>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{userProfile?.clinic || 'Rural Clinic'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
