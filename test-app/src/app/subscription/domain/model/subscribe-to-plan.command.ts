import { PaymentMethod } from './payment-method';

/**
 * Command expressing the intent of subscribing the restaurant to a plan.
 */
export class SubscribeToPlanCommand {
  /** Identifier of the plan to subscribe to. */
  #planId: number;
  /** Payment provider chosen to pay the subscription. */
  #paymentMethod: PaymentMethod;

  /**
   * Creates the command.
   * @param command - Plan and payment method chosen by the user.
   */
  constructor(command: { planId: number; paymentMethod: PaymentMethod }) {
    this.#planId = command.planId;
    this.#paymentMethod = command.paymentMethod;
  }

  /** Identifier of the plan to subscribe to. */
  get planId(): number {
    return this.#planId;
  }

  set planId(value: number) {
    this.#planId = value;
  }

  /** Payment provider chosen to pay the subscription. */
  get paymentMethod(): PaymentMethod {
    return this.#paymentMethod;
  }

  set paymentMethod(value: PaymentMethod) {
    this.#paymentMethod = value;
  }
}
