import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, CalendarIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Crop, CropActivity } from '@shared/schema';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface CropActivityManagerProps {
  crop: Crop | null;
  onClose?: () => void;
}

export function CropActivityManager({ crop, onClose }: CropActivityManagerProps) {
  const { toast } = useToast();
  const [isAddActivityDialogOpen, setIsAddActivityDialogOpen] = useState(false);
  const [activityBeingEdited, setActivityBeingEdited] = useState<CropActivity | null>(null);
  
  // Form state
  const [activityType, setActivityType] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityCost, setActivityCost] = useState('');
  const [activityNotes, setActivityNotes] = useState('');
  
  // Fetch activities for the selected crop
  const { data: activities, isLoading } = useQuery<CropActivity[]>({
    queryKey: ['/api/crops', crop?.id, 'activities'],
    queryFn: async () => {
      if (!crop) return [];
      const response = await fetch(`/api/crops/${crop.id}/activities`);
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      return await response.json();
    },
    enabled: !!crop
  });
  
  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      return apiRequest('POST', `/api/crops/${crop?.id}/activities`, activityData);
    },
    onSuccess: () => {
      toast({
        title: "Activity added",
        description: "Crop activity has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crops', crop?.id, 'activities'] });
      resetForm();
      setIsAddActivityDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding activity",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return apiRequest('PATCH', `/api/crop-activities/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Activity updated",
        description: "Crop activity has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crops', crop?.id, 'activities'] });
      resetForm();
      setActivityBeingEdited(null);
      setIsAddActivityDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating activity",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/crop-activities/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Activity deleted",
        description: "Crop activity has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crops', crop?.id, 'activities'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting activity",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const resetForm = () => {
    setActivityType('');
    setActivityDate('');
    setActivityDescription('');
    setActivityCost('');
    setActivityNotes('');
  };
  
  const handleSubmit = () => {
    if (!activityType || !activityDate || !activityDescription) {
      toast({
        title: "Missing information",
        description: "Type, date, and description are required",
        variant: "destructive"
      });
      return;
    }
    
    const activityData = {
      activityType,
      activityDate,
      description: activityDescription,
      cost: activityCost ? parseFloat(activityCost) : undefined,
      notes: activityNotes || undefined,
      cropId: crop?.id
    };
    
    if (activityBeingEdited) {
      updateActivityMutation.mutate({ 
        id: activityBeingEdited.id, 
        data: activityData 
      });
    } else {
      createActivityMutation.mutate(activityData);
    }
  };
  
  const handleEdit = (activity: CropActivity) => {
    setActivityBeingEdited(activity);
    setActivityType(activity.activityType);
    setActivityDate(activity.activityDate.toString().split('T')[0]);
    setActivityDescription(activity.description);
    setActivityCost(activity.cost?.toString() || '');
    setActivityNotes(activity.notes || '');
    setIsAddActivityDialogOpen(true);
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      deleteActivityMutation.mutate(id);
    }
  };
  
  if (!crop) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-gray-400">Select a crop to manage activities</p>
      </div>
    );
  }
  
  return (
    <Card className="bg-secondary/30 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-medium text-white font-space">
              Activities for {crop.name}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {crop.variety ? `Variety: ${crop.variety}` : ''} 
              {crop.status ? ` • Status: ${crop.status}` : ''}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activities.map(activity => (
              <div 
                key={activity.id} 
                className="flex justify-between items-center p-3 bg-secondary/60 rounded-md border border-primary/10"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2 bg-primary/20">
                      {activity.activityType}
                    </Badge>
                    <span className="text-sm text-gray-300">
                      {new Date(activity.activityDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-white">{activity.description}</p>
                  {activity.cost && (
                    <p className="text-xs text-gray-400 mt-1">Cost: ${activity.cost}</p>
                  )}
                  {activity.notes && (
                    <p className="text-xs text-gray-400 mt-1">{activity.notes}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(activity)}
                    className="h-8 w-8 text-gray-400 hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(activity.id)}
                    className="h-8 w-8 text-gray-400 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-primary/20 rounded-md">
            <CalendarIcon className="h-10 w-10 text-gray-500 mb-2" />
            <p className="text-gray-500">No activities recorded for this crop</p>
            <p className="text-gray-500 text-sm mt-1">Add activities to track crop progress</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isAddActivityDialogOpen} onOpenChange={setIsAddActivityDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {activityBeingEdited ? 'Update Activity' : 'Add Activity'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-secondary border-primary/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {activityBeingEdited ? 'Update Activity' : 'Add New Activity'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {activityBeingEdited 
                  ? 'Update the details of this crop activity'
                  : 'Record a new activity for your crop'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Activity Type*</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                >
                  <option value="">Select type</option>
                  <option value="Fertilizing">Fertilizing</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Pest Control">Pest Control</option>
                  <option value="Weeding">Weeding</option>
                  <option value="Pruning">Pruning</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Date*</label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Description*</label>
                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                  rows={3}
                  placeholder="Describe what was done"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Cost</label>
                <input
                  type="number"
                  value={activityCost}
                  onChange={(e) => setActivityCost(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Notes</label>
                <textarea
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                  rows={2}
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setActivityBeingEdited(null);
                  setIsAddActivityDialogOpen(false);
                }} 
                className="border-gray-500 text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
              >
                {(createActivityMutation.isPending || updateActivityMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {activityBeingEdited ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  activityBeingEdited ? 'Update Activity' : 'Add Activity'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}