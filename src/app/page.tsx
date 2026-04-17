
"use client";

import React, { useState, useEffect } from 'react';
import { AthleteData, Database } from '@/lib/types';
import { getDatabase, saveToDatabase, createDefaultAthlete } from '@/lib/store';
import { LoginView } from '@/components/auth/login-view';
import { CoachDashboard } from '@/components/coach/coach-dashboard';
import { AthleteDashboard } from '@/components/athlete/athlete-dashboard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userRole, setUserRole] = useState<'guest' | 'athlete' | 'coach'>('guest');
  const [currentAthleteName, setCurrentAthleteName] = useState<string | null>(null);
  const [viewingAthleteName, setViewingAthleteName] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogin = (role: 'athlete' | 'coach', name?: string) => {
    setUserRole(role);
    if (name) {
      const db = getDatabase();
      if (!db[name]) {
        saveToDatabase(name, createDefaultAthlete());
      }
      setCurrentAthleteName(name);
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    setCurrentAthleteName(null);
    setViewingAthleteName(null);
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (userRole === 'guest') {
    return <LoginView onLogin={handleLogin} />;
  }

  if (userRole === 'coach' && !viewingAthleteName) {
    return (
      <CoachDashboard 
        onViewAthlete={(name) => setViewingAthleteName(name)} 
        onLogout={handleLogout}
      />
    );
  }

  const activeAthleteName = (userRole === 'coach' ? viewingAthleteName : currentAthleteName) || '';

  return (
    <AthleteDashboard 
      athleteName={activeAthleteName}
      isCoachMode={userRole === 'coach'}
      onBackToCoachList={() => setViewingAthleteName(null)}
      onLogout={handleLogout}
    />
  );
}
