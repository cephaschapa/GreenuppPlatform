import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ChatMessage, farmingAssistantChat } from '../ai';
import { storage } from '../storage';

const router = Router();

// Schema for chat request validation
const assistantChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  includeFarmerContext: z.boolean().optional().default(true)
});

type AssistantChatRequest = z.infer<typeof assistantChatRequestSchema>;

// POST endpoint to get AI response to farming questions
router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'You must be logged in to use the Farming Assistant' });
  }

  try {
    // Validate request
    const validatedData = assistantChatRequestSchema.parse(req.body);
    const { messages, includeFarmerContext } = validatedData;

    // Get user context if requested
    let userContext = undefined;
    
    if (includeFarmerContext) {
      // Get farmer profile data
      const farmerProfile = await storage.getFarmerProfileByUserId(req.user.id);
      
      // Get crop data
      const fields = await storage.getFieldsByUserId(req.user.id);
      const cropTypes = new Set<string>();
      
      for (const field of fields) {
        const crops = await storage.getCropsByFieldId(field.id);
        crops.forEach(crop => cropTypes.add(crop.cropType));
      }
      
      userContext = {
        cropTypes: Array.from(cropTypes),
        region: farmerProfile?.location || undefined,
        soilType: farmerProfile?.soilType || undefined,
        farmingExperience: farmerProfile?.experience || undefined
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

export default router;