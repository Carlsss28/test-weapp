import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SubscriptionStore } from '../../../application/subscription.store';
import { PaymentMethod } from '../../../domain/model/payment-method';
import { SubscribeToPlanCommand } from '../../../domain/model/subscribe-to-plan.command';

/** Route of the plan list, where the user returns after the checkout. */
const PLAN_LIST_ROUTE = '/subscription/plans';

/** Payment methods offered in the checkout. */
const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'STRIPE', label: 'Stripe', description: 'Tarjeta de crédito o débito' },
  { value: 'PAYPAL', label: 'PayPal', description: 'Saldo o cuenta PayPal' },
];

/**
 * Checkout page: confirms the simulated payment of the plan given in the route.
 */
@Component({
  selector: 'app-payment-checkout',
  imports: [RouterLink],
  templateUrl: './payment-checkout.html',
  styleUrl: './payment-checkout.css',
})
export class PaymentCheckout implements OnInit {
  /** Store of the subscription context. */
  protected readonly store = inject(SubscriptionStore);
  private readonly router = inject(Router);

  /** Identifier of the plan to pay, taken from the route. */
  private readonly planId = Number(inject(ActivatedRoute).snapshot.paramMap.get('planId'));

  /** Route of the plan list. */
  protected readonly planListRoute = PLAN_LIST_ROUTE;
  /** Payment methods offered to the user. */
  protected readonly paymentMethods = PAYMENT_METHOD_OPTIONS;
  /** Payment method chosen by the user. */
  protected readonly paymentMethod = signal<PaymentMethod>('STRIPE');

  /** Plan to pay, once the catalog has been loaded. */
  protected readonly plan = computed(
    () => this.store.plans().find((plan) => plan.id === this.planId) ?? null,
  );

  /** Loads the plans and the current subscription. */
  ngOnInit(): void {
    this.store.loadPlans();
    this.store.loadCurrentSubscription();
  }

  /** Confirms the simulated payment and returns to the plan list. */
  protected async confirm(): Promise<void> {
    const plan = this.plan();
    if (!plan || this.store.processing()) return;

    const subscribed = await this.store.subscribeToPlan(
      new SubscribeToPlanCommand({ planId: plan.id, paymentMethod: this.paymentMethod() }),
    );
    if (subscribed) await this.router.navigateByUrl(PLAN_LIST_ROUTE);
  }
}
