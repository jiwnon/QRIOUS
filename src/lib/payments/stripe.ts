/**
 * Stripe 연동 (외국인 결제)
 */
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export function getStripePublishableKey() {
  return STRIPE_PUBLISHABLE_KEY ?? '';
}

export function getStripeSecretKey() {
  return STRIPE_SECRET_KEY ?? '';
}

export function getStripeWebhookSecret() {
  return STRIPE_WEBHOOK_SECRET ?? '';
}
