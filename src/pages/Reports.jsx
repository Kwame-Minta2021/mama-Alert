import React from 'react';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FileText, Printer, Calendar, ShieldCheck, Activity, Award, TrendingUp } from 'lucide-react';

export default function Reports() {
  const { alerts, stats } = useLiveMonitoring();

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Mock reporting analytics data
  const weeklyAlertsData = [
    { day: 'Mon', Mothers: 2, Newborns: 1 },
    { day: 'Tue', Mothers: 0, Newborns: 3 },
    { day: 'Wed', Mothers: 4, Newborns: 2 },
    { day: 'Thu', Mothers: 1, Newborns: 1 },
    { day: 'Fri', Mothers: 3, Newborns: 0 },
    { day: 'Sat', Mothers: 0, Newborns: 2 },
    { day: 'Sun', Mothers: 2, Newborns: 3 },
  ];

  const responseTimeTrends = [
    { day: 'Mon', timeSec: 45 },
    { day: 'Tue', timeSec: 38 },
    { day: 'Wed', timeSec: 52 },
    { day: 'Thu', timeSec: 29 },
    { day: 'Fri', timeSec: 33 },
    { day: 'Sat', timeSec: 22 },
    { day: 'Sun', timeSec: 18 },
  ];

  const alertTypeData = [
    { name: 'Oxygen Deprivation', value: 42, color: '#ef4444' },
    { name: 'Cardiac Tachycardia', value: 28, color: '#f59e0b' },
    { name: 'Hardware Offline', value: 18, color: '#9ca3af' },
    { name: 'Low Battery Alert', value: 12, color: '#7c3aed' },
  ];

  // Calculate stats
  const totalResolved = alerts.filter(a => a.status === 'Resolved').length;
  const totalUnresolved = alerts.filter(a => a.status !== 'Resolved').length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto print:p-0 print:bg-white print:text-black">
      
      {/* Header (hidden in print, styled in print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Supervisor Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">Export clinical metrics and nurse response times reports</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow transition-colors"
        >
          <Printer className="w-4 h-4 text-brand-green" />
          <span>Export Printable Report</span>
        </button>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">MamaAlert Performance Report</h1>
        <p className="text-sm text-slate-500 mt-1.5">Facility: Kuntanase CHPS Compound • Date generated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total incidents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm print:border-slate-350">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incidents Logged</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{alerts.length}</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">{totalResolved} Resolved • {totalUnresolved} Active</span>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm print:border-slate-350">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Response Time</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">36s</h3>
          <span className="text-[10px] text-brand-green font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5 rotate-180" />
            <span>-15% faster since last week</span>
          </span>
        </div>

        {/* Device Node Uptime */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm print:border-slate-350">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Node Mesh Uptime</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">99.85%</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Target SLA: 99.0% minimum</span>
        </div>

        {/* Accountability Grade */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm print:border-slate-350">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Safety Grade</span>
          <h3 className="text-2xl font-black text-brand-purple mt-1 flex items-center gap-1">
            <Award className="w-6 h-6 text-brand-green animate-bounce" />
            <span>Grade A</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Calculated based on speed & uptime</span>
        </div>

      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly alert volume bar chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 print:border-slate-350">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Weekly Incident Distribution</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Categorized by Mothers vs Newborn admissions</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAlertsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Mothers" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Newborns" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Type breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 print:border-slate-350">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Incidents Classification</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Most common clinical triggers recorded</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {alertTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '9px' }} layout="vertical" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Response time line chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 print:border-slate-350">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Nurse Response Speed Trend</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Average time elapsed between alert trigger and nurse resolve check in seconds</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={responseTimeTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '10px' }} />
              <Line type="monotone" dataKey="timeSec" name="Response Time (seconds)" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
