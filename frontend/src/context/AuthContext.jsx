import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, DEFAULT_DEMO_USERS } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // User-specific collections
  const [userSavedVillages, setUserSavedVillages] = useState([
    {
      id: 'PB-PAT-001',
      name: 'Kalyan',
      district: 'Patiala',
      state: 'Punjab',
      savedAt: 'Today',
      tier: 'Drone Survey + GIS Cadastral (Pilot)',
    },
    {
      id: 'MH-AHM-002',
      name: 'Ralegan Siddhi',
      district: 'Ahmednagar',
      state: 'Maharashtra',
      savedAt: 'Yesterday',
      tier: 'Satellite GIS + DEM',
    },
  ]);

  const [userReports, setUserReports] = useState([]);
  const [userPlans, setUserPlans] = useState([]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((newUser) => {
      setUser(newUser);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const signedInUser = await authService.signInWithGoogle();
      if (signedInUser) {
        setIsLoginModalOpen(false);
      }
      return signedInUser;
    } catch (e) {
      console.error('Google sign-in error:', e);
      throw e;
    }
  };

  const loginDemo = (roleKey = 'OFFICER') => {
    const signedInUser = authService.signInDemo(roleKey);
    setIsLoginModalOpen(false);
    return signedInUser;
  };

  const logout = () => {
    authService.signOut();
    setIsProfileDrawerOpen(false);
  };

  const switchRole = (newRole) => {
    authService.switchRole(newRole);
  };

  const saveVillage = (vMeta) => {
    setUserSavedVillages((prev) => {
      if (prev.some((v) => v.id === vMeta.id)) return prev;
      return [
        {
          id: vMeta.id,
          name: vMeta.name,
          district: vMeta.district,
          state: vMeta.state,
          savedAt: 'Just now',
          tier: vMeta.dataTier?.label || 'Satellite + GIS',
        },
        ...prev,
      ];
    });
  };

  const addUserReport = (report) => {
    setUserReports((prev) => [report, ...prev]);
  };

  const addUserPlan = (plan) => {
    setUserPlans((prev) => [plan, ...prev]);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isProfileDrawerOpen,
    setIsProfileDrawerOpen,
    loginWithGoogle,
    loginDemo,
    logout,
    switchRole,
    userSavedVillages,
    saveVillage,
    userReports,
    addUserReport,
    userPlans,
    addUserPlan,
    authConfig: authService.getAuthConfig(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
