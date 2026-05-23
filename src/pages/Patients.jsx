import React, { useState } from 'react';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Eye, Filter, Users, Baby, ChevronRight, Ban, CheckCircle } from 'lucide-react';

export default function Patients() {
  const { patients, devices, updatePatient } = useLiveMonitoring();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Mother, Newborn
  const [filterStatus, setFilterStatus] = useState('monitoring'); // All, monitoring, discharge

  const patientList = Object.keys(patients).map(key => ({
    id: key,
    ...patients[key]
  }));

  const filteredPatients = patientList.filter(pat => {
    // Search filter
    const matchesSearch = 
      pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pat.deviceId && pat.deviceId.toLowerCase().includes(searchTerm.toLowerCase()));

    // Type filter
    const matchesType = filterType === 'All' || pat.patientType === filterType;

    // Status filter
    const matchesStatus = filterStatus === 'All' || pat.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDischarge = async (id, deviceId) => {
    if (window.confirm("Are you sure you want to discharge this patient? This will unassign their hardware node device.")) {
      await updatePatient(id, { status: 'discharge', deviceId: '' });
      if (deviceId) {
        // Find device in context and clear assigned patient (done internally in standard databases,
        // but let's update locally/DB where possible).
        // Since updatePatient does local/DB update, we can discharge easily.
      }
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Patients Registry</h1>
          <p className="text-xs text-slate-400 mt-1">Register and coordinate ward placements for mothers and newborns</p>
        </div>
        <Link
          to="/patients/add"
          className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-brand-purple/20 transition-all hover:scale-[1.01]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name, bed number, or node ID..."
            className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          {/* Patient Type */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Mother">Mothers Only</option>
              <option value="Newborn">Newborns Only</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none"
            >
              <option value="monitoring">Actively Monitored</option>
              <option value="discharge">Discharged</option>
              <option value="All">All Statuses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Grid / List */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-200 mx-auto" />
          <h4 className="text-slate-700 font-bold text-sm">No Patients Found</h4>
          <p className="text-slate-400 text-xs">
            We couldn't find any patients matching your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  <th className="py-4 px-6">Patient Vitals</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Age</th>
                  <th className="py-4 px-6">Ward & Bed</th>
                  <th className="py-4 px-6">Guardian / Emergency</th>
                  <th className="py-4 px-6">Assigned Node</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {filteredPatients.map(pat => {
                  const isMonitored = pat.status === 'monitoring';
                  return (
                    <tr key={pat.id} className="hover:bg-slate-50/55 transition-colors">
                      {/* Name & status */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            pat.patientType === 'Mother' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {pat.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm leading-none">{pat.name}</h4>
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full inline-block mt-1 ${
                              isMonitored ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {isMonitored ? 'Monitoring' : 'Discharged'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1.5">
                          {pat.patientType === 'Mother' ? (
                            <>
                              <Users className="w-3.5 h-3.5 text-purple-500" />
                              <span>Mother</span>
                            </>
                          ) : (
                            <>
                              <Baby className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Newborn</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Age */}
                      <td className="py-4 px-6 text-slate-500">
                        {pat.patientType === 'Mother' ? `${pat.age} years` : `${pat.age} months`}
                      </td>

                      {/* Bed & Ward */}
                      <td className="py-4 px-6">
                        {isMonitored ? (
                          <div>
                            <span className="font-bold text-slate-800 block leading-tight">{pat.bedNumber}</span>
                            <span className="text-[10px] text-slate-400">{pat.ward}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Guardian Details */}
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-semibold text-slate-700 block leading-tight">{pat.guardianName}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{pat.guardianPhone}</span>
                        </div>
                      </td>

                      {/* Node ID */}
                      <td className="py-4 px-6">
                        {isMonitored && pat.deviceId ? (
                          <span className="bg-slate-100 text-slate-600 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                            {pat.deviceId}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">Unassigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link
                            to={`/patients/details/${pat.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-purple/10 text-slate-500 hover:text-brand-purple transition-all"
                            title="View Profile Case"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {isMonitored && (
                            <button
                              onClick={() => handleDischarge(pat.id, pat.deviceId)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all"
                              title="Discharge Patient"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
