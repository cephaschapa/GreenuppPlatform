import Stripe from "stripe";
import { CartItem, Cart } from "@shared/schema";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

/**
 * Create a Stripe payment intent for a cart checkout
 */
export async function createStripePaymentIntent(cart: Cart, items: CartItem[]) {
  try {
    // Calculate the total amount from the cart items (in cents)
    const amount = items.reduce((total, item) => {
      return total + Number(item.price) * item.quantity;
    }, 0);

    // Convert to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Create metadata with cart and item details
    const metadata: Record<string, string> = {
      cartId: cart.id.toString(),
      userId: cart.userId.toString(),
      itemCount: items.length.toString(),
    };

    // Add basic info about each item
    items.forEach((item, index) => {
      metadata[`item_${index}_id`] = item.id.toString();
      metadata[`item_${index}_listingId`] = item.listingId.toString();
      metadata[`item_${index}_quantity`] = item.quantity.toString();
    });

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata,
      // Payment method types - can include more methods like 'card', 'alipay', etc.
      payment_method_types: ["card"],
      // More options can be configured as needed
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
    };
  } catch (error) {
    console.error("Error creating Stripe payment intent:", error);
    throw error;
  }
}

/**
 * Confirm a successful stripe payment
 */
export async function confirmStripePayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const cartId = paymentIntent.metadata.cartId;
      return {
        success: true,
        cartId: Number(cartId),
        paymentDetails: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        },
      };
    }

    return {
      success: false,
      status: paymentIntent.status,
      message: `Payment has not succeeded. Current status: ${paymentIntent.status}`,
    };
  } catch (error) {
    console.error("Error confirming Stripe payment:", error);
    throw error;
  }
}
