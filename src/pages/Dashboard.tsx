
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MealCard from '@/components/MealCard';
import AddMealForm from '@/components/AddMealForm';
import { useMeals } from '@/context/MealContext';
import { AlarmClockCheck, CalendarClock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { todayMeals, upcomingMeal, completeMeal, deleteMeal } = useMeals();
  
  return (
    <div className="container mx-auto py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-pet-text">Pet Meal Bell</h1>
      
      <div className="mb-6">
        <AddMealForm />
      </div>
      
      {upcomingMeal && (
        <Card className="mb-6 border-pet-secondary border-2 shadow-lg animate-pulse-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-pet-secondary">
              <AlarmClockCheck className="mr-2 h-5 w-5" />
              Next Meal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MealCard 
              meal={upcomingMeal} 
              onComplete={() => completeMeal(upcomingMeal.id)}
              onDelete={() => deleteMeal(upcomingMeal.id)}
            />
          </CardContent>
        </Card>
      )}
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CalendarClock className="mr-2 h-5 w-5" />
            Today's Meals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayMeals.length > 0 ? (
            todayMeals.map(meal => (
              <MealCard 
                key={meal.id}
                meal={meal}
                onComplete={() => completeMeal(meal.id)}
                onDelete={() => deleteMeal(meal.id)}
              />
            ))
          ) : (
            <p className="text-center text-pet-muted py-4">No meals scheduled for today</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
