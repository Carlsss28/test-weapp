import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { SubscriptionStore } from '../../../application/subscription.store';
import { PaymentMethod } from '../../../domain/model/payment-method';
import { Plan } from '../../../domain/model/plan.entity';
import { SubscribeToPlanCommand } from '../../../domain/model/subscribe-to-plan.command';
import { CurrentSubscriptionCard } from '../../components/current-subscription-card/current-subscription-card';
import { PlanCard } from '../../components/plan-card/plan-card';

/** Time the confirmation badge stays visible, in milliseconds. */
const CONFIRMATION_DURATION_MS = 2500;

/**
 * "Planes y suscripción" page: shows the catalog of plans
 * and lets the restaurant pay one with a simulated payment.
 */
@Component({
  selector: 'app-plan-list',
  imports: [CurrentSubscriptionCard, PlanCard],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
export class PlanList implements OnInit {
  /** Store of the subscription context. */
  protected readonly store = inject(SubscriptionStore);

  /** Identifier of the plan whose payment is being processed. */
  protected readonly processingPlanId = signal<number | null>(null);
  /** Identifier of the plan whose subscription has just been confirmed. */
  protected readonly confirmedPlanId = signal<number | null>(null);

  /** Timer hiding the confirmation badge. */
  private confirmationTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearConfirmationTimer());
  }

  /** Loads the plans and the current subscription. */
  ngOnInit(): void {
    this.store.loadPlans();
    this.store.loadCurrentSubscription();
  }

  /**
   * Pays a plan with the chosen payment method.
   * @param plan - Plan chosen by the user.
   * @param paymentMethod - Payment method chosen by the user.
   */
  protected async choose(plan: Plan, paymentMethod: PaymentMethod): Promise<void> {
    if (this.processingPlanId() !== null) return;
    this.clearConfirmationTimer();
    this.confirmedPlanId.set(null);
    this.processingPlanId.set(plan.id);

    const subscribed = await this.store.subscribeToPlan(
      new SubscribeToPlanCommand({ planId: plan.id, paymentMethod }),
    );

    this.processingPlanId.set(null);
    if (!subscribed) return;
    this.confirmedPlanId.set(plan.id);
    this.confirmationTimer = setTimeout(
      () => this.confirmedPlanId.set(null),
      CONFIRMATION_DURATION_MS,
    );
  }

  /** Renews the current subscription for one more billing period. */
  protected renew(): void {
    this.store.renewSubscription();
  }

  /** Cancels the current subscription. */
  protected cancel(): void {
    this.store.cancelSubscription();
  }

  /** Cancels the pending confirmation timer, if any. */
  private clearConfirmationTimer(): void {
    if (this.confirmationTimer !== null) {
      clearTimeout(this.confirmationTimer);
      this.confirmationTimer = null;
    }
  }
}
