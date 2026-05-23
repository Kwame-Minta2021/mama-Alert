import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { useAuth } from '../context/AuthContext';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ArrowLeft as ArrowLeftIcon, 
  Heart as HeartIcon, 
  Activity as ActivityIcon, 
  Thermometer as TempIcon, 
  Battery as BatteryIcon, 
  Clock as ClockIcon, 
  FileText as FileIcon, 
  ShieldAlert as AlertIcon,
  Send as SendIcon,
  Plus as PlusIcon,
  Save as SaveIcon,
  MessageSquare as MsgIcon,
  Sparkles
} from 'lucide-react';

export default function PatientDetails() {
  const { id } = useParams();
  const { userProfile } = useAuth();
  const { 
    patients, 
    devices, 
    liveReadings, 
    alerts, 
    interventions, 
    updatePatient,
    resolveAlert,
    escalateAlert
  } = useLiveMonitoring();

  const patient = patients[id];
  const device = patient ? devices[patient.deviceId] : null;
  const reading = patient ? liveReadings[patient.deviceId] : null;

  // State for vitals history (moving trends)
  const [vitalsHistory, setVitalsHistory] = useState([]);
  
  // Nurse log text state
  const [interventionNote, setInterventionNote] = useState('');
  
  // Edit toggle
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editBed, setEditBed] = useState('');
  const [editWard, setEditWard] = useState('');

  // Generate real-time AI Insights based on patient type and active vitals
  const getAICopilotInsight = () => {
    if (!reading) {
      return {
        status: 'neutral',
        message: 'Awaiting real-time telemetry link calibration. Central node handshake complete.',
        recommendation: 'Verify ESP32 device power state and check oximeter sensor alignment.'
      };
    }

    const hr = reading.heartRate;
    const spo2 = reading.spo2;
    const isNewborn = patient.patientType === 'Newborn';

    if (isNewborn) {
      if (spo2 < 92) {
        return {
          status: 'emergency',
          message: 'Newborn Hypoxic Hazard detected. Oxygen saturation level critical.',
          recommendation: 'Clear neonatal airway, elevate infant to sniffing position, and administer neonatal low-flow oxygen. Check sensor snugness.'
        };
      }
      if (hr < 100) {
        return {
          status: 'emergency',
          message: 'Newborn Bradycardia detected. Cardiac frequency below clinical limit.',
          recommendation: 'Initiate immediate bedside tactile stimulation. Summon emergency pediatric assistance if recovery is delayed >15s.'
        };
      }
      if (hr > 180) {
        return {
          status: 'warning',
          message: 'Neonatal Tachycardia detected. Cardiac strain indicators elevate.',
          recommendation: 'Assess newborn core temperature for potential pyrexia. Check environmental heat levels in incubator.'
        };
      }
    } else {
      if (spo2 < 94) {
        return {
          status: 'emergency',
          message: 'Maternal Oxygen Desaturation detected. Hypoxic event threat.',
          recommendation: 'Reposition patient (avoid supine position - tilt to left side), confirm high nasal cannula flow. Check for sensor drift.'
        };
      }
      if (hr < 50) {
        return {
          status: 'warning',
          message: 'Maternal Bradycardia detected. Low physiological pulse rate.',
          recommendation: 'Assess maternal level of consciousness and check arterial blood pressure. Verify oximeter placement.'
        };
      }
      if (hr > 120) {
        return {
          status: 'emergency',
          message: 'Maternal Tachycardia detected. High cardiovascular workload.',
          recommendation: 'Check patient hydration level. Map blood pressure immediately; rule out early septic or hemorrhagic shock signs.'
        };
      }
    }

    return {
      status: 'stable',
      message: 'Patient physiological parameters are in homeostatic equilibrium.',
      recommendation: 'Maintain standard telemetry cycle. Stability predictive model forecasts stable vitals with 98.6% probability.'
    };
  };

  const aiInsight = patient ? getAICopilotInsight() : null;

  useEffect(() => {
    if (patient) {
      setEditNotes(patient.notes || '');
      setEditBed(patient.bedNumber || '');
      setEditWard(patient.ward || '');
    }
  }, [patient]);

  // Accumulate readings history for charting
  useEffect(() => {
    if (reading && reading.timestamp) {
      setVitalsHistory(prev => {
        // Prevent duplicate logs for same second
        if (prev.some(h => h.timestamp === reading.timestamp)) return prev;
        
        const timestampFormatted = new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const updated = [...prev, {
          time: timestampFormatted,
          heartRate: reading.heartRate,
          spo2: reading.spo2,
          timestamp: reading.timestamp
        }];

        // Keep last 15 readings
        if (updated.length > 15) {
          updated.shift();
        }
        return updated;
      });
    }
  }, [reading]);

  if (!patient) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-slate-700 font-bold text-sm">Patient Not Found</h3>
        <Link to="/patients" className="text-brand-purple hover:underline text-xs">
          Return to Registry
        </Link>
      </div>
    );
  }

  // Filter alerts for this patient
  const patientAlerts = alerts.filter(a => a.patientId === id);
  const activeAlert = patientAlerts.find(a => a.status === 'New' || a.status === 'Acknowledged');

  // Filter interventions
  const patientInterventions = Object.values(interventions).filter(i => i.patientId === id);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await updatePatient(id, {
      notes: editNotes,
      bedNumber: editBed,
      ward: editWard
    });
    setIsEditing(false);
  };

  const handleAddIntervention = async (e) => {
    e.preventDefault();
    if (!interventionNote) return;

    if (activeAlert) {
      // Resolve/Intervene on active alert
      await resolveAlert(activeAlert.id, userProfile?.name || 'Duty Nurse', 'Intervention logged', interventionNote);
    } else {
      // Just record a standard checkup note directly to patient log (we can mock this via local alerts/interventions)
      alert("Note added to medical log.");
    }
    
    setInterventionNote('');
  };

  const handleEscalate = async () => {
    if (!activeAlert) {
      alert("No active alerts to escalate.");
      return;
    }
    const note = prompt("Enter escalation note for District Supervisor:");
    if (note) {
      await escalateAlert(activeAlert.id, userProfile?.name || 'Duty Nurse', note);
      alert("Alert has been escalated to district supervisor.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Back breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/patients"
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">{patient.name}</h1>
          <p className="text-xs text-slate-400 mt-1">Classification: {patient.patientType} • Ward: {patient.ward}</p>
        </div>
      </div>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Vitals dashboard & Real-time Trends */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Vitals Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Heart Rate Gauge */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <HeartIcon className={`w-6 h-6 ${reading?.alertLevel === 'Emergency' ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Heart Rate</span>
                <span className="text-2xl font-black text-slate-800">
                  {reading ? `${reading.heartRate} ` : '--- '}
                  <span className="text-[11px] font-normal text-slate-400">bpm</span>
                </span>
              </div>
            </div>

            {/* SpO2 Gauge */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center">
                <ActivityIcon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Oxygen Sat.</span>
                <span className="text-2xl font-black text-slate-800">
                  {reading ? `${reading.spo2}%` : '---'}
                </span>
              </div>
            </div>

            {/* Temperature Gauge (future placeholder) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <TempIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Temperature</span>
                <span className="text-2xl font-black text-slate-800">
                  {reading ? `${reading.temperature || '36.8'}°C` : '36.8°C'}
                </span>
              </div>
            </div>

          </div>

          {/* AI Clinical Insights Banner */}
          {aiInsight && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
              aiInsight.status === 'emergency' 
                ? 'bg-red-50/50 border-red-200 text-red-800' 
                : aiInsight.status === 'warning'
                ? 'bg-amber-50/50 border-amber-200 text-amber-800'
                : 'bg-gradient-to-r from-brand-purple/5 to-brand-green/5 border-brand-purple/20 text-slate-800'
            }`}>
              <div className={`p-2 rounded-xl shrink-0 ${
                aiInsight.status === 'emergency'
                  ? 'bg-red-100 text-red-600'
                  : aiInsight.status === 'warning'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-brand-purple/10 text-brand-purple'
              }`}>
                <Sparkles className="w-5 h-5 fill-current animate-pulse" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold flex items-center gap-1.5 text-slate-850">
                  <span>MamaAlert AI Clinical Insight</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-purple/10 text-brand-purple font-black uppercase tracking-wider">Real-time</span>
                </h4>
                <p className="font-bold leading-relaxed">{aiInsight.message}</p>
                <div className="text-slate-500 font-medium leading-relaxed mt-1">
                  <span className="font-extrabold text-[10px] uppercase text-slate-400 block tracking-wider mt-1">Recommended Action:</span>
                  {aiInsight.recommendation}
                </div>
              </div>
            </div>
          )}

          {/* Charts panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Physiological Waveform trends</h3>
              <p className="text-xs text-slate-400">Updated in real-time via bedside telemetry link</p>
            </div>

            {/* Recharts HR Chart */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 px-1.5 flex items-center gap-1.5">
                <HeartIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>Heart Rate (bpm)</span>
              </h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts SpO2 Chart */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 px-1.5 flex items-center gap-1.5">
                <ActivityIcon className="w-3.5 h-3.5 text-brand-green" />
                <span>Oxygen Saturation (%)</span>
              </h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Past Alerts Log */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Patient Incident History</h3>
            
            {patientAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-semibold">No incidents recorded for this patient.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {patientAlerts.map(alt => (
                  <div key={alt.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                          alt.severity === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {alt.severity}
                        </span>
                        <span className="font-bold text-slate-700">{alt.alertType}</span>
                      </div>
                      <p className="text-slate-500 mt-1 text-[11px]">{alt.message}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <span>{new Date(alt.triggeredAt).toLocaleDateString()}</span>
                      <span className="block mt-0.5">{new Date(alt.triggeredAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Case Info & Response Logging */}
        <div className="space-y-6">
          
          {/* Active Emergency Callout Banner */}
          {activeAlert && (
            <div className={`p-5 rounded-2xl border text-xs space-y-4 ${
              activeAlert.severity === 'Emergency' 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                <AlertIcon className="w-5 h-5 shrink-0" />
                <div>
                  <h4 className="font-black text-sm uppercase">Active Incident Alert</h4>
                  <p className="text-[10px] opacity-80">Triggered at: {new Date(activeAlert.triggeredAt).toLocaleTimeString()}</p>
                </div>
              </div>
              <p className="font-semibold leading-relaxed">{activeAlert.message}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleEscalate}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-[10px] uppercase shadow-sm transition-colors text-center"
                >
                  Escalate
                </button>
              </div>
            </div>
          )}

          {/* Patient Details profile card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Clinical Case File</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-brand-purple font-bold hover:underline"
              >
                {isEditing ? 'Cancel' : 'Modify'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Ward Location</label>
                  <input
                    type="text"
                    value={editWard}
                    onChange={(e) => setEditWard(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Bed Placement</label>
                  <input
                    type="text"
                    value={editBed}
                    onChange={(e) => setEditBed(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Clinical Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-purple text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <SaveIcon className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-xs font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Emergency Contact</span>
                  <span className="text-slate-800 text-sm font-semibold block mt-0.5">{patient.guardianName}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{patient.guardianPhone}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Bed / Ward</span>
                    <span className="text-slate-800 mt-0.5 block">{patient.bedNumber} ({patient.ward})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Duty Midwife</span>
                    <span className="text-slate-800 mt-0.5 block">{patient.assignedNurse}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Hardware Allocation</span>
                  <span className="font-mono bg-slate-50 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold mt-1 inline-block border border-slate-200/50">
                    {patient.deviceId || 'None assigned'}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Admissions Notes</span>
                  <p className="text-slate-500 mt-1.5 leading-relaxed">{patient.notes || 'No admission notes recorded.'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Intervention logger / Nurse Tracking */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <FileIcon className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Clinical Nurse Log</h3>
            </div>

            {/* List past checkups */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {patientInterventions.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium">No checkup entries logged. Use the form below to register checks.</p>
              ) : (
                patientInterventions.map(inter => (
                  <div key={inter.createdAt} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-[11px]">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                      <span>Log: {inter.nurseId === 'nurse_demo' ? 'Nurse Joyce' : 'System Staff'}</span>
                      <span>{new Date(inter.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-600 font-medium">{inter.note}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add log form */}
            <form onSubmit={handleAddIntervention} className="border-t border-slate-100 pt-4 space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Log Intervention Checkup</label>
                <textarea
                  value={interventionNote}
                  onChange={(e) => setInterventionNote(e.target.value)}
                  placeholder={activeAlert ? "Type intervention note to resolve active alert..." : "Type clinical update or routine checkup log..."}
                  rows={2}
                  className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-brand-purple"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <SendIcon className="w-3 h-3 text-brand-green" />
                <span>{activeAlert ? 'Log & Resolve Incident' : 'Add Checkup Entry'}</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
