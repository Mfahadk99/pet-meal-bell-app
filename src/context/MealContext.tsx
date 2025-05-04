
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export type Meal = {
  id: string;
  name: string;
  time: string; // Format: HH:MM
  completed: boolean;
  date: string; // Format: YYYY-MM-DD
  notes?: string;
};

type MealContextType = {
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id' | 'completed'>) => void;
  updateMeal: (id: string, meal: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  completeMeal: (id: string) => void;
  scheduledMeals: Meal[];
  upcomingMeal: Meal | null;
  historyMeals: Meal[];
  todayMeals: Meal[];
};

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [upcomingMeal, setUpcomingMeal] = useState<Meal | null>(null);
  const { toast } = useToast();
  
  // Load meals from localStorage on mount
  useEffect(() => {
    const savedMeals = localStorage.getItem('pet-meals');
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals));
    }
  }, []);

  // Save meals to localStorage whenever meals change
  useEffect(() => {
    localStorage.setItem('pet-meals', JSON.stringify(meals));
  }, [meals]);

  // Check for upcoming meals
  useEffect(() => {
    const checkScheduledMeals = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // Filter for today's uncompleted meals
      const todaysScheduledMeals = meals.filter(
        meal => meal.date === today && !meal.completed
      );
      
      // Find the next meal that's coming up
      const nextMeal = todaysScheduledMeals.reduce((closest, meal) => {
        if (meal.time > currentTime && (!closest || meal.time < closest.time)) {
          return meal;
        }
        return closest;
      }, null as Meal | null);
      
      if (nextMeal) {
        setUpcomingMeal(nextMeal);
      } else {
        setUpcomingMeal(null);
      }
    };

    checkScheduledMeals();
    const intervalId = setInterval(checkScheduledMeals, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [meals]);

  // Check if any meal is due
  useEffect(() => {
    const checkMealAlerts = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      meals.forEach(meal => {
        if (meal.date === today && meal.time === currentTime && !meal.completed) {
          // It's time for a meal!
          toast({
            title: `Time to feed: ${meal.name}`,
            description: "Your pet's meal time is now!",
            duration: 10000,
          });
          
          // Play a sound
          const audio = new Audio('/meal-alarm.mp3');
          audio.play().catch(e => console.log('Audio play error:', e));
        }
      });
    };

    const intervalId = setInterval(checkMealAlerts, 20000);
    return () => clearInterval(intervalId);
  }, [meals, toast]);

  const addMeal = (meal: Omit<Meal, 'id' | 'completed'>) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
      completed: false,
    };
    
    setMeals(prev => [...prev, newMeal]);
    toast({
      title: "Meal scheduled",
      description: `${meal.name} has been scheduled for ${meal.time}`,
    });
  };

  const updateMeal = (id: string, updatedMeal: Partial<Meal>) => {
    setMeals(prev => 
      prev.map(meal => 
        meal.id === id ? { ...meal, ...updatedMeal } : meal
      )
    );
  };

  const deleteMeal = (id: string) => {
    setMeals(prev => prev.filter(meal => meal.id !== id));
    toast({
      title: "Meal deleted",
      description: "The meal has been removed from the schedule",
    });
  };

  const completeMeal = (id: string) => {
    setMeals(prev => 
      prev.map(meal => 
        meal.id === id ? { ...meal, completed: true } : meal
      )
    );
    toast({
      title: "Meal completed",
      description: "Great job feeding your pet!",
    });
  };

  // Get today's meals
  const todayMeals = meals.filter(
    meal => meal.date === new Date().toISOString().split('T')[0]
  );

  // Get scheduled (upcoming) meals
  const scheduledMeals = meals.filter(
    meal => {
      const today = new Date().toISOString().split('T')[0];
      const mealDate = new Date(meal.date);
      const now = new Date();
      return (
        (meal.date === today && !meal.completed) || 
        (mealDate > now && !meal.completed)
      );
    }
  ).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  // Get history meals (completed or past due)
  const historyMeals = meals.filter(
    meal => {
      const today = new Date().toISOString().split('T')[0];
      const mealDate = new Date(meal.date);
      const now = new Date();
      return meal.completed || mealDate < now;
    }
  ).sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.time.localeCompare(a.time);
  });

  return (
    <MealContext.Provider 
      value={{ 
        meals,
        addMeal, 
        updateMeal, 
        deleteMeal,
        completeMeal,
        scheduledMeals,
        upcomingMeal,
        historyMeals,
        todayMeals
      }}
    >
      {children}
    </MealContext.Provider>
  );
};

export const useMeals = () => {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
};
