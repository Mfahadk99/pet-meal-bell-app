
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MealCard from '@/components/MealCard';
import { useMeals } from '@/context/MealContext';
import { Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MealHistory: React.FC = () => {
  const { historyMeals, isLoading, isError, refetch } = useMeals();
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-md flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pet-primary mb-2" />
        <p className="text-pet-muted">Loading meal history...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Card className="mb-6 border-red-300">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">There was an error loading your meal history</p>
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
  const mealsByDate = historyMeals.reduce((acc, meal) => {
    const date = meal.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, typeof historyMeals>);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-pet-text">Meal History</h1>
      
      {Object.keys(mealsByDate).length > 0 ? (
        Object.entries(mealsByDate).map(([date, meals]) => (
          <Card key={date} className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                {formatDate(date)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meals.map(meal => (
                <MealCard 
                  key={meal.id}
                  meal={meal}
                  showActions={false}
                />
              ))}
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="mb-6">
          <CardContent className="py-8">
            <p className="text-center text-pet-muted">No meal history available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealHistory;
