import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, generateHtmlEmail } from '../services/email';
import { sendSocialActivityEmail } from '../services/social-notifications';

export const testEmailRouter = Router();

// Test email service with direct email
testEmailRouter.post('/test-email', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user || !user.email) {
      return res.status(400).json({ message: 'User email not found' });
    }

    const html = generateHtmlEmail(
      'Test Email from Greenupp',
      'This is a test email sent from Greenupp to verify that email notifications are working correctly.',
      'https://greenupp.app',
      'Visit Greenupp',
      'This is a test email. You can safely ignore it.'
    );

    const sent = await sendEmail({
      to: user.email,
      from: 'Greenupp <notifications@greenupp.app>',
      subject: 'Test Email from Greenupp',
      text: 'This is a test email from Greenupp to verify that email notifications are working correctly.',
      html
    });

    if (sent) {
      return res.json({ 
        success: true, 
        message: `Test email sent to ${user.email}` 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email' 
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error sending test email', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Test social notification email with specific activity type
testEmailRouter.post('/test-social-notification', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { activityType = 'post_comment' } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user || !user.email) {
      return res.status(400).json({ message: 'User email not found' });
    }

    // Send a test social activity notification
    const sent = await sendSocialActivityEmail({
      recipientId: req.user.id,
      activityType: activityType,
      actorUsername: 'testuser',
      actorDisplayName: 'Test User',
      contentPreview: 'This is a test notification to verify that social notifications are working properly.',
      resourceId: 123,
      resourceUrl: 'https://greenupp.app/green-socials/posts/123'
    });

    if (sent) {
      return res.json({ 
        success: true, 
        message: `Test ${activityType} notification email sent to ${user.email}` 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send test notification email' 
      });
    }
  } catch (error) {
    console.error('Error sending test notification email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error sending test notification email', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});