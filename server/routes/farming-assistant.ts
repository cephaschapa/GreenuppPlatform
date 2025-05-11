import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ChatMessage, farmingAssistantChat } from '../ai';
import { storage } from '../storage';
import { type Crop } from '@shared/schema';

const router = Router();

// Schema for chat request validation - support both single message and full message array formats
const simpleMessageSchema = z.object({
  message: z.string()
});

const fullMessageSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  includeFarmerContext: z.boolean().optional().default(true)
});

// We'll use two separate schemas rather than a discriminated union
const assistantChatRequestSchema = z.union([
  simpleMessageSchema,
  fullMessageSchema
]);

// Add a simple endpoint that does the same thing as /chat for backwards compatibility
router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'You must be logged in to use the Farming Assistant' });
  }

  try {
    // Validate request
    const validatedData = assistantChatRequestSchema.parse(req.body);
    
    // Process messages based on format
    let messages: ChatMessage[] = [];
    let includeFarmerContext = true;
    
    if ('message' in validatedData) {
      // Simple format with single message
      messages = [
        {
          role: 'user',
          content: validatedData.message
        }
      ];
    } else {
      // Full format with message array
      messages = validatedData.messages;
      includeFarmerContext = validatedData.includeFarmerContext ?? true;
    }

    // Get user context if requested
    let userContext = undefined;
    
    if (includeFarmerContext) {
      // Get farmer profile data
      const farmerProfile = await storage.getFarmerProfile(req.user.id);
      
      // Get crop data
      const fields = await storage.getFields(req.user.id);
      const cropTypes = new Set<string>();
      
      for (const field of fields) {
        const crops = await storage.getCropsByField(field.id);
        crops.forEach((crop: Crop) => cropTypes.add(crop.name));
      }
      
      userContext = {
        cropTypes: Array.from(cropTypes),
        region: farmerProfile?.farmLocation || undefined,
        soilType: farmerProfile?.farmType || undefined,
        farmingExperience: farmerProfile ? `Farm established in ${farmerProfile.establishedYear || 'unknown'}` : undefined
      };
    }

    // Call the AI function
    const response = await farmingAssistantChat(messages, userContext);
    
    // Return AI response
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in farming assistant endpoint:', error);
    
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    
    res.status(500).json({ error: 'Failed to process your request. Please try again later.' });
  }
});

type AssistantChatRequest = z.infer<typeof assistantChatRequestSchema>;

// Rename the existing endpoint to /chat for clarity
router.post('/chat', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'You must be logged in to use the Farming Assistant' });
  }

  try {
    // Validate request
    const validatedData = assistantChatRequestSchema.parse(req.body);
    
    // Process messages based on format
    let messages: ChatMessage[] = [];
    let includeFarmerContext = true;
    
    if ('message' in validatedData) {
      // Simple format with single message
      messages = [
        {
          role: 'user',
          content: validatedData.message
        }
      ];
    } else {
      // Full format with message array
      messages = validatedData.messages;
      includeFarmerContext = validatedData.includeFarmerContext ?? true;
    }

    // Get user context if requested
    let userContext = undefined;
    
    if (includeFarmerContext) {
      // Get farmer profile data
      const farmerProfile = await storage.getFarmerProfile(req.user.id);
      
      // Get crop data
      const fields = await storage.getFields(req.user.id);
      const cropTypes = new Set<string>();
      
      for (const field of fields) {
        const crops = await storage.getCropsByField(field.id);
        crops.forEach((crop: Crop) => cropTypes.add(crop.name));
      }
      
      userContext = {
        cropTypes: Array.from(cropTypes),
        region: farmerProfile?.farmLocation || undefined,
        soilType: farmerProfile?.farmType || undefined,
        farmingExperience: farmerProfile ? `Farm established in ${farmerProfile.establishedYear || 'unknown'}` : undefined
      };
    }

    // Call the AI function
    const response = await farmingAssistantChat(messages, userContext);
    
    // Return AI response
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in farming assistant endpoint:', error);
    
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    
    res.status(500).json({ error: 'Failed to process your request. Please try again later.' });
  }
});

// GET endpoint to provide context about the farmer's crops and fields
router.get('/context', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'You must be logged in to use this feature' });
  }

  try {
    // Get farmer profile data
    const farmerProfile = await storage.getFarmerProfile(req.user.id);
    
    // Get field data
    const fields = await storage.getFields(req.user.id);
    
    // Get crop data
    const crops = [];
    const soilTypes = new Set<string>();
    
    for (const field of fields) {
      const fieldCrops = await storage.getCropsByField(field.id);
      crops.push(...fieldCrops);
      
      if (field.soilType) {
        soilTypes.add(field.soilType);
      }
    }
    
    res.json({
      crops,
      fields,
      soilTypes: Array.from(soilTypes),
      region: farmerProfile?.farmLocation || undefined
    });
  } catch (error) {
    console.error('Error fetching farming context:', error);
    res.status(500).json({ error: 'Failed to fetch farming context' });
  }
});

export default router;