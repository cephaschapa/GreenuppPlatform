import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage.js";

const router = Router();

// Helper function to ensure user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

// Update order status schema
const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  notes: z.string().optional(),
});

// Get orders for user (buyer or seller)
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.query.role as string;

    let orders;
    if (role === "seller") {
      orders = await storage.getSellerOrders(userId);
    } else {
      orders = await storage.getBuyerOrders(userId);
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get specific order
router.get(
  "/:orderId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user!.id;

      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check if user has access to this order (buyer or seller)
      if (order.userId !== userId && order.sellerId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  }
);

// Update order status (sellers only)
router.put(
  "/:orderId/status",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user!.id;
      const { status, notes } = updateOrderStatusSchema.parse(req.body);

      // Get order to verify seller access
      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Only sellers can update order status
      if (order.sellerId !== userId) {
        return res
          .status(403)
          .json({ error: "Only sellers can update order status" });
      }

      // Update order status
      const updatedOrder = await storage.updateOrderStatus(
        orderId,
        status,
        notes,
        userId
      );

      // Send notification to buyer about status change
      try {
        await storage.createNotification({
          userId: order.userId,
          type: "order_status_update",
          title: `Order ${order.orderNumber} ${status}`,
          message: `Your order has been ${status}${notes ? `: ${notes}` : ""}`,
          data: { orderId, status, notes },
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Don't fail the request if notification fails
      }

      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
);

// Cancel order (buyers and sellers)
router.post(
  "/:orderId/cancel",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user!.id;
      const { reason } = req.body;

      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check if user has access to cancel this order
      if (order.userId !== userId && order.sellerId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Check if order can be cancelled
      if (["delivered", "cancelled", "refunded"].includes(order.status)) {
        return res.status(400).json({ error: "Order cannot be cancelled" });
      }

      const updatedOrder = await storage.updateOrderStatus(
        orderId,
        "cancelled",
        reason || "Cancelled by user",
        userId
      );

      // Release reserved inventory
      for (const item of order.items) {
        await storage.releaseInventory(item.listingId, item.quantity);
      }

      // Send notification to the other party
      const notificationUserId =
        order.userId === userId ? order.sellerId : order.userId;
      const userRole = order.userId === userId ? "buyer" : "seller";

      try {
        await storage.createNotification({
          userId: notificationUserId,
          type: "order_cancelled",
          title: `Order ${order.orderNumber} cancelled`,
          message: `Order cancelled by ${userRole}${
            reason ? `: ${reason}` : ""
          }`,
          data: { orderId, reason },
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ error: "Failed to cancel order" });
    }
  }
);

// Request refund (buyers only)
router.post(
  "/:orderId/refund",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user!.id;
      const { reason } = req.body;

      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Only buyers can request refunds
      if (order.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Only buyers can request refunds" });
      }

      // Check if refund can be requested
      if (!["delivered", "shipped"].includes(order.status)) {
        return res.status(400).json({
          error: "Refund can only be requested for delivered or shipped orders",
        });
      }

      // Create refund request (this would typically integrate with payment processor)
      const updatedOrder = await storage.updateOrderStatus(
        orderId,
        "refunded",
        `Refund requested: ${reason || "No reason provided"}`,
        userId
      );

      // Send notification to seller
      try {
        await storage.createNotification({
          userId: order.sellerId,
          type: "refund_requested",
          title: `Refund requested for order ${order.orderNumber}`,
          message: `Buyer has requested a refund${reason ? `: ${reason}` : ""}`,
          data: { orderId, reason },
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error requesting refund:", error);
      res.status(500).json({ error: "Failed to request refund" });
    }
  }
);

// Get order tracking information
router.get(
  "/:orderId/tracking",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user!.id;

      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check if user has access to this order
      if (order.userId !== userId && order.sellerId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get delivery information if available
      const delivery = await storage.getDelivery(orderId);

      const trackingInfo = {
        orderNumber: order.orderNumber,
        status: order.status,
        statusHistory: order.statusHistory,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        actualDeliveryDate: order.actualDeliveryDate,
        delivery: delivery
          ? {
              trackingNumber: delivery.trackingNumber,
              carrier: delivery.carrier,
              status: delivery.status,
              estimatedDeliveryDate: delivery.estimatedDeliveryDate,
              actualDeliveryDate: delivery.actualDeliveryDate,
              statusHistory: delivery.statusHistory,
            }
          : null,
      };

      res.json(trackingInfo);
    } catch (error) {
      console.error("Error fetching tracking info:", error);
      res.status(500).json({ error: "Failed to fetch tracking information" });
    }
  }
);

export default router;
