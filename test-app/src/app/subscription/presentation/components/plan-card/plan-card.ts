import { Component, input, output } from '@angular/core';
import { PaymentMethod } from '../../../domain/model/payment-method';
import { Plan } from '../../../domain/model/plan.entity';

/**
 * Card showing a plan of the catalog with its price, features and payment actions.
 */
@Component({
  selector: 'app-plan-card',
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.css',
})
export class PlanCard {
  /** Plan shown by the card. */
  readonly plan = input.required<Plan>();
  /** Whether the payment of this plan is being processed. */
  readonly processing = input(false);
  /** Whether the payment actions are disabled. */
  readonly disabled = input(false);
  /** Whether the subscription to this plan has just been confirmed. */
  readonly confirmed = input(false);

  /** Emits the payment method chosen to pay this plan. */
  readonly pay = output<PaymentMethod>();
}
