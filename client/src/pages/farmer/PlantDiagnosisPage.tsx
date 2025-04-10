import { useState, useRef, ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PlantAnalysis } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Upload, Camera, AlertCircle, Sprout, LineChart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
// We'll use a normal layout
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const PlantDiagnosisPage = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [plantType, setPlantType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for getting all fields
  const { data: fields = [], isLoading: isLoadingFields } = useQuery({
    queryKey: ['/api/fields'],
    queryFn: async () => {
      const response = await fetch('/api/fields');
      if (!response.ok) throw new Error('Failed to fetch fields');
      return response.json();
    }
  });

  // Query for getting all previous analyses
  const { data: analyses = [], isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['/api/plant-analyses'],
    queryFn: async () => {
      const response = await fetch('/api/plant-analyses');
      if (!response.ok) throw new Error('Failed to fetch analyses');
      return response.json();
    }
  });

  // Crops query - dependent on selected field
  const { data: crops = [], isLoading: isLoadingCrops } = useQuery({
    queryKey: ['/api/fields', selectedField, 'crops'],
    queryFn: async () => {
      if (!selectedField) return [];
      const response = await fetch(`/api/fields/${selectedField}/crops`);
      if (!response.ok) throw new Error('Failed to fetch crops');
      return response.json();
    },
    enabled: !!selectedField
  });

  // Mutation for submitting image for analysis
  const { mutate: analyzeImage, isPending: isAnalyzing } = useMutation({
    mutationFn: async (formData: {
      imageData: string;
      plantType?: string;
      fieldId?: string;
      cropId?: string;
      notes?: string;
    }) => {
      const response = await apiRequest('POST', '/api/plant-analyses', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Analysis Complete',
        description: 'Your plant has been successfully analyzed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/plant-analyses'] });
      setActiveTab('history');
      setSelectedImage(null);
      setImageFile(null);
      setPlantType('');
      setNotes('');
      setSelectedField('');
      setSelectedCrop('');
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze plant image',
        variant: 'destructive',
      });
    }
  });

  // Handler for file upload
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle camera activation
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
      setIsCameraActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  // Submit analysis
  const handleSubmitAnalysis = () => {
    if (!selectedImage) {
      toast({
        title: 'Image Required',
        description: 'Please upload or capture an image of the plant.',
        variant: 'destructive',
      });
      return;
    }

    // Extract base64 data from the full data URL
    const base64Data = selectedImage.split(',')[1];

    analyzeImage({
      imageData: base64Data,
      plantType: plantType || undefined,
      fieldId: selectedField || undefined,
      cropId: selectedCrop || undefined,
      notes: notes || undefined,
    });
  };

  // Reset form
  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setPlantType('');
    setNotes('');
    setSelectedField('');
    setSelectedCrop('');
    if (isCameraActive) {
      stopCamera();
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    // Ensure we have a valid date string before parsing
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString(undefined, options);
  };

  // Get status color based on health score
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get status label based on health status
  const getHealthLabel = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'minor issues': return 'Minor Issues';
      case 'moderate issues': return 'Moderate Issues';
      case 'severe issues': return 'Severe Issues';
      default: return status;
    }
  };

  return (
    <DashboardLayout title="Plant Disease Diagnosis">
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Plant Disease Diagnosis</h1>
            <p className="text-muted-foreground">
              Upload photos of your plants to identify diseases and get treatment recommendations
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Analyze Plant</TabsTrigger>
              <TabsTrigger value="history">Analysis History</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload or Capture Image</CardTitle>
                  <CardDescription>
                    Take a clear photo of the affected plant part (leaves, stem, etc.)
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <RadioGroup className="flex space-x-4" defaultValue="upload">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upload" id="upload" 
                            onClick={() => {
                              if (isCameraActive) stopCamera();
                              setActiveTab('upload');
                            }} 
                          />
                          <Label htmlFor="upload">Upload Image</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="camera" id="camera" 
                            onClick={() => {
                              startCamera();
                              setActiveTab('upload');
                            }}
                          />
                          <Label htmlFor="camera">Use Camera</Label>
                        </div>
                      </RadioGroup>

                      {!isCameraActive ? (
                        <div 
                          className="border-2 border-dashed rounded-lg p-4 h-64 flex flex-col items-center justify-center cursor-pointer"
                          onClick={handleUploadClick}
                        >
                          {selectedImage ? (
                            <img 
                              src={selectedImage} 
                              alt="Selected plant" 
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <>
                              <Upload className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG or JPEG (max. 10MB)
                              </p>
                            </>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                          />
                        </div>
                      ) : (
                        <div className="relative h-64">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline
                            className="w-full h-full object-cover rounded-lg"
                          ></video>
                          <Button 
                            className="absolute bottom-3 left-1/2 transform -translate-x-1/2"
                            onClick={captureImage}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Capture
                          </Button>
                        </div>
                      )}
                      <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="plant-type">Plant Type (Optional)</Label>
                        <Select value={plantType} onValueChange={setPlantType}>
                          <SelectTrigger id="plant-type">
                            <SelectValue placeholder="Select plant type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corn">Corn (Maize)</SelectItem>
                            <SelectItem value="tomato">Tomato</SelectItem>
                            <SelectItem value="potato">Potato</SelectItem>
                            <SelectItem value="wheat">Wheat</SelectItem>
                            <SelectItem value="rice">Rice</SelectItem>
                            <SelectItem value="soybean">Soybean</SelectItem>
                            <SelectItem value="cotton">Cotton</SelectItem>
                            <SelectItem value="coffee">Coffee</SelectItem>
                            <SelectItem value="cassava">Cassava</SelectItem>
                            <SelectItem value="sorghum">Sorghum</SelectItem>
                            <SelectItem value="sugar-cane">Sugar Cane</SelectItem>
                            <SelectItem value="groundnut">Groundnut</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="field">Field (Optional)</Label>
                        <Select value={selectedField} onValueChange={setSelectedField}>
                          <SelectTrigger id="field">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {fields.map((field: any) => (
                              <SelectItem key={field.id} value={field.id.toString()}>
                                {field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="crop">Crop (Optional)</Label>
                        <Select 
                          value={selectedCrop} 
                          onValueChange={setSelectedCrop}
                          disabled={!selectedField || isLoadingCrops}
                        >
                          <SelectTrigger id="crop">
                            <SelectValue placeholder="Select crop" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {crops.map((crop: any) => (
                              <SelectItem key={crop.id} value={crop.id.toString()}>
                                {crop.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Describe any symptoms or concerns"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="resize-none"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button 
                    onClick={handleSubmitAnalysis} 
                    disabled={!selectedImage || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Plant
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {isAnalyzing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis in Progress</CardTitle>
                    <CardDescription>
                      Our AI is examining your plant image. This may take a moment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={45} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Analyzing leaf patterns, discoloration, and disease markers...
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis History</CardTitle>
                  <CardDescription>
                    View your previous plant analyses and diagnoses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAnalyses ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : analyses.length === 0 ? (
                    <div className="text-center py-8">
                      <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No analyses yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload your first plant image to get a diagnosis
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={() => setActiveTab('upload')}
                      >
                        Analyze Plant
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {analyses.map((analysis: PlantAnalysis) => (
                        <Card key={analysis.id} className="overflow-hidden">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 h-full flex items-center">
                              <img 
                                src={`data:image/jpeg;base64,${analysis.imageData}`}
                                alt="Plant" 
                                className="w-full h-48 object-cover rounded-md"
                              />
                            </div>
                            <div className="p-4 md:col-span-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-medium">
                                    {analysis.plantType || "Unknown Plant"}
                                    {analysis.diseaseDetected && (
                                      <span className="ml-2 text-sm text-red-500 font-normal">
                                        • {analysis.diseaseDetected}
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(analysis.analysisDate)}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    analysis.healthStatus === 'healthy' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {getHealthLabel(analysis.healthStatus)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="text-sm">Health Score:</p>
                                  <div className="w-full max-w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${getHealthColor(analysis.healthScore)}`}
                                      style={{ width: `${analysis.healthScore}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-sm font-medium">{analysis.healthScore}%</p>
                                </div>
                              </div>
                              
                              {analysis.diseaseDetected && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium">Diagnosis:</p>
                                  <p className="text-sm mt-1">{analysis.diseaseDescription}</p>
                                </div>
                              )}
                              
                              <Separator className="my-3" />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {analysis.nutrientDeficiencies && (
                                  <div>
                                    <p className="text-sm font-medium">Nutrient Issues:</p>
                                    <p className="text-sm mt-1">{analysis.nutrientDeficiencies}</p>
                                  </div>
                                )}
                                
                                {analysis.recommendations && (
                                  <div>
                                    <p className="text-sm font-medium">Recommendations:</p>
                                    <p className="text-sm mt-1">{analysis.recommendations}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlantDiagnosisPage;