import { Router, Request, Response } from "express";
import { createNotification } from "../services/notifications";
import { streamChatService } from "../services/stream-chat-service";
import { logger } from "../lib/logger";

const router = Router();

/**
 * Stream Chat webhook endpoint for message events
 * This endpoint is called by Stream Chat when messages are sent
 */
router.post("/message", async (req: Request, res: Response) => {
  try {
    const { message, channel, user } = req.body;

    logger.info(`Received message webhook from Stream Chat:`, {
      messageId: message?.id,
      channelId: channel?.id,
      userId: user?.id,
      userName: user?.name,
    });

    // Validate required data
    if (!message || !channel || !user) {
      logger.error("Invalid webhook data received:", req.body);
      return res.status(400).json({ error: "Invalid webhook data" });
    }

    // Get channel members (excluding the sender)
    const members = Object.values(channel.members || {}).filter(
      (member: any) => member.user_id !== user.id
    );

    logger.info(`Sending notifications to ${members.length} channel members`);

    // Create notifications for each member
    const notificationPromises = members.map(async (member: any) => {
      try {
        const userId = parseInt(member.user_id);

        // Truncate message text for notification
        const messageText = message.text || "";
        const truncatedText =
          messageText.length > 100
            ? messageText.substring(0, 100) + "..."
            : messageText;

        await createNotification({
          userId,
          type: "message",
          title: `New message from ${user.name}`,
          message: truncatedText,
          data: {
            channelId: channel.id,
            channelType: channel.type,
            messageId: message.id,
            senderId: user.id,
            senderName: user.name,
            channelName: channel.name || "Direct Message",
          },
          actionUrl: `/dashboard/chat?channel=${channel.id}`,
          sendEmail: false, // Don't send email for chat messages by default
        });

        logger.info(`Notification sent to user ${userId}`);
      } catch (error) {
        logger.error(
          `Failed to send notification to user ${member.user_id}:`,
          error
        );
      }
    });

    // Wait for all notifications to be processed
    await Promise.all(notificationPromises);

    res.status(200).json({
      success: true,
      notificationsSent: members.length,
    });
  } catch (error) {
    logger.error("Error processing Stream Chat webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Stream Chat webhook endpoint for channel events (member added, etc.)
 */
router.post("/channel", async (req: Request, res: Response) => {
  try {
    const { channel, user, event } = req.body;

    logger.info(`Received channel webhook from Stream Chat:`, {
      event,
      channelId: channel?.id,
      userId: user?.id,
    });

    // Handle different channel events
    switch (event) {
      case "member.added":
        // Notify the added member about the channel
        const addedMemberId = parseInt(user.id);
        await createNotification({
          userId: addedMemberId,
          type: "message",
          title: "Added to chat",
          message: `You've been added to "${channel.name}"`,
          data: {
            channelId: channel.id,
            channelType: channel.type,
            event: "member.added",
          },
          actionUrl: `/dashboard/chat?channel=${channel.id}`,
        });
        break;

      case "member.removed":
        // Notify the removed member
        const removedMemberId = parseInt(user.id);
        await createNotification({
          userId: removedMemberId,
          type: "message",
          title: "Removed from chat",
          message: `You've been removed from "${channel.name}"`,
          data: {
            channelId: channel.id,
            channelType: channel.type,
            event: "member.removed",
          },
          actionUrl: `/dashboard/chat`,
        });
        break;

      default:
        logger.info(`Unhandled channel event: ${event}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Error processing Stream Chat channel webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Health check endpoint for webhooks
 */
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "stream-chat-webhooks",
  });
});

export default router;
