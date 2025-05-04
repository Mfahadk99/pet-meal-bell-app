
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Meal = {
  id: string;
  name: string;
  time: string; // Format: HH:MM
  completed: boolean;
  date: string; // Format: YYYY-MM-DD
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

type MealContextType = {
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id' | 'completed'>) => Promise<void>;
  updateMeal: (id: string, meal: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  completeMeal: (id: string) => Promise<void>;
  scheduledMeals: Meal[];
  upcomingMeal: Meal | null;
  historyMeals: Meal[];
  todayMeals: Meal[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
};

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [upcomingMeal, setUpcomingMeal] = useState<Meal | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch meals from Supabase
  const { 
    data: meals = [], 
    isLoading, 
    isError, 
    refetch: refetchMeals 
  } = useQuery({
    queryKey: ['meals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_meals')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) {
        throw new Error(`Error fetching meals: ${error.message}`);
      }
      
      return data as Meal[];
    }
  });

  // Mutations for CRUD operations
  const addMealMutation = useMutation({
    mutationFn: async (newMeal: Omit<Meal, 'id' | 'completed'>) => {
      const { data, error } = await supabase
        .from('pet_meals')
        .insert([{ 
          name: newMeal.name, 
          time: newMeal.time, 
          date: newMeal.date,
          notes: newMeal.notes || null,
          completed: false
        }])
        .select('*')
        .single();
      
      if (error) {
        throw new Error(`Error adding meal: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      toast({
        title: "Meal scheduled",
        description: "Your pet's meal has been scheduled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error scheduling meal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateMealMutation = useMutation({
    mutationFn: async ({ id, meal }: { id: string, meal: Partial<Meal> }) => {
      const { data, error } = await supabase
        .from('pet_meals')
        .update(meal)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        throw new Error(`Error updating meal: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating meal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pet_meals')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Error deleting meal: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      toast({
        title: "Meal deleted",
        description: "The meal has been removed from the schedule",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting meal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const completeMealMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('pet_meals')
        .update({ completed: true })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        throw new Error(`Error completing meal: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      toast({
        title: "Meal completed",
        description: "Great job feeding your pet!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error completing meal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Refetch function to manually trigger meal data refresh
  const refetch = async () => {
    await refetchMeals();
  };

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
          
          // Show a more prominent toast with Sonner
          sonnerToast(`Time for ${meal.name}!`, {
            description: "Your pet is waiting for their meal",
            action: {
              label: "Mark as Fed",
              onClick: () => completeMeal(meal.id)
            },
            duration: 10000
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

  // Add a meal
  const addMeal = async (meal: Omit<Meal, 'id' | 'completed'>) => {
    await addMealMutation.mutateAsync(meal);
  };

  // Update a meal
  const updateMeal = async (id: string, meal: Partial<Meal>) => {
    await updateMealMutation.mutateAsync({ id, meal });
  };

  // Delete a meal
  const deleteMeal = async (id: string) => {
    await deleteMealMutation.mutateAsync(id);
  };

  // Complete a meal
  const completeMeal = async (id: string) => {
    await completeMealMutation.mutateAsync(id);
  };

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
        todayMeals,
        isLoading,
        isError,
        refetch
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
