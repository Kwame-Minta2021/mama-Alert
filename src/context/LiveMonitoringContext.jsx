import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ref, onValue, set, push, update, get } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const LiveMonitoringContext = createContext();

export function useLiveMonitoring() {
  return useContext(LiveMonitoringContext);
}

export function LiveMonitoringProvider({ children }) {
  const { currentUser, isDemoMode } = useAuth();
  const [patients, setPatients] = useState({});
  const [devices, setDevices] = useState({});
  const [liveReadings, setLiveReadings] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [interventions, setInterventions] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [useLocalSimulation, setUseLocalSimulation] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalPatients: 0,
    mothersCount: 0,
    newbornsCount: 0,
    emergencyCount: 0,
    warningCount: 0,
    normalCount: 0,
    offlineCount: 0,
    criticalBatteryCount: 0
  });

  const alarmIntervalRef = useRef(null);

  // Helper to play synthesized beep sounds (so no assets/files are needed!)
  const playAlarmSound = (severity) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      if (severity === 'Emergency') {
        // Clinical rapid alarm: 2 rapid high-pitched beeps
        const playBeep = (delay) => {
          setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(980, audioCtx.currentTime); // High pitch WIE
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          }, delay);
        };
        playBeep(0);
        playBeep(250);
        playBeep(500);
      } else if (severity === 'Warning') {
        // Clinical slow warning: 1 mid-pitched beep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 pitch
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      }
    } catch (e) {
      console.warn("Audio Context failed to initialize or execute", e);
    }
  };

  // Mock initial database for offline demo or simulation mode
  const MOCK_INITIAL_DATA = {
    patients: {
      "patient_1": { name: "Ama Serwaa", patientType: "Mother", age: 26, guardianName: "Kofi Serwaa", guardianPhone: "+233244111222", bedNumber: "Bed 01", ward: "Maternity Ward A", assignedNurse: "Nurse Joyce Osei", deviceId: "ESP32_01", status: "monitoring", createdAt: Date.now() - 36000000 },
      "patient_2": { name: "Baby Serwaa", patientType: "Newborn", age: 0, guardianName: "Ama Serwaa", guardianPhone: "+233244111222", bedNumber: "Cot 01", ward: "Maternity Ward A", assignedNurse: "Nurse Joyce Osei", deviceId: "ESP32_02", status: "monitoring", createdAt: Date.now() - 32000000 },
      "patient_3": { name: "Esi Mensah", patientType: "Mother", age: 31, guardianName: "Kwesi Mensah", guardianPhone: "+23320987654", bedNumber: "Bed 02", ward: "Maternity Ward A", assignedNurse: "Nurse Joyce Osei", deviceId: "ESP32_03", status: "monitoring", createdAt: Date.now() - 18000000 },
      "patient_4": { name: "Fatima Alhassan", patientType: "Mother", age: 19, guardianName: "Haruna Alhassan", guardianPhone: "+23354123456", bedNumber: "Bed 04", ward: "Maternity Ward B", assignedNurse: "Nurse Joyce Osei", deviceId: "ESP32_04", status: "discharge", createdAt: Date.now() - 50000000 }
    },
    devices: {
      "ESP32_01": { deviceName: "MamaAlert Node 1", assignedPatientId: "patient_1", batteryLevel: 88, online: true, lastSeen: Date.now(), firmwareVersion: "1.2.0", sensorStatus: "Connected" },
      "ESP32_02": { deviceName: "MamaAlert Node 2", assignedPatientId: "patient_2", batteryLevel: 12, online: true, lastSeen: Date.now(), firmwareVersion: "1.2.0", sensorStatus: "Connected" },
      "ESP32_03": { deviceName: "MamaAlert Node 3", assignedPatientId: "patient_3", batteryLevel: 94, online: false, lastSeen: Date.now() - 1000000, firmwareVersion: "1.2.0", sensorStatus: "Connected" },
      "ESP32_04": { deviceName: "MamaAlert Node 4", assignedPatientId: "patient_4", batteryLevel: 100, online: false, lastSeen: Date.now() - 20000000, firmwareVersion: "1.2.0", sensorStatus: "Disconnected" }
    },
    liveReadings: {
      "ESP32_01": { heartRate: 82, spo2: 98, temperature: 36.8, batteryLevel: 88, status: "Normal", alertLevel: "Normal", timestamp: Date.now() },
      "ESP32_02": { heartRate: 140, spo2: 97, temperature: 37.1, batteryLevel: 12, status: "Normal", alertLevel: "Normal", timestamp: Date.now() },
      "ESP32_03": { heartRate: 75, spo2: 96, temperature: 36.6, batteryLevel: 94, status: "Normal", alertLevel: "Normal", timestamp: Date.now() - 1000000 }
    },
    alerts: [
      { id: "alert_101", patientId: "patient_2", deviceId: "ESP32_02", alertType: "Low Battery", severity: "Warning", message: "Device battery level critical (12%)", triggeredAt: Date.now() - 600000, status: "New", notes: "" }
    ],
    interventions: {}
  };

  // Sync state with either Realtime Database or Local Simulation data
  useEffect(() => {
    // If we detect config uses placeholders or isDemoMode, automatically default to Local Simulation
    const hasFirebaseUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL && !import.meta.env.VITE_FIREBASE_DATABASE_URL.includes("DummyKey");
    
    if (useLocalSimulation || isDemoMode || !hasFirebaseUrl) {
      setUseLocalSimulation(true);
      // Load initial mock data if not set in local variables
      const loadLocalData = () => {
        let stored = localStorage.getItem('mamaalert_mock_data');
        if (!stored) {
          localStorage.setItem('mamaalert_mock_data', JSON.stringify(MOCK_INITIAL_DATA));
          stored = JSON.stringify(MOCK_INITIAL_DATA);
        }
        const data = JSON.parse(stored);
        setPatients(data.patients || {});
        setDevices(data.devices || {});
        setLiveReadings(data.liveReadings || {});
        setAlerts(data.alerts || []);
        setInterventions(data.interventions || {});
      };
      
      loadLocalData();
      
      // Periodic refresh and simulated drift for live metrics!
      const mockInterval = setInterval(() => {
        const stored = localStorage.getItem('mamaalert_mock_data');
        if (!stored) return;
        const data = JSON.parse(stored);
        
        // Simulating drift for online devices
        Object.keys(data.devices).forEach(devId => {
          if (data.devices[devId].online) {
            // update reading
            if (!data.liveReadings[devId]) {
              data.liveReadings[devId] = { heartRate: 80, spo2: 97, temperature: 36.7, batteryLevel: 50, timestamp: Date.now() };
            }
            
            // Random fluctuations
            const hrDrift = Math.floor(Math.random() * 5) - 2;
            const spo2Drift = Math.floor(Math.random() * 3) - 1;
            
            data.liveReadings[devId].heartRate = Math.max(50, Math.min(180, data.liveReadings[devId].heartRate + hrDrift));
            
            // Check boundaries
            let actualSpo2 = data.liveReadings[devId].spo2 + spo2Drift;
            actualSpo2 = Math.max(70, Math.min(100, actualSpo2));
            data.liveReadings[devId].spo2 = actualSpo2;
            data.liveReadings[devId].timestamp = Date.now();
            
            // Update device battery and uptime
            data.devices[devId].lastSeen = Date.now();
            data.liveReadings[devId].batteryLevel = data.devices[devId].batteryLevel;
            
            // Evaluate limits and create alert alerts automatically
            let status = "Normal";
            let alertLevel = "Normal";
            let message = "";
            let triggerAlert = false;
            
            const pat = Object.values(data.patients).find(p => p.deviceId === devId && p.status === 'monitoring');
            
            if (pat) {
              const age = pat.age;
              const isNewborn = pat.patientType === 'Newborn';
              const hr = data.liveReadings[devId].heartRate;
              const spo2 = data.liveReadings[devId].spo2;
              
              if (spo2 < 90 || (isNewborn && (hr < 90 || hr > 190)) || (!isNewborn && (hr < 50 || hr > 130))) {
                status = "Emergency";
                alertLevel = "Emergency";
                message = `Critical Vitals! SpO2: ${spo2}%, HR: ${hr} bpm`;
                triggerAlert = true;
              } else if ((spo2 >= 90 && spo2 < 95) || (isNewborn && (hr < 110 || hr > 170)) || (!isNewborn && (hr < 60 || hr > 110))) {
                status = "Warning";
                alertLevel = "Warning";
                message = `Abnormal Vitals. SpO2: ${spo2}%, HR: ${hr} bpm`;
                triggerAlert = true;
              }
              
              data.liveReadings[devId].status = status;
              data.liveReadings[devId].alertLevel = alertLevel;
              
              if (triggerAlert) {
                // Check if there is already an active alert of this type for this patient
                const hasActive = data.alerts.some(a => a.patientId === pat.patientId && a.deviceId === devId && a.status === 'New' && a.severity === alertLevel);
                if (!hasActive) {
                  const newAlert = {
                    id: `alert_${Date.now()}`,
                    patientId: Object.keys(data.patients).find(k => data.patients[k] === pat),
                    deviceId: devId,
                    alertType: alertLevel === 'Emergency' ? 'Critical Vitals' : 'Abnormal Vitals',
                    severity: alertLevel,
                    message: message,
                    triggeredAt: Date.now(),
                    status: "New",
                    notes: ""
                  };
                  data.alerts.unshift(newAlert);
                }
              }
            }
          }
        });
        
        localStorage.setItem('mamaalert_mock_data', JSON.stringify(data));
        
        // Push state update
        setPatients(data.patients || {});
        setDevices(data.devices || {});
        setLiveReadings(data.liveReadings || {});
        setAlerts(data.alerts || []);
        setInterventions(data.interventions || {});
      }, 5000);
      
      return () => clearInterval(mockInterval);
    } else {
      // Connect standard Firebase RTDB Listeners
      const patientsRef = ref(db, 'patients');
      const devicesRef = ref(db, 'devices');
      const liveRef = ref(db, 'liveReadings');
      const alertsRef = ref(db, 'alerts');
      const interRef = ref(db, 'interventions');

      const unsubP = onValue(patientsRef, (snap) => setPatients(snap.val() || {}));
      const unsubD = onValue(devicesRef, (snap) => setDevices(snap.val() || {}));
      const unsubL = onValue(liveRef, (snap) => setLiveReadings(snap.val() || {}));
      const unsubA = onValue(alertsRef, (snap) => {
        const val = snap.val() || {};
        const alertsList = Object.keys(val).map(key => ({ id: key, ...val[key] }));
        // Sort newest first
        alertsList.sort((a, b) => b.triggeredAt - a.triggeredAt);
        setAlerts(alertsList);
      });
      const unsubI = onValue(interRef, (snap) => setInterventions(snap.val() || {}));

      return () => {
        unsubP();
        unsubD();
        unsubL();
        unsubA();
        unsubI();
      };
    }
  }, [useLocalSimulation, isDemoMode]);

  // Alert audio loop logic
  useEffect(() => {
    // Check if there are any active, unacknowledged emergencies
    const activeEmergencies = alerts.filter(a => a.status === 'New' && a.severity === 'Emergency');
    const activeWarnings = alerts.filter(a => a.status === 'New' && a.severity === 'Warning');
    
    if (activeEmergencies.length > 0) {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
      // Play immediately
      playAlarmSound('Emergency');
      // Set repeating interval
      alarmIntervalRef.current = setInterval(() => {
        playAlarmSound('Emergency');
      }, 3000);
    } else if (activeWarnings.length > 0) {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
      playAlarmSound('Warning');
      alarmIntervalRef.current = setInterval(() => {
        playAlarmSound('Warning');
      }, 6000);
    } else {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    }

    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, [alerts, soundEnabled]);

  // Compute statistics whenever database changes
  useEffect(() => {
    const activeM = Object.values(patients).filter(p => p.status === 'monitoring');
    const totalP = activeM.length;
    const mothers = activeM.filter(p => p.patientType === 'Mother').length;
    const newborns = activeM.filter(p => p.patientType === 'Newborn').length;

    let normal = 0;
    let warning = 0;
    let emergency = 0;
    let offline = 0;
    let critBat = 0;

    activeM.forEach(pat => {
      const devId = pat.deviceId;
      const dev = devices[devId];
      
      // If offline
      if (!dev || !dev.online || (Date.now() - dev.lastSeen > 60000)) {
        offline++;
      } else {
        const reading = liveReadings[devId];
        if (reading) {
          if (reading.alertLevel === 'Emergency') emergency++;
          else if (reading.alertLevel === 'Warning') warning++;
          else normal++;
        } else {
          normal++; // fallback
        }
      }

      if (dev && dev.batteryLevel <= 15) {
        critBat++;
      }
    });

    setStats({
      totalPatients: totalP,
      mothersCount: mothers,
      newbornsCount: newborns,
      emergencyCount: emergency,
      warningCount: warning,
      normalCount: normal,
      offlineCount: offline,
      criticalBatteryCount: critBat
    });
  }, [patients, devices, liveReadings]);

  // Write actions
  const saveLocalData = (data) => {
    localStorage.setItem('mamaalert_mock_data', JSON.stringify(data));
    setPatients(data.patients || {});
    setDevices(data.devices || {});
    setLiveReadings(data.liveReadings || {});
    setAlerts(data.alerts || []);
    setInterventions(data.interventions || {});
  };

  // Register patient
  const registerPatient = async (patientData) => {
    const patientId = `patient_${Date.now()}`;
    const formattedPatient = {
      ...patientData,
      status: 'monitoring',
      createdAt: Date.now()
    };

    if (useLocalSimulation) {
      const stored = localStorage.getItem('mamaalert_mock_data');
      const data = stored ? JSON.parse(stored) : MOCK_INITIAL_DATA;
      data.patients[patientId] = formattedPatient;
      
      // Assign patient to device if specified
      if (formattedPatient.deviceId && data.devices[formattedPatient.deviceId]) {
        data.devices[formattedPatient.deviceId].assignedPatientId = patientId;
      }
      
      saveLocalData(data);
      return patientId;
    } else {
      await set(ref(db, `patients/${patientId}`), formattedPatient);
      if (formattedPatient.deviceId) {
        await update(ref(db, `devices/${formattedPatient.deviceId}`), {
          assignedPatientId: patientId
        });
      }
      return patientId;
    }
  };

  // Update patient details
  const updatePatient = async (patId, updatedData) => {
    if (useLocalSimulation) {
      const stored = localStorage.getItem('mamaalert_mock_data');
      const data = stored ? JSON.parse(stored) : MOCK_INITIAL_DATA;
      
      const oldDeviceId = data.patients[patId]?.deviceId;
      const newDeviceId = updatedData.deviceId;
      
      data.patients[patId] = { ...data.patients[patId], ...updatedData };
      
      // Clear old device mapping
      if (oldDeviceId && oldDeviceId !== newDeviceId && data.devices[oldDeviceId]) {
        data.devices[oldDeviceId].assignedPatientId = "";
      }
      // Set new device mapping
      if (newDeviceId && data.devices[newDeviceId]) {
        data.devices[newDeviceId].assignedPatientId = patId;
      }
      
      saveLocalData(data);
    } else {
      // Fetch current patient details to know the old device ID
      const patRef = ref(db, `patients/${patId}`);
      const snap = await get(patRef);
      const val = snap.val() || {};
      const oldDeviceId = val.deviceId;
      const newDeviceId = updatedData.deviceId;
      
      await update(patRef, updatedData);
      
      // Sync devices table in Firebase RTDB
      if (oldDeviceId && oldDeviceId !== newDeviceId) {
        await update(ref(db, `devices/${oldDeviceId}`), { assignedPatientId: "" });
      }
      if (newDeviceId) {
        await update(ref(db, `devices/${newDeviceId}`), { assignedPatientId: patId });
      }
    }
  };

  // Register device
  const registerDevice = async (deviceData) => {
    const devId = deviceData.deviceId;
    const formattedDevice = {
      deviceName: deviceData.deviceName,
      assignedPatientId: "",
      batteryLevel: 100,
      online: true,
      lastSeen: Date.now(),
      firmwareVersion: deviceData.firmwareVersion || "1.0.0",
      sensorStatus: "Connected"
    };

    if (useLocalSimulation) {
      const stored = localStorage.getItem('mamaalert_mock_data');
      const data = stored ? JSON.parse(stored) : MOCK_INITIAL_DATA;
      data.devices[devId] = formattedDevice;
      saveLocalData(data);
    } else {
      await set(ref(db, `devices/${devId}`), formattedDevice);
    }
  };

  // Trigger simulated readings directly
  const writeSimulationReadings = async (devId, hr, spo2, temp, alertLvl) => {
    const reading = {
      heartRate: hr,
      spo2: spo2,
      temperature: temp,
      batteryLevel: devices[devId]?.batteryLevel || 100,
      status: alertLvl,
      alertLevel: alertLvl,
      timestamp: Date.now()
    };

    if (useLocalSimulation) {
      const stored = localStorage.getItem('mamaalert_mock_data');
      const data = stored ? JSON.parse(stored) : MOCK_INITIAL_DATA;
      data.liveReadings[devId] = reading;
      if (data.devices[devId]) {
        data.devices[devId].online = true;
        data.devices[devId].lastSeen = Date.now();
      }

      // If emergency alert is triggered, write it to alert logs
      if (alertLvl !== 'Normal') {
        const patId = Object.keys(data.patients).find(k => data.patients[k].deviceId === devId && data.patients[k].status === 'monitoring');
        if (patId) {
          const hasActive = data.alerts.some(a => a.patientId === patId && a.deviceId === devId && a.status === 'New' && a.severity === alertLvl);
          if (!hasActive) {
            const newAlert = {
              id: `alert_${Date.now()}`,
              patientId: patId,
              deviceId: devId,
              alertType: alertLvl === 'Emergency' ? 'Critical Vitals' : 'Abnormal Vitals',
              severity: alertLvl,
              message: `${alertLvl} threshold breached! HR: ${hr} bpm, SpO2: ${spo2}%`,
              triggeredAt: Date.now(),
              status: "New",
              notes: ""
            };
            data.alerts.unshift(newAlert);
          }
        }
      }

      saveLocalData(data);
    } else {
      await set(ref(db, `liveReadings/${devId}`), reading);
      await update(ref(db, `devices/${devId}`), {
        online: true,
        lastSeen: Date.now()
      });

      if (alertLvl !== 'Normal') {
        const patientsRef = ref(db, 'patients');
        const patSnap = await get(patientsRef);
        const pats = patSnap.val() || {};
        const patId = Object.keys(pats).find(k => pats[k].deviceId === devId && pats[k].status === 'monitoring');
        
        if (patId) {
          const alertsRef = ref(db, 'alerts');
          const newAlertRef = push(alertsRef);
          await set(newAlertRef, {
            patientId: patId,
            deviceId: devId,
            alertType: alertLvl === 'Emergency' ? 'Critical Vitals' : 'Abnormal Vitals',
            severity: alertLvl,
            message: `${alertLvl} threshold breached! HR: ${hr} bpm, SpO2: ${spo2}%`,
            triggeredAt: Date.now(),
            status: "New",
            notes: ""
          });
        }
      }
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = async (alertId, nurseName) => {
    const timestamp = Date.now();
    if (useLocalSimulation) {
      const stored = localStorage.getItem('mamaalert_mock_data');
      const data = stored ? JSON.parse(stored) : MOCK_INITIAL_DATA;
      const alertIdx = data.alerts.findIndex(a => a.id === alertId);
      if (alertIdx > -1) {
        data.alerts[alertIdx].acknowledgedAt = timestamp;
        data.alerts[alertIdx].acknowledgedBy = nurseName;
        data.alerts[alertIdx].status = "Acknowledged";
      }
      saveLocalData(data);
    } else {
      await update(ref(db, `alerts/${alertId}`), {
        acknowledgedAt: timestamp,
        acknowledgedBy: nurseName,
        status: "Acknowledged"
      });
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId, nurseName, notes, interventionNote = "") => {
    const timestamp = Date.now();
    
    if (useLocalSimulation) {
      const stored = localStorage.getItem('mamaalert_mock_data');
      const data = stored ? JSON.parse(stored) : MOCK_INITIAL_DATA;
      const alertIdx = data.alerts.findIndex(a => a.id === alertId);
      if (alertIdx > -1) {
        const alertObj = data.alerts[alertIdx];
        alertObj.resolvedAt = timestamp;
        alertObj.resolvedBy = nurseName;
        alertObj.status = "Resolved";
        alertObj.notes = notes;

        // Log intervention
        if (interventionNote) {
          const interId = `inter_${Date.now()}`;
          data.interventions[interId] = {
            alertId: alertId,
            patientId: alertObj.patientId,
            nurseId: currentUser?.uid || "nurse_demo",
            note: interventionNote,
            createdAt: timestamp
          };
        }
      }
      saveLocalData(data);
    } else {
      await update(ref(db, `alerts/${alertId}`), {
        resolvedAt: timestamp,
        resolvedBy: nurseName,
        status: "Resolved",
        notes: notes
      });

      if (interventionNote) {
        const interRef = ref(db, 'interventions');
        const newInterRef = push(interRef);
        
        // Find alert details to get patient ID
        const alertSnap = await get(ref(db, `alerts/${alertId}`));
        const alertData = alertSnap.val() || {};
        
        await set(newInterRef, {
          alertId: alertId,
          patientId: alertData.patientId || "",
          nurseId: currentUser?.uid || "nurse_firebase",
          note: interventionNote,
          createdAt: timestamp
        });
      }
    }
  };

  // Escalate alert
  const escalateAlert = async (alertId, nurseName, note) => {
    const timestamp = Date.now();
    const escalationText = `[ESCALATED BY ${nurseName.toUpperCase()} AT ${new Date(timestamp).toLocaleTimeString()}]: ${note}`;
    
    if (useLocalSimulation) {
      const stored = localStorage.getItem('mamaalert_mock_data');
      const data = stored ? JSON.parse(stored) : MOCK_INITIAL_DATA;
      const alertIdx = data.alerts.findIndex(a => a.id === alertId);
      if (alertIdx > -1) {
        const currentNotes = data.alerts[alertIdx].notes || "";
        data.alerts[alertIdx].notes = currentNotes ? `${currentNotes}\n${escalationText}` : escalationText;
        data.alerts[alertIdx].severity = "Emergency"; // Escalate warnings to emergencies
      }
      saveLocalData(data);
    } else {
      const alertRef = ref(db, `alerts/${alertId}`);
      const snap = await get(alertRef);
      const val = snap.val() || {};
      const currentNotes = val.notes || "";
      await update(alertRef, {
        notes: currentNotes ? `${currentNotes}\n${escalationText}` : escalationText,
        severity: "Emergency"
      });
    }
  };

  const value = {
    patients,
    devices,
    liveReadings,
    alerts,
    interventions,
    stats,
    soundEnabled,
    setSoundEnabled,
    useLocalSimulation,
    setUseLocalSimulation,
    registerPatient,
    updatePatient,
    registerDevice,
    writeSimulationReadings,
    acknowledgeAlert,
    resolveAlert,
    escalateAlert
  };

  return (
    <LiveMonitoringContext.Provider value={value}>
      {children}
    </LiveMonitoringContext.Provider>
  );
}
