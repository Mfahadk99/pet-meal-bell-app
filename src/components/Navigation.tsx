
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home
    },
    {
      name: 'Schedule',
      path: '/scheduled',
      icon: Calendar
    },
    {
      name: 'History',
      path: '/history',
      icon: CalendarDays
    }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-10">
      <div className="container flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center"
            >
              <div 
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
                  isActive 
                    ? "bg-pet-primary text-white" 
                    : "text-pet-muted hover:bg-pet-primary/10"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span 
                className={cn(
                  "text-xs mt-1",
                  isActive ? "text-pet-primary font-medium" : "text-pet-muted"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
