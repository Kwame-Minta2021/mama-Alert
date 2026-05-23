import React, { useState, useEffect } from 'react';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { Link } from 'react-router-dom';
import { Heart, Activity, Thermometer, Battery, Users, Baby, Radio, Clock, Eye } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// Sub-component for individual patient monitoring card
function LivePatientCard({ patient, device, reading }) {
  const [history, setHistory] = useState([]);

  // Accumulate history locally for this card
  useEffect(() => {
    if (reading && reading.timestamp) {
      setHistory(prev => {
        if (prev.some(h => h.timestamp === reading.timestamp)) return prev;
        const updated = [...prev, {
          heartRate: reading.heartRate,
          spo2: reading.spo2,
          timestamp: reading.timestamp
        }];
        if (updated.length > 10) {
          updated.shift();
        }
        return updated;
      });
    }
  }, [reading]);

  const isOnline = device && device.online && (Date.now() - device.lastSeen < 60000);
  
  // Alert colors
  let cardBorder = 'border-slate-100';
  let badgeColor = 'bg-slate-100 text-slate-500';
  let statusText = 'Normal';

  if (!isOnline) {
    cardBorder = 'border-slate-200 opacity-75';
    badgeColor = 'bg-slate-200 text-slate-600';
    statusText = 'Offline';
  } else if (reading) {
    if (reading.alertLevel === 'Emergency') {
      cardBorder = 'border-red-300 ring-2 ring-red-500/20';
      badgeColor = 'bg-red-500 text-white animate-pulse';
      statusText = 'Emergency';
    } else if (reading.alertLevel === 'Warning') {
      cardBorder = 'border-amber-300 ring-2 ring-amber-500/20';
      badgeColor = 'bg-amber-500 text-white';
      statusText = 'Warning';
    } else {
      cardBorder = 'border-emerald-200';
      badgeColor = 'bg-emerald-500 text-white';
      statusText = 'Normal';
    }
  }

  return (
    <div className={`bg-white rounded-2xl p-5 border flex flex-col justify-between h-72 shadow-sm transition-all duration-300 hover:shadow-md ${cardBorder}`}>
      {/* Top Details bar */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full ${
              patient.patientType === 'Mother' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {patient.patientType}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">{patient.bedNumber}</span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm mt-1.5 truncate w-32">{patient.name}</h4>
          <span className="text-[9px] text-slate-400 block">{patient.ward}</span>
        </div>

        {/* State badge */}
        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm ${badgeColor}`}>
          {statusText}
        </span>
      </div>

      {/* Main Gauge Numbers */}
      {isOnline && reading ? (
        <div className="grid grid-cols-2 gap-4 my-2">
          {/* Heart Rate */}
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <Heart className={`w-6 h-6 shrink-0 text-red-500 ${reading.alertLevel === 'Emergency' ? 'animate-pulse' : ''}`} />
            <div>
              <span className="text-[8px] font-extrabold text-slate-400 block uppercase tracking-wider">Pulse</span>
              <span className="text-lg font-black text-slate-800 leading-tight">
                {reading.heartRate} <span className="text-[9px] font-normal text-slate-400">bpm</span>
              </span>
            </div>
          </div>

          {/* SpO2 */}
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 shrink-0 text-brand-green" />
            <div>
              <span className="text-[8px] font-extrabold text-slate-400 block uppercase tracking-wider">Oxygen</span>
              <span className="text-lg font-black text-slate-800 leading-tight">
                {reading.spo2}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-4 bg-slate-50/70 rounded-xl my-2 text-xs text-slate-400 font-bold border border-slate-100">
          {!device ? 'No Hardware node assigned' : 'Telemetry Link offline'}
        </div>
      )}

      {/* AI Mini-Insight indicator */}
      {isOnline && reading && (
        <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5 truncate">
          <span className="text-brand-purple">🔮 AI:</span>
          <span>
            {reading.spo2 < 94 || reading.heartRate > 120 || (patient.patientType === 'Newborn' && (reading.heartRate < 100 || reading.heartRate > 180))
              ? 'Distress flags detected. Bedside check recommended.'
              : 'Physiological parameters stable.'
            }
          </span>
        </div>
      )}

      {/* Sparkline chart in card */}
      {isOnline && reading && history.length > 1 ? (
        <div className="h-14 w-full bg-slate-50 rounded-xl p-1 overflow-hidden border border-slate-100/50">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-14 bg-slate-50/20 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
          Awaiting telemetry payload
        </div>
      )}

      {/* Card Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2 text-[10px] text-slate-400 font-semibold">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{isOnline && reading ? new Date(reading.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'}) : 'No Sync'}</span>
        </span>

        <div className="flex items-center gap-3">
          {device && (
            <span className="flex items-center gap-0.5">
              <Battery className={`w-3.5 h-3.5 ${device.batteryLevel <= 20 ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
              <span>{device.batteryLevel}%</span>
            </span>
          )}
          <Link
            to={`/patients/details/${patient.id}`}
            className="text-brand-purple hover:underline flex items-center gap-0.5"
          >
            <span>Details</span>
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LiveMonitoring() {
  const { patients, devices, liveReadings } = useLiveMonitoring();

  // Filter actively monitored patients
  const monitoredPatients = Object.keys(patients)
    .map(key => ({ id: key, ...patients[key] }))
    .filter(p => p.status === 'monitoring');

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Telemetry Station</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time physiological parameters mapping</p>
      </div>

      {monitoredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center space-y-3">
          <Radio className="w-12 h-12 text-slate-200 mx-auto animate-pulse" />
          <h4 className="text-slate-700 font-bold text-sm">No Active Telemetry Feeds</h4>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            There are currently no patients under active monitoring. Map devices to patients in the Patients Registry to start telemetry streams.
          </p>
          <Link
            to="/patients"
            className="inline-block bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all mt-2"
          >
            Go to Patients Registry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitoredPatients.map(pat => (
            <LivePatientCard
              key={pat.id}
              patient={pat}
              device={devices[pat.deviceId]}
              reading={liveReadings[pat.deviceId]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
