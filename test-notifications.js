const { createNotification } = require("./server/services/notifications");

async function testNotification() {
  try {
    console.log("Testing notification creation...");

    const result = await createNotification({
      userId: 1, // Replace with actual user ID
      type: "message",
      title: "Test Message Notification",
      message: "This is a test notification from the webhook system",
      data: {
        channelId: "test-channel",
        channelType: "messaging",
        messageId: "test123",
        senderId: "2",
        senderName: "Test Sender",
        channelName: "Test Channel",
      },
      actionUrl: "/dashboard/chat?channel=test-channel",
    });

    console.log("Notification created successfully:", result);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

testNotification();
