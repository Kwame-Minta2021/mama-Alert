import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mamaalert_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mamaalert_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mamaalert_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Fallback demo user configurations
  const DEMO_USERS = {
    "nurse@mamaalert.org": { name: "Nurse Joyce Osei", role: "Midwife/Nurse", clinic: "Kuntanase CHPS Compound", phone: "+233 24 123 4567" },
    "admin@mamaalert.org": { name: "Admin Michael Mensah", role: "Clinic Administrator", clinic: "Kuntanase CHPS Compound", phone: "+233 20 987 6543" },
    "supervisor@mamaalert.org": { name: "Dr. Abigail Boateng", role: "District Health Supervisor", clinic: "Bosomtwe District Health Dept", phone: "+233 27 555 1234" },
    "sysadmin@mamaalert.org": { name: "System Admin Eric Appiah", role: "System Admin", clinic: "Headquarters", phone: "+233 54 888 9999" }
  };

  useEffect(() => {
    // Check if we already have a logged-in demo user in localStorage
    const savedDemoUser = localStorage.getItem('mamaalert_demo_user');
    if (savedDemoUser) {
      const user = JSON.parse(savedDemoUser);
      setCurrentUser(user);
      setUserProfile(user);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          // Fetch user profile from Realtime Database
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUserProfile(snapshot.val());
          } else {
            // If user authenticated but profile is missing, create a default midwife profile
            const newProfile = {
              name: user.displayName || user.email.split('@')[0],
              email: user.email,
              role: "Midwife/Nurse",
              clinic: "General Clinic",
              phone: ""
            };
            await set(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.warn("Firebase Database error during profile load. Defaulting to local fallback profile.", error);
          setUserProfile({
            name: user.email.split('@')[0],
            email: user.email,
            role: "Midwife/Nurse",
            clinic: "General Clinic (Demo Profile)",
            phone: ""
          });
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Firebase auth login
  async function login(email, password) {
    // Check for demo login first
    if (DEMO_USERS[email] && password === 'demo1234') {
      const demoUser = {
        uid: `demo_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
        email: email,
        ...DEMO_USERS[email]
      };
      localStorage.setItem('mamaalert_demo_user', JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      setUserProfile(demoUser);
      setIsDemoMode(true);
      return demoUser;
    }

    // Standard Firebase Auth login
    setIsDemoMode(false);
    localStorage.removeItem('mamaalert_demo_user');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  // Firebase auth register
  async function register(email, password, name, role, clinic, phone) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save profile to RTDB
    const userRef = ref(db, `users/${user.uid}`);
    const profile = { name, email, role, clinic, phone };
    await set(userRef, profile);
    
    setUserProfile(profile);
    setIsDemoMode(false);
    localStorage.removeItem('mamaalert_demo_user');
    return user;
  }

  // Logout
  async function logout() {
    if (isDemoMode) {
      localStorage.removeItem('mamaalert_demo_user');
      setCurrentUser(null);
      setUserProfile(null);
      setIsDemoMode(false);
      return;
    }
    await signOut(auth);
  }

  // Forgot password
  async function resetPassword(email) {
    if (DEMO_USERS[email]) {
      alert("Password reset is disabled for Demo users. The demo password is: demo1234");
      return;
    }
    await sendPasswordResetEmail(auth, email);
  }

  const value = {
    currentUser,
    userProfile,
    isDemoMode,
    darkMode,
    toggleDarkMode,
    login,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
