import React, { useState } from 'react';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Users, Baby, Save, Info } from 'lucide-react';

export default function AddPatient() {
  const { devices, registerPatient } = useLiveMonitoring();
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [patientType, setPatientType] = useState('Mother');
  const [age, setAge] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [ward, setWard] = useState('');
  const [assignedNurse, setAssignedNurse] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // List devices that are NOT currently assigned to actively monitored patients
  const availableDevices = Object.keys(devices).filter(id => {
    // If device doesn't have an assigned patient, it is available
    return !devices[id].assignedPatientId;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !patientType || !age || !guardianName || !guardianPhone || !bedNumber || !ward || !assignedNurse) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      await registerPatient({
        name,
        patientType,
        age: parseInt(age),
        guardianName,
        guardianPhone,
        bedNumber,
        ward,
        assignedNurse,
        deviceId,
        notes
      });
      navigate('/patients');
    } catch (err) {
      console.error(err);
      alert("Failed to register patient: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb row */}
      <div className="flex items-center gap-3">
        <Link
          to="/patients"
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Register Patient</h1>
          <p className="text-xs text-slate-400 mt-1">Create a new case file and assign a monitoring node</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Patient Type Select */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Patient Classification
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPatientType('Mother')}
                className={`py-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  patientType === 'Mother'
                    ? 'border-brand-purple bg-brand-purple/5 text-brand-purple'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Mother</span>
              </button>
              <button
                type="button"
                onClick={() => setPatientType('Newborn')}
                className={`py-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  patientType === 'Newborn'
                    ? 'border-brand-green bg-brand-green/5 text-brand-green'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Baby className="w-4 h-4" />
                <span>Newborn</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ama Serwaa"
                className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple"
                required
              />
            </div>

            {/* Patient Age */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                {patientType === 'Mother' ? 'Age (Years) *' : 'Age (Months) *'}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={patientType === 'Mother' ? '25' : '1'}
                className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Emergency Contact Name *
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Kofi Serwaa"
                className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple"
                required
              />
            </div>

            {/* Guardian Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="+233 24 411 1222"
                className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ward */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Ward Placement *
              </label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="Maternity Ward A"
                className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple"
                required
              />
            </div>

            {/* Bed Number */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Bed / Cot Number *
              </label>
              <input
                type="text"
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                placeholder="Bed 01"
                className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple"
                required
              />
            </div>

            {/* Assigned Nurse */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Assigned Nurse *
              </label>
              <input
                type="text"
                value={assignedNurse}
                onChange={(e) => setAssignedNurse(e.target.value)}
                placeholder="Nurse Joyce Osei"
                className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple"
                required
              />
            </div>
          </div>

          {/* Node allocation */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Allocate Monitoring Device Node
            </label>
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple"
            >
              <option value="">Leave Unassigned (Ad-Hoc Assignment Later)</option>
              {availableDevices.map(id => (
                <option key={id} value={id}>
                  {id} - {devices[id]?.deviceName || 'Node'}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Only unassigned nodes are visible. Go to Node Manager to register new nodes.</span>
            </p>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Clinical Admissions Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Admitted post-delivery monitoring. Monitor vitals closely for postpartum bleeding warning signs."
              rows={4}
              className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl p-4 focus:outline-none focus:border-brand-purple"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-3.5 rounded-xl text-xs shadow-md shadow-brand-purple/20 transition-all hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Register Patient'}</span>
            </button>
            <Link
              to="/patients"
              className="flex-1 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-xs transition-colors"
            >
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
