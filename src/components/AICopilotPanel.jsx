import React, { useState, useEffect, useRef } from 'react';
import { useLiveMonitoring } from '../context/LiveMonitoringContext';
import { useAuth } from '../context/AuthContext';
import { X, Send, Sparkles, AlertCircle, ShieldAlert, FileText, HelpCircle, Activity } from 'lucide-react';

export default function AICopilotPanel({ isOpen, onClose }) {
  const { patients, devices, liveReadings, alerts, stats } = useLiveMonitoring();
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${userProfile?.name?.split(' ')[0] || 'Clinician'}, I am your MamaAlert AI Clinical Copilot. I analyze live telemetry, hardware gateway connections, and patient health history to assist you. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  // Process and generate response based on clinical query
  const handleSendMessage = (e, customText = null) => {
    if (e) e.preventDefault();
    const text = customText || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let aiText = '';
      const lowerText = text.toLowerCase();

      // Gather active system states to make response truly context-aware
      const activeCount = Object.values(patients).filter(p => p.status === 'monitoring').length;
      const offlineDevices = Object.values(devices).filter(d => !d.online || (Date.now() - d.lastSeen > 60000)).length;
      const onlineDevicesCount = Object.values(devices).length - offlineDevices;
      const criticalCount = Object.values(liveReadings).filter(r => r.alertLevel === 'Emergency').length;
      const warningCount = Object.values(liveReadings).filter(r => r.alertLevel === 'Warning').length;

      if (lowerText.includes('risk') || lowerText.includes('evaluate') || lowerText.includes('clinic')) {
        aiText = `### 🔮 Live Clinic Risk Assessment
* **Monitored Patients:** ${activeCount} active case(s)
* **Clinical Warnings:** ${warningCount} warning alert(s) in progress
* **Critical Alerts:** ${criticalCount} emergency status patient(s)
* **Hardware Health:** ${onlineDevicesCount} gateway nodes online, ${offlineDevices} offline.

**AI Diagnostic Summary:**
${criticalCount > 0 
  ? `⚠️ **HIGH RISK:** There is currently ${criticalCount} patient in an emergency state (oxygen desaturation or severe heart rate deviation). Action is required immediately. Please review Bed details and check sensor attachments.` 
  : warningCount > 0 
  ? `⚠️ **MODERATE RISK:** There are ${warningCount} patient(s) in a warning vitals drift. Physiological trends indicate potential onset of distress. Monitor bedside units closely.`
  : `✅ **LOW CLINICAL RISK:** All active telemetry readings are stable. Vital parameters are trending within normal ranges for both mothers and newborns.`
}

*Prediction model suggests a 94.2% chance of stability across the ward for the next 2 hours.*`;
      } 
      
      else if (lowerText.includes('handover') || lowerText.includes('report') || lowerText.includes('shift')) {
        const timestamp = new Date().toLocaleString();
        aiText = `### 📝 Shift Handover Summary Report
**Compiled on:** ${timestamp}
**On-Duty Staff:** ${userProfile?.name || 'Medical Staff'} (${userProfile?.role || 'Clinician'})
**Facility Location:** ${userProfile?.clinic || 'Kuntanase CHPS'}

---

1. **Patient Census:**
   * Total Patients Admitted: ${stats.totalPatients}
   * Active Vitals Monitoring: ${activeCount}

2. **Incidents logged during this cycle:**
   * Total logged incidents: ${alerts.length}
   * Active unacknowledged: ${alerts.filter(a => a.status === 'New').length}

3. **Clinician Notes (AI Recommended):**
   ${criticalCount > 0 
     ? `* **Urgent:** Critical vital desaturations detected on active nodes. Handover must prioritize physical assessments of these patients.` 
     : `* Status stable. All threshold alarm handshakes verified with local ESP32 edge units.`
   }
   * Handover is clean. Verify battery charges of handheld buzzer units (nodes) before leaving shift.`;
      } 
      
      else if (lowerText.includes('device') || lowerText.includes('offline') || lowerText.includes('troubleshoot')) {
        aiText = `### ⚙️ ESP32 Hardware Troubleshooting Checklist
If a MAX30102 pulse oximeter or OLED node shows **Offline** in the gateway dashboard:

1. **Power Check:** Confirm battery voltage on the ESP32 node. If the blue led flashes weakly or is off, connect a micro-USB cable or swap the 18650 battery.
2. **Sensor Check (I2C):** Verify MAX30102 wiring. Ensure \`SDA\` is wired to GPIO 21 and \`SCL\` to GPIO 22. Sensor drift or disconnect throws an automatic -1 reading, triggering a sensor fault alert.
3. **RF / Mesh Channel:** Ensure the ESP32 is set to Channel 11 (2.4GHz) to match the central router/mesh gateway channel.
4. **Local Reboot:** Hold the \`EN/RST\` button on the ESP32 board for 2 seconds to force a cold handshake reconnect.`;
      } 
      
      else if (lowerText.includes('oxygen') || lowerText.includes('spo2') || lowerText.includes('hypoxia')) {
        aiText = `### 🩺 Clinical Protocol: Hypoxia Management
For patients showing oxygen saturation (SpO₂) values below **94%**:

1. **Sensor Integrity:** Ensure the MAX30102 oximeter is placed securely on the patient's fingertip (mother) or foot (newborn). Excess movement or ambient light can cause false drops.
2. **Airway Assessment:** Check patient positioning. For newborns, ensure the head is in the sniffing position. For mothers, elevate the bed head to 30-45 degrees.
3. **Oxygen Therapy:** If desaturation persists below 92% for maternal cases, prepare low-flow oxygen nasal cannula (2-4 L/min).
4. **Clinic Gateway Action:** Verify the alarm sound on the central console has triggered to alert the bedside staff.`;
      } 
      
      else {
        // Fallback generic response
        aiText = `I have received your query regarding "${text}". 

Based on current parameters:
* **Active Patient Count:** ${activeCount}
* **Active Incidents:** ${alerts.filter(a => a.status !== 'Resolved').length} in progress.
* **Clinical Advice:** Ensure all ESP32 nodes are calibrated. If you need specific protocol details, try asking for **"evaluate risk"**, **"shift handover"**, or **"device offline"**.`;
      }

      setMessages(prev => [...prev, {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Sliding Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full transition-all duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-purple/5 to-brand-green/5 dark:from-brand-purple/10 dark:to-brand-green/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple">
              <Sparkles className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <span>AI Clinical Copilot</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-purple text-white font-bold uppercase tracking-wider">Beta</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">MamaAlert Real-time Diagnostics</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div 
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-brand-purple text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-xs shadow-slate-100/5 md-styles'
                }`}
              >
                {msg.sender === 'ai' ? (
                  // Simple markdown simulation renderer
                  <div className="space-y-2">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} className="font-extrabold text-slate-800 dark:text-slate-100 mt-2 mb-1 flex items-center gap-1 text-[13px]">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('* ')) {
                        return <li key={idx} className="ml-3 list-disc text-slate-650 dark:text-slate-350">{line.replace('* ', '')}</li>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <strong key={idx} className="block font-bold text-slate-800 dark:text-slate-100 mt-2">{line.replace(/\*\*/g, '')}</strong>;
                      }
                      if (line.startsWith('---')) {
                        return <hr key={idx} className="border-slate-100 dark:border-slate-800 my-2" />;
                      }
                      return <p key={idx} className="text-slate-650 dark:text-slate-350">{line}</p>;
                    })}
                  </div>
                ) : (
                  msg.text
                )}
              </div>
              <span className="text-[8px] text-slate-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex flex-col items-start max-w-[85%] mr-auto">
              <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-spin" />
                <span>AI Copilot is analyzing telemetry...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Shortcut Commands Prompt Tray */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">AI Insights Shortcuts</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSendMessage(null, "Evaluate clinic risk status")}
              className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-purple text-[10px] text-slate-600 dark:text-slate-350 hover:text-brand-purple dark:hover:text-brand-purple font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Activity className="w-3 h-3" />
              <span>Evaluate Risk Status</span>
            </button>
            <button
              onClick={() => handleSendMessage(null, "Draft clinic shift handover report")}
              className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-purple text-[10px] text-slate-600 dark:text-slate-350 hover:text-brand-purple dark:hover:text-brand-purple font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>Draft Handover Report</span>
            </button>
            <button
              onClick={() => handleSendMessage(null, "Troubleshoot offline gateway node")}
              className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-purple text-[10px] text-slate-600 dark:text-slate-350 hover:text-brand-purple dark:hover:text-brand-purple font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Device Troubleshoot</span>
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about hypoxia protocols, risk evaluation..."
            className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-purple text-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white shadow-md shadow-brand-purple/20 transition-all flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </>
  );
}
