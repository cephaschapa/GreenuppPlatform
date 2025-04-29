import { Router, Request, Response } from 'express';
import { sendEmail } from '../services/email';
import { sendSocialNotificationEmail } from '../services/social-notifications';

const router = Router();

// Test basic SendGrid email functionality - No auth required
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    console.log(`[PUBLIC EMAIL TEST] Sending basic test email to: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    // Create test email options
    const emailOptions = {
      to: email,
      from: 'greenupp.notifier@gmail.com',
      subject: 'GreenUpp Test Email',
      text: 'This is a test email from GreenUpp to verify our email system is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2e7d32;">GreenUpp Email Test</h1>
          </div>
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <p>Hello,</p>
            <p>This is a test email from GreenUpp to verify our email system is working correctly.</p>
            <p>If you received this email, it means our SendGrid integration is working properly!</p>
          </div>
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #757575; font-size: 12px;">
            <p>This is an automated test email. Please do not reply to this message.</p>
            <p>GreenUpp - Empowering farmers with intelligent digital tools.</p>
          </div>
        </div>
      `
    };
    
    // Send the email
    const emailResult = await sendEmail(emailOptions);
    console.log('[PUBLIC EMAIL TEST] Email result:', emailResult);
    
    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${email}`
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: emailResult.error
      });
    }
  } catch (err) {
    const error = err as any;
    console.error('[PUBLIC EMAIL TEST] Error sending test email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message || 'Unknown error'
    });
  }
});

// Test social notification email - No auth required
router.post('/test-social-notification', async (req: Request, res: Response) => {
  try {
    const { email, activityType } = req.body;
    
    console.log(`[PUBLIC EMAIL TEST] Sending social notification test email to: ${email}, type: ${activityType}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    // Default to post_comment if no activity type is provided
    const activity = activityType || 'post_comment';
    
    // Mock data for the notification
    const mockData = {
      recipient: {
        id: 99999,
        username: 'testuser',
        email: email,
        firstName: 'Test',
        lastName: 'User',
        profileImageUrl: 'https://via.placeholder.com/150'
      },
      actor: {
        id: 88888,
        username: 'greenupp',
        email: 'notifications@greenupp.com',
        firstName: 'GreenUpp',
        lastName: 'Team',
        profileImageUrl: 'https://via.placeholder.com/150'
      },
      post: {
        id: 77777,
        content: 'This is a sample post content for testing email notifications.',
        created_at: new Date().toISOString()
      },
      comment: {
        id: 66666,
        content: 'This is a sample comment for testing email notifications.',
        created_at: new Date().toISOString()
      }
    };
    
    // Generate the notification email based on activity type
    const emailResult = await sendSocialNotificationEmail({
      type: activity,
      recipient: mockData.recipient,
      actor: mockData.actor,
      entityId: activity.includes('post') ? mockData.post.id : mockData.comment.id,
      entityContent: activity.includes('post') ? mockData.post.content : mockData.comment.content,
      postId: mockData.post.id,
      commentId: activity.includes('comment') ? mockData.comment.id : null,
      overrideEmail: email // Override to send to the provided email
    });
    
    console.log('[PUBLIC EMAIL TEST] Social notification email result:', emailResult);
    
    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: `Test notification email for "${activity}" sent successfully to ${email}`
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test notification email',
        error: emailResult.error
      });
    }
  } catch (err) {
    const error = err as any;
    console.error('[PUBLIC EMAIL TEST] Error sending test notification email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending test notification email',
      error: error.message || 'Unknown error'
    });
  }
});

export default router;