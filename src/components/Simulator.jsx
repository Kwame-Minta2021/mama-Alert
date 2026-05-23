import React, { useState } from 'react';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { Play, PlayCircle, RefreshCw, X, Radio, ChevronDown, ChevronUp } from 'lucide-react';

export default function Simulator() {
  const { devices, writeSimulationReadings, useLocalSimulation, setUseLocalSimulation } = useLiveMonitoring();
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [customHr, setCustomHr] = useState(80);
  const [customSpo2, setCustomSpo2] = useState(98);
  const [customTemp, setCustomTemp] = useState(36.8);
  
  const onlineDevices = Object.keys(devices).filter(d => devices[d].online || useLocalSimulation);

  // Set default device
  if (!selectedDevice && onlineDevices.length > 0) {
    setSelectedDevice(onlineDevices[0]);
  }

  const triggerSimulation = (type) => {
    if (!selectedDevice) {
      alert('Please register or select a device first.');
      return;
    }

    let hr = 80;
    let spo2 = 98;
    let temp = 36.6;
    let status = 'Normal';

    if (type === 'Normal') {
      hr = Math.floor(Math.random() * 15) + 70; // 70-85
      spo2 = Math.floor(Math.random() * 3) + 97; // 97-99
      temp = parseFloat((Math.random() * 0.4 + 36.5).toFixed(1));
      status = 'Normal';
    } else if (type === 'Warning') {
      hr = Math.floor(Math.random() * 20) + 110; // 110-130
      spo2 = Math.floor(Math.random() * 4) + 90; // 90-93
      temp = parseFloat((Math.random() * 0.6 + 37.4).toFixed(1));
      status = 'Warning';
    } else if (type === 'Emergency') {
      hr = Math.floor(Math.random() * 30) + 140; // 140-170
      spo2 = Math.floor(Math.random() * 5) + 82; // 82-86
      temp = parseFloat((Math.random() * 1.2 + 38.2).toFixed(1));
      status = 'Emergency';
    } else if (type === 'Custom') {
      hr = parseInt(customHr);
      spo2 = parseInt(customSpo2);
      temp = parseFloat(customTemp);
      
      // Determine custom alert level
      if (spo2 < 90 || hr < 50 || hr > 130) {
        status = 'Emergency';
      } else if (spo2 < 95 || hr < 60 || hr > 110) {
        status = 'Warning';
      } else {
        status = 'Normal';
      }
    }

    writeSimulationReadings(selectedDevice, hr, spo2, temp, status);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 border border-slate-200 bg-white"
         style={{ width: isOpen ? '320px' : '150px' }}>
      
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-brand-green animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-wider">ESP32 Simulator</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </div>

      {/* Simulator Panel */}
      {isOpen && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Data Driver Connection
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUseLocalSimulation(false)}
                className={`py-1 rounded text-xs font-semibold border ${
                  !useLocalSimulation 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                Firebase RTDB
              </button>
              <button
                onClick={() => setUseLocalSimulation(true)}
                className={`py-1 rounded text-xs font-semibold border ${
                  useLocalSimulation 
                    ? 'bg-amber-50 text-amber-700 border-amber-300' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                Local Mock
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Select Simulated Bed Node
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-brand-purple"
            >
              {onlineDevices.length === 0 ? (
                <option value="">No Active Nodes</option>
              ) : (
                onlineDevices.map(id => (
                  <option key={id} value={id}>{id} ({devices[id]?.deviceName})</option>
                ))
              )}
            </select>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
              Inject Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerSimulation('Normal')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 rounded text-xs shadow-sm transition-colors"
              >
                Normal
              </button>
              <button
                onClick={() => triggerSimulation('Warning')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 rounded text-xs shadow-sm transition-colors"
              >
                Warning
              </button>
              <button
                onClick={() => triggerSimulation('Emergency')}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 rounded text-xs shadow-sm transition-colors"
              >
                Emergency
              </button>
            </div>
          </div>

          {/* Custom values injection */}
          <div className="border-t border-slate-100 pt-3 space-y-2.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400">
              Custom Telemetry
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">HR (bpm)</span>
                <input
                  type="number"
                  value={customHr}
                  onChange={(e) => setCustomHr(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1 text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">SpO2 (%)</span>
                <input
                  type="number"
                  value={customSpo2}
                  onChange={(e) => setCustomSpo2(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1 text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Temp (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  value={customTemp}
                  onChange={(e) => setCustomTemp(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1 text-center"
                />
              </div>
            </div>
            <button
              onClick={() => triggerSimulation('Custom')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current text-brand-green" />
              <span>Send Custom Payload</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
