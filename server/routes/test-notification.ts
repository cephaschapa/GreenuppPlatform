import { Router } from 'express';
import { createNotification } from '../services/notifications';

const router = Router();

// Test endpoint to create a sample notification
router.post('/api/test-notification', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const notification = await createNotification({
      userId,
      type: 'system_notification',
      title: 'Test Notification',
      message: 'This is a test notification from Greenupp!',
      data: { test: true },
      actionUrl: '/dashboard',
      sendEmail: false
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;