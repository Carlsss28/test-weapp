import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { PaymentMethod } from '../domain/model/payment-method';
import { SubscriptionStatus } from '../domain/model/subscription-status';

/**
 * Subscription as exchanged with the API.
 */
export interface SubscriptionResource extends BaseResource {
  /** Unique identifier of the subscription. */
  id: number;
  /** Identifier of the subscribed plan. */
  planId: number;
  /** Current lifecycle state. */
  status: SubscriptionStatus;
  /** Next renewal date, in ISO format (`YYYY-MM-DD`). */
  renewalDate: string;
  /** Payment provider used to pay the subscription. */
  paymentMethod: PaymentMethod;
}

/**
 * Wrapped collection of subscriptions.
 * The API currently answers with a plain array, handled by the base endpoint.
 */
export interface SubscriptionsResponse extends BaseResponse {
  /** Subscriptions contained in the response. */
  subscriptions: SubscriptionResource[];
}
