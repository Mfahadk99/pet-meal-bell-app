
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MealCard from '@/components/MealCard';
import { useMeals } from '@/context/MealContext';
import { Calendar } from 'lucide-react';

const MealHistory: React.FC = () => {
  const { historyMeals } = useMeals();
  
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
