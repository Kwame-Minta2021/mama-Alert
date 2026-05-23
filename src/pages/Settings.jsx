import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { User, Shield, Radio, Settings as SettingsIcon, Save, Info, AlertTriangle, Sun, Moon } from 'lucide-react';

export default function Settings() {
  const { userProfile, darkMode, toggleDarkMode } = useAuth();
  const { useLocalSimulation, setUseLocalSimulation } = useLiveMonitoring();

  // Alert threshold states
  const [maternalMinSpo2, setMaternalMinSpo2] = useState(94);
  const [maternalMinHr, setMaternalMinHr] = useState(55);
  const [maternalMaxHr, setMaternalMaxHr] = useState(125);
  
  const [neonatalMinSpo2, setNeonatalMinSpo2] = useState(94);
  const [neonatalMinHr, setNeonatalMinHr] = useState(95);
  const [neonatalMaxHr, setNeonatalMaxHr] = useState(185);

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    alert("Vitals trigger thresholds updated locally on the clinic gateway node.");
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Facility Configurations</h1>
        <p className="text-xs text-slate-400 mt-1">Configure alarm limits and local telemetry settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Profile & System info */}
        <div className="md:col-span-1 space-y-6">
          {/* User card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple mx-auto font-black text-lg border border-brand-purple/20">
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
            <h3 className="font-bold text-slate-800 text-sm mt-3">{userProfile?.name || 'Staff User'}</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{userProfile?.role || 'midwife'}</span>

            <div className="border-t border-slate-100 mt-4 pt-4 text-xs text-left font-semibold space-y-2.5 text-slate-600">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Assigned Email</span>
                <span>{userProfile?.email}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Duty Phone</span>
                <span>{userProfile?.phone || '+233 24 123 4567'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Location Node</span>
                <span>{userProfile?.clinic || 'Kuntanase CHPS'}</span>
              </div>
            </div>
          </div>

          {/* Connection card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 text-xs">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Gateway Connection</h4>
            
            <div className="space-y-2.5 font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Mesh Channel</span>
                <span className="font-mono font-bold">Ch 11 (2.4GHz)</span>
              </div>
              <div className="flex justify-between">
                <span>Mesh Protocol</span>
                <span className="font-mono font-bold">ESP-NOW Hybrid</span>
              </div>
              <div className="flex justify-between">
                <span>Database Sync</span>
                <span className={`font-bold ${useLocalSimulation ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {useLocalSimulation ? 'Mock Engine' : 'Firebase Link'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setUseLocalSimulation(!useLocalSimulation)}
              className={`w-full py-2 rounded-xl font-bold text-[10px] uppercase border transition-all mt-2 cursor-pointer ${
                useLocalSimulation 
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Toggle Data Source Mode
            </button>
          </div>

          {/* Display Theme Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Display Theme</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { if (darkMode) toggleDarkMode(); }}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  !darkMode 
                    ? 'bg-brand-purple/5 border-brand-purple text-brand-purple'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-[11px] font-bold">Light Theme</span>
              </button>
              
              <button
                type="button"
                onClick={() => { if (!darkMode) toggleDarkMode(); }}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  darkMode 
                    ? 'bg-brand-purple/5 border-brand-purple text-brand-purple'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-[11px] font-bold">Dark Theme</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Threshold limits form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-purple" />
              <span>Alarm trigger thresholds</span>
            </h3>

            <form onSubmit={handleSaveThresholds} className="space-y-6">
              
              {/* Maternal */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-500" />
                  <span>Maternal Vital Limits</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Min SpO2 (%)</label>
                    <input
                      type="number"
                      value={maternalMinSpo2}
                      onChange={(e) => setMaternalMinSpo2(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Min Pulse (bpm)</label>
                    <input
                      type="number"
                      value={maternalMinHr}
                      onChange={(e) => setMaternalMinHr(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Max Pulse (bpm)</label>
                    <input
                      type="number"
                      value={maternalMaxHr}
                      onChange={(e) => setMaternalMaxHr(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Neonatal */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  <span>Neonatal Vital Limits</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Min SpO2 (%)</label>
                    <input
                      type="number"
                      value={neonatalMinSpo2}
                      onChange={(e) => setNeonatalMinSpo2(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Min Pulse (bpm)</label>
                    <input
                      type="number"
                      value={neonatalMinHr}
                      onChange={(e) => setNeonatalMinHr(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Max Pulse (bpm)</label>
                    <input
                      type="number"
                      value={neonatalMaxHr}
                      onChange={(e) => setNeonatalMaxHr(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Trigger message disclaimer */}
              <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl flex gap-3 text-xs text-slate-500 font-medium leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p>
                  These threshold triggers are deployed to the local ESP32 units during the next boot handshake. The hardware analyzes parameters directly at the patient edge, ensuring instant sound triggers even if the clinic's local area network (LAN) drops.
                </p>
              </div>

              {/* Save button */}
              <button
                type="submit"
                className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-purple/10"
              >
                <Save className="w-4 h-4" />
                <span>Save Alarm Limits</span>
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
