/**
 * Lifecycle states of a subscription.
 * - `ACTIVE`: the subscription is paid and in force.
 * - `CANCELLED`: the restaurant cancelled the subscription.
 * - `EXPIRED`: the renewal date passed without a payment.
 * - `PENDING`: the subscription is awaiting payment confirmation.
 */
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
