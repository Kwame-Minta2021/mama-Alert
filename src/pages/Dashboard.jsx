import React from 'react';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Baby, 
  Activity, 
  AlertTriangle, 
  Heart, 
  Battery, 
  Clock, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

export default function Dashboard() {
  const { patients, devices, liveReadings, alerts, stats } = useLiveMonitoring();

  // Find active monitored patients
  const activePatients = Object.keys(patients)
    .map(key => ({ id: key, ...patients[key] }))
    .filter(p => p.status === 'monitoring');

  // Filter 4 most recent alerts
  const recentAlerts = alerts.slice(0, 4);

  // Get color indicators for a patient status
  const getStatusColor = (patient) => {
    const dev = devices[patient.deviceId];
    if (!dev || !dev.online || (Date.now() - dev.lastSeen > 60000)) {
      return {
        bg: 'bg-slate-100 border-slate-200 text-slate-700',
        text: 'text-slate-600',
        indicator: 'bg-slate-400',
        label: 'Device Offline',
        badge: 'bg-slate-100 text-slate-600 border-slate-200'
      };
    }

    const reading = liveReadings[patient.deviceId];
    if (!reading) {
      return {
        bg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
        text: 'text-emerald-600',
        indicator: 'bg-emerald-500 animate-pulse',
        label: 'Stable',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100'
      };
    }

    if (reading.alertLevel === 'Emergency') {
      return {
        bg: 'bg-red-50 border-red-200 text-red-700',
        text: 'text-red-600',
        indicator: 'bg-red-500 animate-beacon-ping',
        label: 'Emergency Alert',
        badge: 'bg-red-100 text-red-700 border-red-200'
      };
    } else if (reading.alertLevel === 'Warning') {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        text: 'text-amber-600',
        indicator: 'bg-amber-500 animate-pulse',
        label: 'Warning State',
        badge: 'bg-amber-100 text-amber-700 border-amber-200'
      };
    } else {
      return {
        bg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
        text: 'text-emerald-600',
        indicator: 'bg-emerald-500 animate-pulse',
        label: 'Normal',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100'
      };
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Monitored */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Monitoring</span>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalPatients}</h3>
            <div className="flex gap-3 text-[11px] font-semibold text-slate-400 mt-1">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stats.mothersCount} Mothers</span>
              <span className="flex items-center gap-1"><Baby className="w-3 h-3" /> {stats.newbornsCount} Newborns</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Emergencies */}
        <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between transition-colors ${
          stats.emergencyCount > 0 
            ? 'bg-red-50/50 border-red-200 animate-pulse' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergencies</span>
            <h3 className="text-3xl font-black text-slate-800">{stats.emergencyCount}</h3>
            <span className="text-[11px] font-semibold text-slate-400 mt-1 block">Requires immediate intervention</span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            stats.emergencyCount > 0 ? 'bg-red-500 text-white animate-bounce' : 'bg-red-50 text-red-500'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Warning cases */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warnings</span>
            <h3 className="text-3xl font-black text-slate-800">{stats.warningCount}</h3>
            <span className="text-[11px] font-semibold text-slate-400 mt-1 block">Abnormal vitals detected</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Device offline / Battery */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hardware Status</span>
            <h3 className="text-3xl font-black text-slate-800">{stats.offlineCount}</h3>
            <div className="flex gap-3 text-[11px] font-semibold text-slate-400 mt-1">
              <span className="text-slate-500 font-bold">{stats.offlineCount} Offline</span>
              <span>•</span>
              <span className="text-red-500 font-bold">{stats.criticalBatteryCount} Low Battery</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
            <Battery className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Patients Grid Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-800">Bed Coordination Monitor</h3>
              <p className="text-xs text-slate-400">Live bedside statuses of actively monitored patients</p>
            </div>
            <Link 
              to="/live" 
              className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
            >
              <span>Detailed Monitor View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activePatients.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-slate-600 font-bold text-sm">No Active Patients Registered</h4>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                No patients are currently mapped to hardware monitoring nodes. Go to Patients Registry to add one.
              </p>
              <Link 
                to="/patients" 
                className="inline-block bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-all"
              >
                Go to Patients Registry
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePatients.map(pat => {
                const styles = getStatusColor(pat);
                const reading = liveReadings[pat.deviceId];
                const dev = devices[pat.deviceId];

                return (
                  <Link
                    key={pat.id}
                    to={`/patients/details/${pat.id}`}
                    className={`bg-white p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between h-44 ${
                      reading?.alertLevel === 'Emergency' ? 'border-red-200 ring-2 ring-red-500/10' : 'border-slate-100'
                    }`}
                  >
                    <div>
                      {/* Top Row header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                            pat.patientType === 'Mother' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {pat.patientType}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm mt-2 truncate w-40">{pat.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{pat.bedNumber} • {pat.ward}</p>
                        </div>
                        {/* Status beacon dot */}
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-200/80">
                          <span className={`w-2.5 h-2.5 rounded-full ${styles.indicator}`}></span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{styles.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vitals row */}
                    {dev && dev.online && reading ? (
                      <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        {/* Heart rate */}
                        <div className="flex items-center gap-2">
                          <Heart className={`w-4 h-4 shrink-0 ${
                            reading.heartRate > 120 || reading.heartRate < 60 ? 'text-red-500 fill-current animate-pulse' : 'text-rose-500'
                          }`} />
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold">HEART RATE</span>
                            <span className="text-sm font-black text-slate-800">{reading.heartRate} <span className="text-[9px] font-normal text-slate-400">bpm</span></span>
                          </div>
                        </div>

                        {/* SpO2 */}
                        <div className="flex items-center gap-2">
                          <Activity className={`w-4 h-4 shrink-0 ${
                            reading.spo2 < 92 ? 'text-red-500 animate-bounce' : 'text-brand-green'
                          }`} />
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold">OXYGEN SAT.</span>
                            <span className="text-sm font-black text-slate-800">{reading.spo2}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-center justify-center text-center text-xs text-slate-400 font-medium">
                        {dev ? "Hardware device is currently offline" : "No monitoring device assigned"}
                      </div>
                    )}

                    {/* Footer bottom metadata */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-50">
                      <span>Node: {pat.deviceId || 'None'}</span>
                      {dev && (
                        <span className="flex items-center gap-1">
                          <Battery className={`w-3.5 h-3.5 ${dev.batteryLevel <= 20 ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
                          <span>{dev.batteryLevel}%</span>
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Recent alert logs & quick info panel */}
        <div className="space-y-6">
          {/* Alerts Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Critical Incidents Log</h3>
                  <p className="text-xs text-slate-400">Most recent clinic alerts triggered</p>
                </div>
                <Link to="/alerts" className="text-xs font-bold text-brand-purple hover:underline">
                  View All
                </Link>
              </div>

              {recentAlerts.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">No Recent Incidents logged</p>
                  <p className="text-[10px] text-slate-400">Clinic vitals are within normal range thresholds.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAlerts.map(alert => {
                    const pat = patients[alert.patientId];
                    return (
                      <Link
                        key={alert.id}
                        to={`/alerts/details/${alert.id}`}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                          alert.status === 'New'
                            ? alert.severity === 'Emergency'
                              ? 'bg-red-50/50 border-red-100 hover:bg-red-50'
                              : 'bg-amber-50/50 border-amber-100 hover:bg-amber-50'
                            : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          alert.severity === 'Emergency' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-slate-800 truncate w-32">
                              {pat ? pat.name : 'Unknown Patient'}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{alert.message}</p>
                          <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-100/50">
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                              alert.severity === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {alert.severity}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                              Status: {alert.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick info panel - Ghanaian CHPS readiness banner */}
          <div className="bg-gradient-to-tr from-brand-purple to-brand-purple-dark text-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-brand-green" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider">Ghana WIE WIE-26 Challenge</h4>
            </div>
            <p className="text-xs leading-relaxed text-purple-100">
              MamaAlert implements an offline-first telemetry concept. If clinic internet goes offline, the ESP32 bedside units sound alarms using their internal piezo buzzers and coordinate via local mesh networks, safeguarding patient health.
            </p>
            <div className="border-t border-purple-500/30 pt-3 text-[10px] text-purple-200 font-semibold flex justify-between">
              <span>Clinic Comp: Kuntanase CHPS</span>
              <span>Uptime Target: 99.9%</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
