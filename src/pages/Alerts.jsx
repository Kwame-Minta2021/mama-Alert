import React, { useState } from 'react';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { Link } from 'react-router-dom';
import { AlertOctagon, Clock, UserCheck, ShieldAlert, Filter, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Alerts() {
  const { alerts, patients } = useLiveMonitoring();
  const [filterSeverity, setFilterSeverity] = useState('All'); // All, Emergency, Warning
  const [filterStatus, setFilterStatus] = useState('All'); // All, New, Acknowledged, Resolved
  const [searchName, setSearchName] = useState('');

  const filteredAlerts = alerts.filter(alt => {
    const pat = patients[alt.patientId];
    const nameMatch = pat ? pat.name.toLowerCase().includes(searchName.toLowerCase()) : false;
    const severityMatch = filterSeverity === 'All' || alt.severity === filterSeverity;
    const statusMatch = filterStatus === 'All' || alt.status === filterStatus;
    
    // If search term is empty, bypass name match
    return (searchName === '' || nameMatch) && severityMatch && statusMatch;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Emergency Incident center</h1>
        <p className="text-xs text-slate-400 mt-1">Audit trail and logs of warnings and critical vitals alerts</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search alerts by patient name..."
            className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          {/* Severity */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Emergency">Critical Emergency</option>
              <option value="Warning">Abnormal Warning</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none"
            >
              <option value="All">All States</option>
              <option value="New">New / Unresolved</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved Cases</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Log Table */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-2">
          <ShieldAlert className="w-12 h-12 text-slate-200 mx-auto" />
          <h4 className="text-slate-700 font-bold text-sm">No Incidents Logged</h4>
          <p className="text-slate-400 text-xs">Auscultations and parameters are normal across the clinic.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  <th className="py-4 px-6">Patient Name</th>
                  <th className="py-4 px-6">Triggered Vitals</th>
                  <th className="py-4 px-6">Severity</th>
                  <th className="py-4 px-6">Triggered Time</th>
                  <th className="py-4 px-6">Response Track</th>
                  <th className="py-4 px-6">Case Status</th>
                  <th className="py-4 px-6 text-right">Coordination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {filteredAlerts.map(alt => {
                  const pat = patients[alt.patientId];
                  
                  // Calculate Response Time if resolved
                  let responseTime = '';
                  if (alt.resolvedAt) {
                    const diffMs = alt.resolvedAt - alt.triggeredAt;
                    const diffSec = Math.floor(diffMs / 1000);
                    if (diffSec < 60) {
                      responseTime = `${diffSec}s`;
                    } else {
                      responseTime = `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`;
                    }
                  }

                  return (
                    <tr key={alt.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Patient name & bed */}
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {pat ? (
                          <div>
                            <span className="block">{pat.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{pat.bedNumber} • {pat.ward}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Archived Patient</span>
                        )}
                      </td>

                      {/* Trigger details */}
                      <td className="py-4 px-6 font-bold text-slate-700">
                        {alt.message}
                      </td>

                      {/* Severity badge */}
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          alt.severity === 'Emergency' ? 'bg-red-150 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {alt.severity}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(alt.triggeredAt).toLocaleDateString()} at{' '}
                            {new Date(alt.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Response tracking */}
                      <td className="py-4 px-6">
                        {alt.status === 'Resolved' ? (
                          <div>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Resolved ({responseTime})</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">By: {alt.resolvedBy}</span>
                          </div>
                        ) : alt.status === 'Acknowledged' ? (
                          <div>
                            <span className="text-brand-purple font-semibold flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Acknowledged</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">By: {alt.acknowledgedBy}</span>
                          </div>
                        ) : (
                          <span className="text-red-600 font-extrabold flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Unresolved</span>
                          </span>
                        )}
                      </td>

                      {/* Case status badge */}
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                          alt.status === 'Resolved' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : alt.status === 'Acknowledged'
                              ? 'bg-purple-50 text-brand-purple border border-brand-purple/20'
                              : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                        }`}>
                          {alt.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/alerts/details/${alt.id}`}
                          className="bg-slate-100 hover:bg-brand-purple/10 text-slate-600 hover:text-brand-purple py-1 px-3 rounded-lg text-[10px] font-extrabold uppercase transition-all inline-block"
                        >
                          Manage Case
                        </Link>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
