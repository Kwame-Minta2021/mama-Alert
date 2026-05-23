import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShieldAlert, UserCheck, CheckCircle2, Clock, Send, AlertTriangle } from 'lucide-react';

export default function AlertDetails() {
  const { id } = useParams();
  const { alerts, patients, acknowledgeAlert, resolveAlert, escalateAlert } = useLiveMonitoring();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [interventionNote, setInterventionNote] = useState('');
  const [escalationText, setEscalationText] = useState('');

  const alertObj = alerts.find(a => a.id === id);
  const patient = alertObj ? patients[alertObj.patientId] : null;

  if (!alertObj) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-slate-700 font-bold text-sm">Incident Case Not Found</h3>
        <Link to="/alerts" className="text-brand-purple hover:underline text-xs">
          Return to Incidents Log
        </Link>
      </div>
    );
  }

  const handleAcknowledge = async () => {
    await acknowledgeAlert(alertObj.id, userProfile?.name || 'Duty Midwife');
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!interventionNote) return;
    await resolveAlert(alertObj.id, userProfile?.name || 'Duty Midwife', 'Resolved from coordinator portal', interventionNote);
    navigate('/alerts');
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    if (!escalationText) return;
    await escalateAlert(alertObj.id, userProfile?.name || 'Duty Midwife', escalationText);
    setEscalationText('');
    alert("Alert has been escalated to district health supervisor.");
  };

  // Calculate Response statistics
  let responseSec = 0;
  let responseFormatted = 'Pending';
  if (alertObj.resolvedAt) {
    responseSec = Math.floor((alertObj.resolvedAt - alertObj.triggeredAt) / 1000);
    responseFormatted = responseSec < 60 ? `${responseSec}s` : `${Math.floor(responseSec / 60)}m ${responseSec % 60}s`;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/alerts"
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Incident Coordination</h1>
          <p className="text-xs text-slate-400 mt-1">Audit and update care coordination for case: {alertObj.id}</p>
        </div>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Incident Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Case status card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            
            {/* Top row */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  alertObj.severity === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {alertObj.severity} State
                </span>
                <h3 className="text-base font-black text-slate-800 mt-2">{alertObj.alertType} Alert</h3>
                <p className="text-slate-500 font-semibold text-xs mt-1">{alertObj.message}</p>
              </div>
              <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                alertObj.status === 'Resolved' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : alertObj.status === 'Acknowledged'
                    ? 'bg-purple-50 text-brand-purple border-brand-purple/20'
                    : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              }`}>
                {alertObj.status}
              </span>
            </div>

            {/* Timelines logs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              
              {/* Triggered */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Triggered</span>
                <span className="text-slate-700 block mt-1">
                  {new Date(alertObj.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {new Date(alertObj.triggeredAt).toLocaleDateString()}
                </span>
              </div>

              {/* Acknowledged */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Acknowledged</span>
                {alertObj.acknowledgedAt ? (
                  <>
                    <span className="text-slate-700 block mt-1">
                      {new Date(alertObj.acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      By: {alertObj.acknowledgedBy}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 block mt-1">Awaiting...</span>
                )}
              </div>

              {/* Resolved */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Resolved</span>
                {alertObj.resolvedAt ? (
                  <>
                    <span className="text-slate-700 block mt-1">
                      {new Date(alertObj.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Audit: {responseFormatted} Response
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 block mt-1">Awaiting...</span>
                )}
              </div>

            </div>

            {/* Escalated clinical notes */}
            {alertObj.notes && (
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Escalation & Intervention Notes Archive</h4>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-semibold">
                  {alertObj.notes}
                </p>
              </div>
            )}

          </div>

          {/* Action coordination controls */}
          {alertObj.status !== 'Resolved' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Care Response coordination</h3>
              
              {alertObj.status === 'New' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Acknowledge this incident alert to signal to other midwives that you are actively responding and checking on the patient.
                  </p>
                  <button
                    onClick={handleAcknowledge}
                    className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-purple/20 transition-all hover:scale-[1.01]"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Acknowledge Incident Alert</span>
                  </button>
                </div>
              )}

              {alertObj.status === 'Acknowledged' && (
                <form onSubmit={handleResolve} className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Input your intervention actions (e.g. administered oxygen, adjusted sensor placement, checked maternal temperature) to resolve the alert.
                  </p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Clinical Intervention Note *</label>
                    <textarea
                      value={interventionNote}
                      onChange={(e) => setInterventionNote(e.target.value)}
                      placeholder="e.g. Administered supplemental nasal oxygen at 2L/min. SpO2 stabilized to 97%. Checked maternal pulse."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-brand-purple text-xs"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 transition-all hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Log Intervention & Close Alert</span>
                  </button>
                </form>
              )}

              {/* Escalation tray */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Escalate to District Supervisor</span>
                </h4>
                <form onSubmit={handleEscalate} className="space-y-3">
                  <div>
                    <textarea
                      value={escalationText}
                      onChange={(e) => setEscalationText(e.target.value)}
                      placeholder="e.g. Patient blood oxygen remains unstable at 91%. Midwife request second opinion or transport readiness."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-purple text-xs"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-[10px] uppercase flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 text-brand-green" />
                    <span>Escalate Case</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

        {/* Right side: Patient Profile Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Patient Case Summary</h3>
            
            {patient ? (
              <div className="text-xs font-medium space-y-3.5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Patient Name</span>
                  <span className="text-slate-800 text-sm font-bold block mt-0.5">{patient.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Classification</span>
                    <span className="text-slate-800 mt-0.5 block">{patient.patientType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Bed / Ward</span>
                    <span className="text-slate-800 mt-0.5 block">{patient.bedNumber} ({patient.ward})</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Emergency Contact</span>
                  <span className="text-slate-800 block mt-0.5">{patient.guardianName}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{patient.guardianPhone}</span>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <Link
                    to={`/patients/details/${alertObj.patientId}`}
                    className="text-brand-purple font-bold hover:underline block text-center bg-slate-50 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    View Full Medical File
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 font-bold">Patient details archived.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
