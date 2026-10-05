import { Component, computed, input, output } from '@angular/core';
import { PaymentMethod } from '../../../domain/model/payment-method';
import { Plan } from '../../../domain/model/plan.entity';
import { Subscription } from '../../../domain/model/subscription.entity';
import { SubscriptionStatus } from '../../../domain/model/subscription-status';

/** Label shown for each subscription status. */
const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Activa',
  PENDING: 'Pendiente',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Vencida',
};

/** Badge class used for each subscription status. */
const STATUS_BADGES: Record<SubscriptionStatus, string> = {
  ACTIVE: 'badge-success',
  PENDING: 'badge-warning',
  CANCELLED: 'badge-danger',
  EXPIRED: 'badge-danger',
};

/** Label shown for each payment method. */
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  STRIPE: 'Stripe',
  PAYPAL: 'PayPal',
};

/** Formatter of renewal dates for the UI. */
const DATE_FORMATTER = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * Card summarizing the current subscription of the restaurant,
 * with the actions to renew or cancel it.
 */
@Component({
  selector: 'app-current-subscription-card',
  templateUrl: './current-subscription-card.html',
  styleUrl: './current-subscription-card.css',
})
export class CurrentSubscriptionCard {
  /** Current subscription of the restaurant. */
  readonly subscription = input.required<Subscription>();
  /** Plan of the current subscription, when it is known. */
  readonly plan = input<Plan | null>(null);
  /** Whether a payment, renewal or cancellation is being processed. */
  readonly processing = input(false);

  /** Emits when the user asks to renew the subscription. */
  readonly renew = output<void>();
  /** Emits when the user asks to cancel the subscription. */
  readonly cancelSubscription = output<void>();

  /** Label of the subscription status. */
  protected readonly statusLabel = computed(() => STATUS_LABELS[this.subscription().status]);
  /** Badge class of the subscription status. */
  protected readonly statusBadge = computed(() => STATUS_BADGES[this.subscription().status]);
  /** Label of the payment method. */
  protected readonly paymentMethodLabel = computed(
    () => PAYMENT_METHOD_LABELS[this.subscription().paymentMethod],
  );
  /** Whether the subscription is already cancelled. */
  protected readonly cancelled = computed(() => this.subscription().status === 'CANCELLED');

  /** Renewal date formatted for the UI, e.g. `31 de octubre de 2026`. */
  protected readonly renewalDateLabel = computed(() => {
    const [year, month, day] = this.subscription().renewalDate.slice(0, 10).split('-').map(Number);
    return DATE_FORMATTER.format(new Date(year, month - 1, day));
  });

  /** Days left until the renewal date, described for the UI. */
  protected readonly daysLeftLabel = computed(() => {
    const days = this.subscription().daysUntilRenewal();
    if (days < 0) return 'Fecha vencida';
    if (days === 0) return 'Vence hoy';
    return days === 1 ? '1 día' : `${days} días`;
  });
}
