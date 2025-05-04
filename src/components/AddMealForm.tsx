
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMeals } from '@/context/MealContext';

const AddMealForm: React.FC = () => {
  const { addMeal } = useMeals();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !time || !date) {
      return;
    }
    
    addMeal({
      name,
      time,
      date,
      notes
    });
    
    // Reset form
    setName('');
    setTime('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    
    // Close dialog
    setOpen(false);
  };
  
  // Set default date to today when opening the form
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !date) {
      setDate(new Date().toISOString().split('T')[0]);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-pet-primary text-white hover:bg-pet-primary/90 w-full">
          Schedule New Meal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Meal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input 
              id="meal-name"
              placeholder="e.g., Breakfast, Dinner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="meal-time">Time</Label>
            <Input 
              id="meal-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="meal-date">Date</Label>
            <Input 
              id="meal-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="meal-notes">Notes (Optional)</Label>
            <Textarea 
              id="meal-notes"
              placeholder="Any special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full">
            Schedule Meal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMealForm;
