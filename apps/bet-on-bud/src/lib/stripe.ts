/**
 * Stripe Integration using Payment Links
 *
 * Setup:
 * 1. Create a Payment Link in Stripe Dashboard with "Customer chooses amount"
 * 2. Set VITE_STRIPE_PAYMENT_LINK_ID to the Payment Link ID (e.g., "plink_xxx" or just the ID part)
 * 3. Configure success URL in Stripe to: https://yourdomain.com/bet-on-bud/?payment=success
 */

// Payment Link ID from Stripe Dashboard (the ID after buy.stripe.com/)
const STRIPE_PAYMENT_LINK_ID = import.meta.env.VITE_STRIPE_PAYMENT_LINK_ID || "";

export interface CreateCheckoutParams {
  amount: number; // in dollars
  guesserName: string;
  guesserEmail: string;
  guessId: string;
}

// Redirect to Stripe Payment Link
export const redirectToCheckout = async ({
  guesserEmail,
  guessId,
}: CreateCheckoutParams): Promise<{ error?: string }> => {

  if (!STRIPE_PAYMENT_LINK_ID) {
    // Skip payment for testing - return error to trigger the fallback flow
    console.log(`[TEST MODE] Stripe Payment Link not configured, skipping payment`);
    return { error: "Stripe not configured - test mode" };
  }

  // Build the Stripe Payment Link URL
  // Format: https://buy.stripe.com/{id}?prefilled_email=xxx&client_reference_id=xxx
  const params = new URLSearchParams({
    prefilled_email: guesserEmail,
    client_reference_id: guessId, // This will appear in Stripe Dashboard for tracking
  });

  const checkoutUrl = `https://buy.stripe.com/${STRIPE_PAYMENT_LINK_ID}?${params.toString()}`;

  // Redirect to Stripe
  window.location.href = checkoutUrl;

  return {};
};

