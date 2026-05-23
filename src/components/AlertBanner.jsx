import React from 'react';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { useAuth } from '../context/AuthContext';
import { AlertOctagon, ShieldAlert, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AlertBanner() {
  const { alerts, patients, acknowledgeAlert } = useLiveMonitoring();
  const { userProfile } = useAuth();

  // Find all active unacknowledged emergencies
  const activeEmergencies = alerts.filter(a => a.status === 'New' && a.severity === 'Emergency');
  
  if (activeEmergencies.length === 0) return null;

  // Show the most recent active emergency
  const primaryEmergency = activeEmergencies[0];
  const patient = patients[primaryEmergency.patientId];

  return (
    <div className="bg-red-600 text-white px-8 py-3 flex items-center justify-between animate-pulse-slow border-b border-red-700 shadow-lg relative z-40">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-double-ping absolute left-8"></div>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center pl-0">
          <ShieldAlert className="w-4 h-4 text-white fill-current" />
        </div>
        <div className="ml-2">
          <span className="font-extrabold uppercase tracking-wider text-[11px] bg-white text-red-700 px-2 py-0.5 rounded-full mr-2">
            CRITICAL EMERGENCY
          </span>
          <span className="font-bold text-sm">
            {patient ? `${patient.name} (${patient.bedNumber} - ${patient.ward})` : 'Unknown Patient'} :
          </span>
          <span className="text-sm font-medium ml-1">
            {primaryEmergency.message}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to={`/alerts/details/${primaryEmergency.id}`}
          className="text-xs font-bold underline hover:text-red-100"
        >
          View Case details
        </Link>
        <button
          onClick={() => acknowledgeAlert(primaryEmergency.id, userProfile?.name || 'Duty Nurse')}
          className="flex items-center gap-1 bg-white text-red-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors shadow-md shadow-red-900/10"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Acknowledge Alert</span>
        </button>
      </div>
    </div>
  );
}
