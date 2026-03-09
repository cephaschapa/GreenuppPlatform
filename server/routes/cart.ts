import { Request, Response, Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  carts,
  cartItems,
  marketplaceListings,
  inventory,
  insertCartItemSchema,
  type Cart,
} from "../../shared/schema";
import {
  createStripePaymentIntent,
  confirmStripePayment,
} from "../payment/stripe";
import {
  createMetatronPayIntent,
  verifyMetatronPayment,
} from "../payment/metatronPay";
import { storage } from "../storage.js";
import { createNotification } from "../services/notifications.js";

// Create a new router
const router = Router();

// Helper function to ensure user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

/**
 * Get active or checkout cart for current user
 * If no cart is found, create one
 */
async function getOrCreateCart(
  userId: number,
  includeCheckout: boolean = false
): Promise<Cart> {
  // Always prioritize active carts first
  const [activeCart] = await db
    .select()
    .from(carts)
    .where(and(eq(carts.userId, userId), eq(carts.status, "active")));

  if (activeCart) {
    console.log(`Found active cart for user ${userId}, id: ${activeCart.id}`);
    return activeCart;
  }

  // Only check for checkout carts if explicitly requested
  if (includeCheckout) {
    const [checkoutCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "checkout")));

    if (checkoutCart) {
      console.log(
        `Found checkout cart for user ${userId}, id: ${checkoutCart.id}`
      );
      return checkoutCart;
    }
  }

  // Create a new cart if none exists
  console.log(`Creating new cart for user ${userId}`);
  const [newCart] = await db
    .insert(carts)
    .values({
      userId,
      status: "active",
      subtotal: "0",
      shipping: "0",
      tax: "0",
      total: "0",
    })
    .returning();

  return newCart;
}

/**
 * Recalculate cart totals
 */
async function updateCartTotals(cartId: number): Promise<void> {
  // Get cart items
  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));

  // Calculate subtotal
  let subtotal = 0;
  for (const item of items) {
    subtotal += Number(item.price) * item.quantity;
  }

  // Update cart with new totals
  // For now, we set shipping to 0 and no tax
  await db
    .update(carts)
    .set({
      subtotal: subtotal.toString(),
      total: subtotal.toString(), // No shipping or tax for now
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId));
}

// GET /api/cart - Get the user's cart
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get or create the user's cart - include checkout status carts
    const cart = await getOrCreateCart(userId, true);

    // Get cart items with their listings
    const rawItems = await db
      .select({
        item: cartItems,
        listing: marketplaceListings,
      })
      .from(cartItems)
      .leftJoin(
        marketplaceListings,
        eq(cartItems.listingId, marketplaceListings.id)
      )
      .where(eq(cartItems.cartId, cart.id));

    // Transform data to match frontend expectations
    const items = rawItems.map((row) => {
      return {
        ...row.item,
        listing: row.listing, // Add the listing property in the expected format
      };
    });

    console.log(
      `GET /api/cart - Found cart with status: ${cart.status}, id: ${cart.id}, items: ${items.length}`
    );

    // Create a modified response format to work with the frontend
    const cartWithItems = {
      ...cart,
      items,
    };

    // Return cart with items directly embedded
    res.status(200).json(cartWithItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// POST /api/cart/items - Add item to cart
router.post("/items", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const validateResult = insertCartItemSchema.safeParse(req.body);

    if (!validateResult.success) {
      return res.status(400).json({
        message: "Invalid cart item data",
        errors: validateResult.error.errors,
      });
    }

    const { listingId, quantity, notes } = validateResult.data;

    // Get listing to verify it exists and get price
    const [listing] = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, listingId));

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const requestedQty = quantity ?? 1;

    // If listing has inventory, enforce available quantity (single source of truth)
    const [inv] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.listingId, listingId))
      .limit(1);
    if (inv) {
      const available = parseFloat(inv.availableQuantity ?? "0");
      if (requestedQty > available) {
        return res.status(400).json({
          message:
            available <= 0
              ? "This item is out of stock"
              : `Only ${available} available. Reduce quantity and try again.`,
        });
      }
    }

    // Get or create the user's cart
    const cart = await getOrCreateCart(userId);

    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.cartId, cart.id), eq(cartItems.listingId, listingId))
      );

    if (existingItem) {
      const newQty = existingItem.quantity + (quantity || 1);
      if (inv) {
        const available = parseFloat(inv.availableQuantity ?? "0");
        if (newQty > available) {
          return res.status(400).json({
            message:
              available <= 0
                ? "This item is out of stock"
                : `Only ${available} available. You have ${existingItem.quantity} in cart. Reduce and try again.`,
          });
        }
      }
      // Update quantity if item already exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: newQty,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();

      // Update cart totals
      await updateCartTotals(cart.id);

      return res.status(200).json(updatedItem);
    }

    // Add new item to cart
    const [newItem] = await db
      .insert(cartItems)
      .values({
        cartId: cart.id,
        listingId,
        quantity: quantity || 1,
        price: listing.price.toString(),
        priceUnit: listing.priceUnit,
        notes,
      })
      .returning();

    // Update cart totals
    await updateCartTotals(cart.id);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
});

// PUT /api/cart/items/:id - Update cart item quantity
router.put("/items/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive number" });
    }

    // Get the item first to check which cart it belongs to
    const [item] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, itemId));

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Now get the correct cart (could be active or checkout)
    const [userCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.id, item.cartId), eq(carts.userId, userId)));

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the item belongs to user's cart
    if (item.cartId !== userCart.id) {
      return res.status(404).json({ message: "Item not found in your cart" });
    }

    const [inv] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.listingId, item.listingId))
      .limit(1);
    if (inv) {
      const available = parseFloat(inv.availableQuantity ?? "0");
      if (quantity > available) {
        return res.status(400).json({
          message:
            available <= 0
              ? "This item is out of stock"
              : `Only ${available} available. Reduce quantity and try again.`,
        });
      }
    }

    // Update the item quantity
    const [updatedItem] = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, itemId))
      .returning();

    // Update cart totals
    await updateCartTotals(userCart.id);

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Failed to update cart item" });
  }
});

// DELETE /api/cart/items/:id - Remove item from cart
router.delete("/items/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    // Get the item first to check which cart it belongs to
    const [item] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, itemId));

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Now get the correct cart (could be active or checkout)
    const [userCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.id, item.cartId), eq(carts.userId, userId)));

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the item belongs to user's cart
    if (item.cartId !== userCart.id) {
      return res.status(404).json({ message: "Item not found in your cart" });
    }

    // Delete the item
    await db.delete(cartItems).where(eq(cartItems.id, itemId));

    // Update cart totals
    await updateCartTotals(userCart.id);

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
});

// DELETE /api/cart/clear - Remove all items from cart
router.delete("/clear", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user's active cart
    const [userCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")));

    if (!userCart) {
      // If no active cart, check if there's a checkout cart
      const [checkoutCart] = await db
        .select()
        .from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.status, "checkout")));

      if (checkoutCart) {
        // Reset the checkout cart to active and empty it
        console.log(
          `Reset checkout cart ${checkoutCart.id} to active and empty it`
        );

        // Delete all items
        await db.delete(cartItems).where(eq(cartItems.cartId, checkoutCart.id));

        // Reset cart status and totals
        await db
          .update(carts)
          .set({
            status: "active",
            subtotal: "0",
            shipping: "0",
            tax: "0",
            total: "0",
            paymentProvider: null,
            paymentIntentId: null,
            updatedAt: new Date(),
          })
          .where(eq(carts.id, checkoutCart.id));

        return res
          .status(200)
          .json({ message: "Checkout cart cleared and reset to active" });
      }

      return res.status(404).json({ message: "No active cart found" });
    }

    // Delete all items from active cart
    await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));

    // Reset cart totals
    await db
      .update(carts)
      .set({
        subtotal: "0",
        shipping: "0",
        tax: "0",
        total: "0",
        updatedAt: new Date(),
      })
      .where(eq(carts.id, userCart.id));

    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

// POST /api/cart/checkout - Begin checkout process
router.post("/checkout", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user's active cart
    const [userCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")));

    if (!userCart) {
      return res.status(404).json({ message: "No active cart found" });
    }

    // Get cart items to verify cart isn't empty
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, userCart.id));

    if (items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cannot checkout with empty cart" });
    }

    // Set cart status to checkout
    const [updatedCart] = await db
      .update(carts)
      .set({
        status: "checkout",
        updatedAt: new Date(),
      })
      .where(eq(carts.id, userCart.id))
      .returning();

    res.status(200).json({
      message: "Checkout process started",
      cart: updatedCart,
      items,
    });
  } catch (error) {
    console.error("Error starting checkout:", error);
    res.status(500).json({ message: "Failed to start checkout process" });
  }
});

// POST /api/cart/payment/stripe - Create a Stripe payment intent
router.post("/payment/stripe", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user's cart in checkout status
    const [userCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "checkout")));

    if (!userCart) {
      return res
        .status(404)
        .json({ message: "No cart in checkout status found" });
    }

    // Get cart items
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, userCart.id));

    if (items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cannot create payment intent with empty cart" });
    }

    // Create Stripe payment intent
    const paymentIntent = await createStripePaymentIntent(userCart, items);

    // Update cart with payment information
    await db
      .update(carts)
      .set({
        paymentProvider: "stripe",
        paymentIntentId: paymentIntent.paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, userCart.id));

    res.status(200).json({
      clientSecret: paymentIntent.clientSecret,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error("Error creating Stripe payment intent:", error);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
});

// POST /api/cart/payment/metatron - Create a Metatron Pay intent
router.post("/payment/metatron", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user's cart in checkout status
    const [userCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "checkout")));

    if (!userCart) {
      return res
        .status(404)
        .json({ message: "No cart in checkout status found" });
    }

    // Get cart items
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, userCart.id));

    if (items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cannot create payment with empty cart" });
    }

    // Create Metatron Pay intent
    const paymentIntent = await createMetatronPayIntent(userCart, items);

    // Update cart with payment information
    await db
      .update(carts)
      .set({
        paymentProvider: "metatron",
        paymentIntentId: paymentIntent.paymentId,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, userCart.id));

    res.status(200).json({
      paymentId: paymentIntent.paymentId,
      amount: paymentIntent.amount,
      redirectUrl: paymentIntent.redirectUrl,
    });
  } catch (error) {
    console.error("Error creating Metatron Pay intent:", error);
    res.status(500).json({ message: "Failed to create payment" });
  }
});

// POST /api/cart/payment/confirm - Confirm payment completion
router.post("/payment/confirm", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { paymentIntentId, provider } = req.body;

    if (!paymentIntentId || !provider) {
      return res
        .status(400)
        .json({ message: "Payment intent ID and provider are required" });
    }

    // Get user's cart with matching payment intent
    const [userCart] = await db
      .select()
      .from(carts)
      .where(
        and(
          eq(carts.userId, userId),
          eq(carts.paymentIntentId, paymentIntentId)
        )
      );

    if (!userCart) {
      return res
        .status(404)
        .json({ message: "No cart found with that payment intent" });
    }

    let paymentVerification;

    // Verify payment based on provider
    if (provider === "stripe") {
      paymentVerification = await confirmStripePayment(paymentIntentId);
    } else if (provider === "metatron") {
      paymentVerification = await verifyMetatronPayment(paymentIntentId);
    } else {
      return res.status(400).json({ message: "Invalid payment provider" });
    }

    if (!paymentVerification.success) {
      return res.status(400).json({
        message: "Payment verification failed",
        details: paymentVerification.message || "Unknown error occurred",
      });
    }

    // Get cart items with listing info to group by seller and build order payload
    const cartItemsList = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, userCart.id));

    const sellerToItems = new Map<
      number,
      Array<{ listingId: number; quantity: number; unitPrice: number }>
    >();

    for (const item of cartItemsList) {
      const listing = await storage.getMarketplaceListing(item.listingId);
      if (!listing) {
        return res.status(400).json({
          message: `Listing ${item.listingId} not found`,
        });
      }
      const sellerId = listing.sellerId;
      const unitPrice = Number(item.price);
      if (!Number.isFinite(unitPrice)) {
        return res.status(400).json({
          message: `Invalid price for listing ${item.listingId}`,
        });
      }
      const list = sellerToItems.get(sellerId) ?? [];
      list.push({
        listingId: item.listingId,
        quantity: item.quantity,
        unitPrice,
      });
      sellerToItems.set(sellerId, list);
    }

    const createdOrders: Array<{ id: number; orderNumber: string }> = [];
    const paymentMethod =
      provider === "stripe" ? "stripe" : provider === "metatron" ? "metatron" : provider;

    for (const [, items] of sellerToItems) {
      const order = await storage.createOrder({
        userId,
        items,
        paymentMethod,
      });
      createdOrders.push({
        id: order.id,
        orderNumber: order.orderNumber,
      });
      try {
        await createNotification({
          userId: order.sellerId,
          type: "new_order",
          title: `New order ${order.orderNumber}`,
          message: `You have a new order. Contact the buyer to confirm delivery.`,
          data: { orderId: order.id, orderNumber: order.orderNumber },
        });
      } catch (e) {
        console.error("Failed to notify seller of new order:", e);
      }
    }

    // Update cart status to completed
    await db
      .update(carts)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(carts.id, userCart.id));

    res.status(200).json({
      message: "Payment confirmed and order completed",
      orderIds: createdOrders.map((o) => o.id),
      orderNumbers: createdOrders.map((o) => o.orderNumber),
      orders: createdOrders,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
});

export default router;
