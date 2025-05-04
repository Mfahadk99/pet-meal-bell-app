
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MealCard from '@/components/MealCard';
import AddMealForm from '@/components/AddMealForm';
import { useMeals } from '@/context/MealContext';
import { CalendarClock, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScheduledMeals: React.FC = () => {
  const { scheduledMeals, completeMeal, deleteMeal, isLoading, isError, refetch } = useMeals();
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-md flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pet-primary mb-2" />
        <p className="text-pet-muted">Loading scheduled meals...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Card className="mb-6 border-red-300">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">There was an error loading your scheduled meals</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Group meals by date
  const mealsByDate = scheduledMeals.reduce((acc, meal) => {
    const date = meal.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, typeof scheduledMeals>);
  
  // Sort dates chronologically
  const sortedDates = Object.keys(mealsByDate).sort();
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (dateStr === today) {
      return 'Today';
    } else if (dateStr === tomorrowStr) {
      return 'Tomorrow';
    } else {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-pet-text">Scheduled Meals</h1>
      
      <div className="mb-6">
        <AddMealForm />
      </div>
      
      {sortedDates.length > 0 ? (
        sortedDates.map(date => (
          <Card key={date} className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CalendarClock className="mr-2 h-5 w-5" />
                {formatDate(date)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mealsByDate[date].map(meal => (
                <MealCard 
                  key={meal.id}
                  meal={meal}
                  onComplete={() => completeMeal(meal.id)}
                  onDelete={() => deleteMeal(meal.id)}
                />
              ))}
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="mb-6">
          <CardContent className="py-8">
            <p className="text-center text-pet-muted">No meals scheduled</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduledMeals;
