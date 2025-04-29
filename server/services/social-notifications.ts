import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendEmail, generateHtmlEmail } from "./email";

// Social activity types that can trigger email notifications
export type SocialActivityType = 
  'post_comment' | 
  'comment_reply' | 
  'post_like' | 
  'comment_like' | 
  'new_follower' | 
  'post_share' | 
  'post_save' | 
  'post_mention' | 
  'comment_mention';

// Interface for sending social notification emails
export interface SocialEmailOptions {
  recipientId: number;        // User ID of the recipient
  activityType: SocialActivityType;
  actorUsername: string;      // Username of the person who performed the action
  actorDisplayName?: string;  // Display name of the person who performed the action
  contentPreview?: string;    // A snippet of the relevant content (post/comment)
  resourceId?: number;        // ID of the related resource (post/comment)
  resourceUrl?: string;       // URL to view the content in the app
}

/**
 * Send an email notification for a social activity
 */
export async function sendSocialActivityEmail(options: SocialEmailOptions): Promise<boolean> {
  try {
    // Get the recipient's email
    const [recipient] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username
      })
      .from(users)
      .where(eq(users.id, options.recipientId));

    if (!recipient || !recipient.email) {
      console.warn(`Cannot send email: User ${options.recipientId} not found or has no email`);
      return false;
    }

    // Create friendly names and messages for different activity types
    const { subject, message, actionText } = createEmailContent(
      options.activityType,
      options.actorUsername,
      options.actorDisplayName,
      options.contentPreview
    );

    // Create a URL for the content if not provided
    const actionUrl = options.resourceUrl || createResourceUrl(options.activityType, options.resourceId);

    // Generate the HTML email
    const html = generateHtmlEmail(
      subject,
      message,
      actionUrl,
      actionText,
      `You received this email because you have email notifications enabled for Green Socials.
      You can change your notification preferences in Settings > Notifications.`
    );

    // Send the email
    return await sendEmail({
      to: recipient.email,
      from: 'Greenupp Social <social@greenupp.app>',
      subject,
      text: message + (actionUrl ? `\n\n${actionText}: ${actionUrl}` : ''),
      html
    });
  } catch (error) {
    console.error("Failed to send social activity email:", error);
    return false;
  }
}

/**
 * Create email content based on activity type
 */
function createEmailContent(
  activityType: SocialActivityType, 
  actorUsername: string,
  actorDisplayName?: string,
  contentPreview?: string
): { subject: string; message: string; actionText: string } {
  // Use display name if available, otherwise username
  const actorName = actorDisplayName || actorUsername;
  
  // Truncate content preview if needed
  const preview = contentPreview 
    ? (contentPreview.length > 100 ? contentPreview.substring(0, 97) + '...' : contentPreview)
    : '';

  switch (activityType) {
    case 'post_comment':
      return {
        subject: `${actorName} commented on your post`,
        message: `${actorName} commented on your post: "${preview}"`,
        actionText: 'View Comment'
      };
    
    case 'comment_reply':
      return {
        subject: `${actorName} replied to your comment`,
        message: `${actorName} replied to your comment: "${preview}"`,
        actionText: 'View Reply'
      };
    
    case 'post_like':
      return {
        subject: `${actorName} liked your post`,
        message: `${actorName} liked your post. Keep sharing great content!`,
        actionText: 'View Post'
      };
    
    case 'comment_like':
      return {
        subject: `${actorName} liked your comment`,
        message: `${actorName} liked your comment: "${preview}"`,
        actionText: 'View Comment'
      };
    
    case 'new_follower':
      return {
        subject: `${actorName} is now following you on Greenupp`,
        message: `${actorName} (@${actorUsername}) started following you on Greenupp. Check out their profile!`,
        actionText: 'View Profile'
      };
    
    case 'post_share':
      return {
        subject: `${actorName} shared your post`,
        message: `${actorName} shared your post with their followers. Your content is reaching more people!`,
        actionText: 'View Original Post'
      };
    
    case 'post_save':
      return {
        subject: `${actorName} saved your post`,
        message: `${actorName} saved your post to their collection. Your content resonated with them!`,
        actionText: 'View Post'
      };
    
    case 'post_mention':
      return {
        subject: `${actorName} mentioned you in a post`,
        message: `${actorName} mentioned you in a post: "${preview}"`,
        actionText: 'View Post'
      };
    
    case 'comment_mention':
      return {
        subject: `${actorName} mentioned you in a comment`,
        message: `${actorName} mentioned you in a comment: "${preview}"`,
        actionText: 'View Comment'
      };
    
    default:
      return {
        subject: 'New activity on Greenupp',
        message: `There's new activity related to your content on Greenupp.`,
        actionText: 'View Activity'
      };
  }
}

/**
 * Create a URL to the resource in the app
 */
function createResourceUrl(activityType: SocialActivityType, resourceId?: number): string {
  // Base URL for the app - you might want to move this to an environment variable
  const baseUrl = 'https://greenupp.app';
  
  if (!resourceId) {
    return `${baseUrl}/green-socials`;
  }
  
  switch (activityType) {
    case 'post_comment':
    case 'post_like':
    case 'post_share':
    case 'post_save':
    case 'post_mention':
      return `${baseUrl}/green-socials/posts/${resourceId}`;
    
    case 'comment_reply':
    case 'comment_like':
    case 'comment_mention':
      return `${baseUrl}/green-socials/comments/${resourceId}`;
    
    case 'new_follower':
      return `${baseUrl}/green-socials/profile/${resourceId}`;
    
    default:
      return `${baseUrl}/green-socials`;
  }
}