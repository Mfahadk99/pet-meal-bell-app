
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MealCard from '@/components/MealCard';
import AddMealForm from '@/components/AddMealForm';
import { useMeals } from '@/context/MealContext';
import { AlarmClockCheck, CalendarClock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { 
    todayMeals, 
    upcomingMeal, 
    completeMeal, 
    deleteMeal, 
    isLoading,
    isError,
    refetch
  } = useMeals();
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-md flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pet-primary mb-2" />
        <p className="text-pet-muted">Loading meals...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Card className="mb-6 border-red-300">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">There was an error loading your meal data</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
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
