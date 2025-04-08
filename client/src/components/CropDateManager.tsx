import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Calendar, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Crop } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';

interface CropDateManagerProps {
  crop: Crop;
  onClose?: () => void;
}

export function CropDateManager({ crop, onClose }: CropDateManagerProps) {
  const { toast } = useToast();
  const [isEditingDates, setIsEditingDates] = useState(false);
  
  // Form state
  const [plantingDate, setPlantingDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [actualHarvestDate, setActualHarvestDate] = useState('');
  const [expectedYield, setExpectedYield] = useState('');
  const [actualYield, setActualYield] = useState('');
  const [yieldUnit, setYieldUnit] = useState('kg');
  
  // Initialize form with crop data
  useEffect(() => {
    if (crop) {
      setPlantingDate(crop.plantingDate ? new Date(crop.plantingDate).toISOString().split('T')[0] : '');
      setExpectedHarvestDate(crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toISOString().split('T')[0] : '');
      setActualHarvestDate(crop.actualHarvestDate ? new Date(crop.actualHarvestDate).toISOString().split('T')[0] : '');
      setExpectedYield(crop.expectedYield?.toString() || '');
      setActualYield(crop.actualYield?.toString() || '');
      setYieldUnit(crop.yieldUnit || 'kg');
    }
  }, [crop]);
  
  // Update crop mutation
  const updateCropMutation = useMutation({
    mutationFn: async (cropData: any) => {
      return apiRequest('PATCH', `/api/crops/${crop.id}`, cropData);
    },
    onSuccess: () => {
      toast({
        title: "Crop updated",
        description: "Crop dates and yields have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
      setIsEditingDates(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating crop",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = () => {
    const cropData = {
      plantingDate: plantingDate || null,
      expectedHarvestDate: expectedHarvestDate || null,
      actualHarvestDate: actualHarvestDate || null,
      expectedYield: expectedYield ? parseFloat(expectedYield) : null,
      actualYield: actualYield ? parseFloat(actualYield) : null,
      yieldUnit
    };
    
    updateCropMutation.mutate(cropData);
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <Card className="bg-secondary/30 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-medium text-white font-space">
              Manage Crop Timeline
            </CardTitle>
            <CardDescription className="text-gray-400">
              {crop.name} {crop.variety ? `- ${crop.variety}` : ''}
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/60 p-3 rounded-md border border-primary/10">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium text-gray-300">Planting Date</span>
              </div>
              <div className="text-white">
                {formatDate(crop.plantingDate)}
              </div>
            </div>
            
            <div className="bg-secondary/60 p-3 rounded-md border border-primary/10">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium text-gray-300">Expected Harvest</span>
              </div>
              <div className="text-white">
                {formatDate(crop.expectedHarvestDate)}
              </div>
            </div>
            
            <div className="bg-secondary/60 p-3 rounded-md border border-primary/10">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                <span className="text-sm font-medium text-gray-300">Actual Harvest</span>
              </div>
              <div className="text-white">
                {formatDate(crop.actualHarvestDate)}
              </div>
            </div>
            
            <div className="bg-secondary/60 p-3 rounded-md border border-primary/10">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Status</span>
              </div>
              <div>
                <Badge variant="outline" className="bg-primary/20">
                  {crop.status?.charAt(0).toUpperCase() + crop.status?.slice(1) || 'Planning'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary/60 p-3 rounded-md border border-primary/10">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Yield Information</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400">Expected Yield</span>
                <div className="text-white">
                  {crop.expectedYield ? `${crop.expectedYield} ${crop.yieldUnit || 'kg'}` : 'Not set'}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400">Actual Yield</span>
                <div className="text-white">
                  {crop.actualYield ? `${crop.actualYield} ${crop.yieldUnit || 'kg'}` : 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={isEditingDates} onOpenChange={setIsEditingDates}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <CalendarDays className="mr-2 h-4 w-4" />
              Update Crop Timeline
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-secondary border-primary/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Update Crop Timeline
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Set planting and harvest dates for {crop.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Planting Date</label>
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Expected Harvest Date</label>
                <input
                  type="date"
                  value={expectedHarvestDate}
                  onChange={(e) => setExpectedHarvestDate(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Actual Harvest Date</label>
                <input
                  type="date"
                  value={actualHarvestDate}
                  onChange={(e) => setActualHarvestDate(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Expected Yield</label>
                  <input
                    type="number"
                    value={expectedYield}
                    onChange={(e) => setExpectedYield(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Actual Yield</label>
                  <input
                    type="number"
                    value={actualYield}
                    onChange={(e) => setActualYield(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Yield Unit</label>
                <select
                  value={yieldUnit}
                  onChange={(e) => setYieldUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="lb">lb</option>
                  <option value="bushel">bushel</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditingDates(false)} 
                className="border-gray-500 text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={updateCropMutation.isPending}
              >
                {updateCropMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Timeline"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}