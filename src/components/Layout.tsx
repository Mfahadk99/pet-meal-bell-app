
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout: React.FC = () => {
  return (
    <div className="bg-pet-background min-h-screen pb-20">
      <Outlet />
      <Navigation />
    </div>
  );
};

export default Layout;
