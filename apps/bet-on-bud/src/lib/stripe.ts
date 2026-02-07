/**
 * Stripe Integration
 *
 * For testing: Leave VITE_STRIPE_ENABLED unset or "false" - payments will be skipped
 * For production: Set VITE_STRIPE_ENABLED="true" and configure Stripe
 */

const STRIPE_ENABLED = import.meta.env.VITE_STRIPE_ENABLED === "true";

export interface CreateCheckoutParams {
  amount: number; // in dollars
  guesserName: string;
  guesserEmail: string;
  guessId: string;
}

// For now, this is a placeholder that skips payment in test mode
// When ready for real payments, we'll set up Stripe Checkout
export const redirectToCheckout = async ({
  amount,
  guesserName,
  guesserEmail,
  guessId,
}: CreateCheckoutParams): Promise<{ error?: string }> => {

  if (!STRIPE_ENABLED) {
    // Skip payment for testing - return error to trigger the fallback flow
    console.log(`[TEST MODE] Would charge $${amount} to ${guesserName} (${guesserEmail}) for guess ${guessId}`);
    return { error: "Stripe not configured - test mode" };
  }

  // TODO: Implement real Stripe checkout when ready
  // This will require either:
  // 1. A backend/serverless function to create Checkout Sessions
  // 2. Stripe Payment Links (fixed amounts only)

  return { error: "Stripe checkout not yet implemented" };
};

