import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LiveMonitoringProvider } from './context/LiveMonitoringContext';

// Layout components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AlertBanner from './components/AlertBanner';
import Simulator from './components/Simulator';
import AICopilotPanel from './components/AICopilotPanel';

// Page components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import PatientDetails from './pages/PatientDetails';
import LiveMonitoring from './pages/LiveMonitoring';
import Alerts from './pages/Alerts';
import AlertDetails from './pages/AlertDetails';
import Devices from './pages/Devices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150 transition-colors">
      {/* Sidebar navigation */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      
      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        {/* Scrolling Active Alert Banner */}
        <AlertBanner />
        
        {/* Top Header bar */}
        <TopBar 
          onMenuClick={() => setMobileSidebarOpen(true)} 
          onAiClick={() => setAiCopilotOpen(!aiCopilotOpen)}
        />
        
        {/* Page Content viewport */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Collapsible ESP32 Simulator widget */}
        <Simulator />

        {/* AI Copilot Drawer */}
        <AICopilotPanel isOpen={aiCopilotOpen} onClose={() => setAiCopilotOpen(false)} />
      </div>
    </div>
  );
}

// Redirect if already logged in
function AuthRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <LiveMonitoringProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route 
              path="/login" 
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthRoute>
                  <Register />
                </AuthRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <AuthRoute>
                  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white space-y-4">
                    <div className="max-w-md bg-white text-slate-800 p-8 rounded-2xl shadow-xl">
                      <h2 className="text-xl font-bold mb-2">Password Reset Requested</h2>
                      <p className="text-xs text-slate-500 mb-4">
                        Please email the Clinic Administrator at <code className="bg-slate-100 px-1 py-0.5 rounded text-red-600 font-bold">admin@mamaalert.org</code> to request password overrides. Alternatively, utilize any of the quick-login demo accounts.
                      </p>
                      <Link to="/login" className="text-xs text-brand-purple font-bold hover:underline">
                        Return to Sign In
                      </Link>
                    </div>
                  </div>
                </AuthRoute>
              } 
            />

            {/* Protected Dashboard Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/live" element={<ProtectedRoute><LiveMonitoring /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/patients/add" element={<ProtectedRoute><AddPatient /></ProtectedRoute>} />
            <Route path="/patients/details/:id" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/alerts/details/:id" element={<ProtectedRoute><AlertDetails /></ProtectedRoute>} />
            <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LiveMonitoringProvider>
    </AuthProvider>
  );
}
