import { Router } from 'express';
import { createNotification } from '../services/notifications';

const router = Router();

// Test endpoint to create a sample notification
router.post('/api/test-notification', async (req, res) => {
  try {
    // For testing, use a fixed userId instead of requiring authentication
    // In a real app, you would require authentication for this endpoint
    const userId = req.body.userId || 2; // Default to user ID 2 for testing
    
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

// Test endpoint to get notifications (bypassing auth)
router.get('/api/test-notifications', async (req, res) => {
  try {
    const userId = req.query.userId || 2; // Default to user ID 2 for testing
    
    // Import the notification services
    const { getUserNotifications, countUnreadNotifications } = await import('../services/notifications');
    
    // Get notifications for the user
    const notifications = await getUserNotifications(Number(userId));
    const unreadCount = await countUnreadNotifications(Number(userId));
    
    res.status(200).json({ 
      notifications, 
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching test notifications:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;