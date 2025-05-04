
import React, { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import Dashboard from './Dashboard';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  // Check if we've shown the splash screen before
  useEffect(() => {
    const hasShownSplash = localStorage.getItem('splashShown');
    if (hasShownSplash) {
      setShowSplash(false);
    } else {
      // If it's the first visit, set the flag after showing splash
      const timer = setTimeout(() => {
        localStorage.setItem('splashShown', 'true');
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <Dashboard />
      )}
    </>
  );
};

export default Index;
