import { sendEmail, generateHtmlEmail } from './email';

// Define interface for notification types
export interface SocialNotification {
  type: string;
  recipient: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  actor: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  entityId: number;
  entityContent: string;
  postId?: number;
  commentId?: number | null;
  overrideEmail?: string; // Optional parameter to override recipient's email (for testing)
}

// Response interface
export interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send notification email for social activities
 */
export async function sendSocialNotificationEmail(
  notification: SocialNotification
): Promise<EmailResult> {
  try {
    console.log(`[SOCIAL NOTIFICATION] Sending ${notification.type} notification`);
    
    // Use the override email if provided (useful for testing)
    const recipientEmail = notification.overrideEmail || notification.recipient.email;
    
    if (!recipientEmail) {
      return {
        success: false,
        error: 'Recipient email is required'
      };
    }
    
    const recipientName = notification.recipient.firstName || notification.recipient.username;
    const actorName = notification.actor.firstName || notification.actor.username;
    const actorUsername = notification.actor.username;
    
    // Determine notification details based on type
    let title = '';
    let message = '';
    let actionUrl = '';
    let actionText = '';

    // Social activity dashboard base URL
    const socialBaseUrl = 'https://greenupp.app/dashboard/social';
    
    switch (notification.type) {
      case 'post_comment':
        title = `${actorName} commented on your post`;
        message = `
          <p>Hi ${recipientName},</p>
          <p><strong>${actorUsername}</strong> commented on your post:</p>
          <div style="margin: 15px 0; padding: 15px; background-color: #f1f5f9; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="font-style: italic; margin: 0;">"${notification.entityContent}"</p>
          </div>
          <p>Join the conversation and reply to their comment.</p>
        `;
        actionUrl = `${socialBaseUrl}/posts/${notification.postId}?comment=${notification.commentId}`;
        actionText = 'View Comment';
        break;
        
      case 'comment_reply':
        title = `${actorName} replied to your comment`;
        message = `
          <p>Hi ${recipientName},</p>
          <p><strong>${actorUsername}</strong> replied to your comment:</p>
          <div style="margin: 15px 0; padding: 15px; background-color: #f1f5f9; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="font-style: italic; margin: 0;">"${notification.entityContent}"</p>
          </div>
          <p>Continue the conversation by replying back.</p>
        `;
        actionUrl = `${socialBaseUrl}/posts/${notification.postId}?comment=${notification.commentId}`;
        actionText = 'View Reply';
        break;
        
      case 'post_like':
        title = `${actorName} liked your post`;
        message = `
          <p>Hi ${recipientName},</p>
          <p><strong>${actorUsername}</strong> liked your post.</p>
          <div style="margin: 15px 0; padding: 15px; background-color: #f1f5f9; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="font-style: italic; margin: 0;">"${notification.entityContent.substring(0, 100)}${notification.entityContent.length > 100 ? '...' : ''}"</p>
          </div>
        `;
        actionUrl = `${socialBaseUrl}/posts/${notification.postId}`;
        actionText = 'View Post';
        break;
        
      case 'comment_like':
        title = `${actorName} liked your comment`;
        message = `
          <p>Hi ${recipientName},</p>
          <p><strong>${actorUsername}</strong> liked your comment:</p>
          <div style="margin: 15px 0; padding: 15px; background-color: #f1f5f9; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="font-style: italic; margin: 0;">"${notification.entityContent}"</p>
          </div>
        `;
        actionUrl = `${socialBaseUrl}/posts/${notification.postId}?comment=${notification.commentId}`;
        actionText = 'View Comment';
        break;
        
      case 'new_follower':
        title = `${actorName} is now following you`;
        message = `
          <p>Hi ${recipientName},</p>
          <p><strong>${actorUsername}</strong> is now following you on Greenupp!</p>
          <p>Check out their profile and consider following them back.</p>
        `;
        actionUrl = `${socialBaseUrl}/profile/${notification.actor.id}`;
        actionText = 'View Profile';
        break;
        
      case 'post_share':
        title = `${actorName} shared your post`;
        message = `
          <p>Hi ${recipientName},</p>
          <p><strong>${actorUsername}</strong> shared your post:</p>
          <div style="margin: 15px 0; padding: 15px; background-color: #f1f5f9; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="font-style: italic; margin: 0;">"${notification.entityContent.substring(0, 100)}${notification.entityContent.length > 100 ? '...' : ''}"</p>
          </div>
          <p>Your content is reaching more farmers in the Greenupp community!</p>
        `;
        actionUrl = `${socialBaseUrl}/posts/${notification.postId}`;
        actionText = 'View Post';
        break;
        
      case 'post_save':
        title = `${actorName} saved your post`;
        message = `
          <p>Hi ${recipientName},</p>
          <p><strong>${actorUsername}</strong> saved your post to their collection:</p>
          <div style="margin: 15px 0; padding: 15px; background-color: #f1f5f9; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="font-style: italic; margin: 0;">"${notification.entityContent.substring(0, 100)}${notification.entityContent.length > 100 ? '...' : ''}"</p>
          </div>
          <p>Your content is being valued by the Greenupp community!</p>
        `;
        actionUrl = `${socialBaseUrl}/posts/${notification.postId}`;
        actionText = 'View Post';
        break;
        
      case 'post_mention':
        title = `${actorName} mentioned you in a post`;
        message = `
          <p>Hi ${recipientName},</p>
          <p><strong>${actorUsername}</strong> mentioned you in a post:</p>
          <div style="margin: 15px 0; padding: 15px; background-color: #f1f5f9; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="font-style: italic; margin: 0;">"${notification.entityContent.substring(0, 100)}${notification.entityContent.length > 100 ? '...' : ''}"</p>
          </div>
        `;
        actionUrl = `${socialBaseUrl}/posts/${notification.postId}`;
        actionText = 'View Post';
        break;
        
      case 'comment_mention':
        title = `${actorName} mentioned you in a comment`;
        message = `
          <p>Hi ${recipientName},</p>
          <p><strong>${actorUsername}</strong> mentioned you in a comment:</p>
          <div style="margin: 15px 0; padding: 15px; background-color: #f1f5f9; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="font-style: italic; margin: 0;">"${notification.entityContent}"</p>
          </div>
        `;
        actionUrl = `${socialBaseUrl}/posts/${notification.postId}?comment=${notification.commentId}`;
        actionText = 'View Comment';
        break;
        
      default:
        title = 'New Activity on Greenupp';
        message = `
          <p>Hi ${recipientName},</p>
          <p>There's been new activity related to your content on Greenupp.</p>
        `;
        actionUrl = `${socialBaseUrl}`;
        actionText = 'Go to Greenupp';
    }
    
    // Generate HTML email content
    const html = generateHtmlEmail(
      title,
      message,
      actionUrl,
      actionText,
      'You received this notification because you have email notifications enabled for social activities.'
    );
    
    // Plain text alternative
    const text = `
      ${title}
      
      Hi ${recipientName},
      
      ${notification.type.includes('comment') ? `${actorUsername} commented: "${notification.entityContent}"` : 
        notification.type.includes('mention') ? `${actorUsername} mentioned you: "${notification.entityContent}"` :
        notification.type.includes('like') ? `${actorUsername} liked your content` :
        notification.type.includes('follow') ? `${actorUsername} is now following you` :
        `${actorUsername} interacted with your content on Greenupp`}
      
      Visit ${actionUrl} to see the activity.
      
      - Greenupp Team
    `;
    
    // Send the email
    const emailResult = await sendEmail({
      to: recipientEmail,
      from: 'greenupp.notifier@gmail.com',
      subject: title,
      html,
      text
    });
    
    // Log the result
    if (emailResult.success) {
      console.log(`[SOCIAL NOTIFICATION] Email sent to ${recipientEmail}`);
      return { success: true };
    } else {
      console.error(`[SOCIAL NOTIFICATION] Failed to send email to ${recipientEmail}: ${emailResult.error || 'Unknown error'}`);
      return {
        success: false,
        error: emailResult.error || 'Failed to send notification email'
      };
    }
  } catch (error: any) {
    console.error('[SOCIAL NOTIFICATION] Error sending notification email:', error);
    return {
      success: false,
      error: error.message || 'Unknown error sending notification email'
    };
  }
}