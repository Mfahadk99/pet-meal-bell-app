
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Check, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { Meal } from '@/context/MealContext';

interface MealCardProps {
  meal: Meal;
  onComplete?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  showActions?: boolean;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const MealCard: React.FC<MealCardProps> = ({
  meal,
  onComplete,
  onDelete,
  showActions = true
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isToday = new Date(meal.date).toDateString() === new Date().toDateString();
  
  const handleComplete = async () => {
    if (!onComplete) return;
    
    setIsCompleting(true);
    try {
      await onComplete();
    } catch (error) {
      console.error("Error completing meal:", error);
    } finally {
      setIsCompleting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Error deleting meal:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className={cn(
      "p-4 mb-3 border-l-4",
      meal.completed 
        ? "border-l-green-500" 
        : isToday 
          ? "border-l-pet-secondary" 
          : "border-l-pet-primary"
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{meal.name}</h3>
          
          <div className="flex items-center mt-2 text-pet-muted">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{meal.time}</span>
            
            <Calendar className="w-4 h-4 ml-3 mr-1" />
            <span className="text-sm">{formatDate(meal.date)}</span>
          </div>
          
          {meal.notes && (
            <p className="text-sm text-pet-muted mt-2">{meal.notes}</p>
          )}
        </div>
        
        {showActions && !meal.completed && (
          <div className="flex">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-500 hover:text-green-700 hover:bg-green-50"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
        
        {meal.completed && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" /> Fed
          </span>
        )}
      </div>
      
      {showActions && (
        <div className="flex justify-end mt-2">
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                'Delete'
              )}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default MealCard;
