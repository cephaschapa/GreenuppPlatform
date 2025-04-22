import { Router } from 'express';
import { testEmail } from '../services/email';

const router = Router();

// Test email endpoint
router.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    const success = await testEmail(email);
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Test email sent to ${email}` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email' 
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;