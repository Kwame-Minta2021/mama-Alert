import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { Cpu, Plus, Radio, Battery, Clock, CheckCircle2, AlertTriangle, Hammer, Link2, Link2Off } from 'lucide-react';

export default function Devices() {
  const { devices, patients, registerDevice, updatePatient, useLocalSimulation } = useLiveMonitoring();
  const [newDevId, setNewDevId] = useState('');
  const [newDevName, setNewDevName] = useState('');
  const [newFirmware, setNewFirmware] = useState('1.2.0');
  const [showAddForm, setShowAddForm] = useState(false);

  const deviceList = Object.keys(devices).map(key => ({
    id: key,
    ...devices[key]
  }));

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!newDevId || !newDevName) {
      alert("Please fill in Device ID and Device Name.");
      return;
    }
    
    try {
      await registerDevice({
        deviceId: newDevId,
        deviceName: newDevName,
        firmwareVersion: newFirmware
      });
      setNewDevId('');
      setNewDevName('');
      setShowAddForm(false);
      alert("ESP32 Device Node registered successfully.");
    } catch (err) {
      alert("Failed to register device: " + err.message);
    }
  };

  const handleUnassign = async (patientId) => {
    if (window.confirm("Are you sure you want to unassign this device from the patient? Telemetry will stop.")) {
      await updatePatient(patientId, { deviceId: '' });
      alert("Device unassigned from patient.");
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Node Manager</h1>
          <p className="text-xs text-slate-400 mt-1">Register and map ESP32 hardware telemetry nodes</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-brand-purple/20 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Register ESP32 Node</span>
        </button>
      </div>

      {/* Add Device Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-md">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Register New Node</h3>
          <form onSubmit={handleAddDevice} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">ESP32 Device ID *</label>
              <input
                type="text"
                value={newDevId}
                onChange={(e) => setNewDevId(e.target.value)}
                placeholder="ESP32_05"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-purple"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Node Name / Label *</label>
              <input
                type="text"
                value={newDevName}
                onChange={(e) => setNewDevName(e.target.value)}
                placeholder="MamaAlert Node 5"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-purple"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Firmware version</label>
              <input
                type="text"
                value={newFirmware}
                onChange={(e) => setNewFirmware(e.target.value)}
                placeholder="1.2.0"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-purple text-white py-2 rounded-xl text-xs font-bold"
            >
              Save Hardware Node
            </button>
          </form>
        </div>
      )}

      {/* Devices Grid */}
      {deviceList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-2">
          <Cpu className="w-12 h-12 text-slate-200 mx-auto" />
          <h4 className="text-slate-700 font-bold text-sm">No Hardware Nodes Registered</h4>
          <p className="text-slate-400 text-xs">Click Register ESP32 Node to connect hardware to database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deviceList.map(dev => {
            const isOnline = dev.online && (Date.now() - dev.lastSeen < 60000 || useLocalSimulation);
            const patient = Object.values(patients).find(p => p.deviceId === dev.id && p.status === 'monitoring');
            const patientId = Object.keys(patients).find(k => patients[k].deviceId === dev.id && patients[k].status === 'monitoring');

            // Battery levels styles
            let batteryColor = 'text-emerald-500';
            if (dev.batteryLevel <= 15) batteryColor = 'text-red-500 animate-bounce';
            else if (dev.batteryLevel <= 40) batteryColor = 'text-amber-500';

            return (
              <div key={dev.id} className={`bg-white p-5 rounded-2xl border flex flex-col justify-between h-64 shadow-sm transition-all duration-200 hover:shadow-md ${
                isOnline ? 'border-slate-100' : 'border-slate-200 opacity-80'
              }`}>
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm leading-tight">{dev.deviceName}</h3>
                    <span className="font-mono text-[9px] text-slate-400 font-bold block mt-0.5">{dev.id}</span>
                  </div>

                  {/* Online state badge */}
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isOnline 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    <Radio className={`w-3 h-3 ${isOnline ? 'text-brand-green animate-pulse' : 'text-slate-400'}`} />
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                  </span>
                </div>

                {/* Telemetry info */}
                <div className="space-y-3.5 my-3 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Device Battery</span>
                    <span className={`flex items-center gap-1 font-bold ${batteryColor}`}>
                      <Battery className="w-4 h-4 shrink-0" />
                      <span>{dev.batteryLevel}%</span>
                    </span>
                  </div>

                  {/* Battery level progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        dev.batteryLevel <= 15 ? 'bg-red-500' : dev.batteryLevel <= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${dev.batteryLevel}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Pulse Sensor</span>
                    <span className={`font-bold ${dev.sensorStatus === 'Connected' ? 'text-brand-green' : 'text-amber-500 animate-pulse'}`}>
                      {dev.sensorStatus || 'Connected'}
                    </span>
                  </div>
                </div>

                {/* Mapping section */}
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                  {patient ? (
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Mapped Patient</span>
                        <Link to={`/patients/details/${patientId}`} className="font-bold text-slate-800 hover:text-brand-purple hover:underline truncate block w-28 mt-0.5">
                          {patient.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => handleUnassign(patientId)}
                        className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/50 py-1.5 px-3 rounded-lg border border-red-200/50 transition-colors"
                      >
                        <Link2Off className="w-3.5 h-3.5" />
                        <span>Unmap</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Mapped Patient</span>
                        <span className="text-slate-400 font-bold block mt-0.5">Available for placement</span>
                      </div>
                      <Link
                        to="/patients"
                        className="flex items-center gap-1 text-[10px] uppercase font-bold text-brand-purple bg-brand-purple/5 hover:bg-brand-purple/10 py-1.5 px-3 rounded-lg border border-brand-purple/20 transition-all"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Map Node</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Footer sync */}
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold border-t border-slate-50 mt-2.5 pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Sync: {isOnline ? new Date(dev.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Offline'}</span>
                  </span>
                  <span>FW: {dev.firmwareVersion || '1.2.0'}</span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
