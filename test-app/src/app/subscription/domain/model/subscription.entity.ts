import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { PaymentMethod } from './payment-method';
import { Plan } from './plan.entity';
import { SubscriptionStatus } from './subscription-status';

/** Number of days added to the renewal date on each billing period. */
const BILLING_PERIOD_DAYS = 30;

/** Milliseconds in one day. */
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Subscription of a restaurant to a StockIA plan.
 */
export class Subscription implements BaseEntity {
  /** Unique identifier of the subscription. */
  #id: number;
  /** Identifier of the subscribed plan. */
  #planId: number;
  /** Current lifecycle state. */
  #status: SubscriptionStatus;
  /** Next renewal date, in ISO format (`YYYY-MM-DD`). */
  #renewalDate: string;
  /** Payment provider used to pay the subscription. */
  #paymentMethod: PaymentMethod;
  /** Subscribed plan. Domain only: it is not sent to the API. */
  #plan: Plan | null;

  /**
   * Creates a subscription.
   * @param subscription - Initial state of the subscription.
   */
  constructor(subscription: {
    id: number;
    planId: number;
    status: SubscriptionStatus;
    renewalDate: string;
    paymentMethod: PaymentMethod;
    plan?: Plan | null;
  }) {
    this.#id = subscription.id;
    this.#planId = subscription.planId;
    this.#status = subscription.status;
    this.#renewalDate = subscription.renewalDate;
    this.#paymentMethod = subscription.paymentMethod;
    this.#plan = subscription.plan ?? null;
  }

  /** Unique identifier of the subscription. */
  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  /** Identifier of the subscribed plan. */
  get planId(): number {
    return this.#planId;
  }

  set planId(value: number) {
    this.#planId = value;
  }

  /** Current lifecycle state. */
  get status(): SubscriptionStatus {
    return this.#status;
  }

  set status(value: SubscriptionStatus) {
    this.#status = value;
  }

  /** Next renewal date, in ISO format (`YYYY-MM-DD`). */
  get renewalDate(): string {
    return this.#renewalDate;
  }

  set renewalDate(value: string) {
    this.#renewalDate = value;
  }

  /** Payment provider used to pay the subscription. */
  get paymentMethod(): PaymentMethod {
    return this.#paymentMethod;
  }

  set paymentMethod(value: PaymentMethod) {
    this.#paymentMethod = value;
  }

  /** Subscribed plan. Domain only: it is not sent to the API. */
  get plan(): Plan | null {
    return this.#plan;
  }

  set plan(value: Plan | null) {
    this.#plan = value;
  }

  /**
   * Tells whether the subscription is in force.
   * @returns `true` when the status is `ACTIVE`.
   */
  isActive(): boolean {
    return this.#status === 'ACTIVE';
  }

  /**
   * Computes the days left until the renewal date.
   * @param today - Reference date. Defaults to the current date.
   * @returns Whole days until renewal; negative when the date already passed.
   */
  daysUntilRenewal(today: Date = new Date()): number {
    const renewal = Subscription.parseDate(this.#renewalDate);
    const reference = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.round((renewal.getTime() - reference.getTime()) / MILLISECONDS_PER_DAY);
  }

  /**
   * Cancels the subscription.
   */
  cancel(): void {
    this.#status = 'CANCELLED';
  }

  /**
   * Renews the subscription for one more billing period:
   * moves the renewal date 30 days forward and activates it.
   */
  renew(): void {
    this.#renewalDate = Subscription.addDays(this.#renewalDate, BILLING_PERIOD_DAYS);
    this.#status = 'ACTIVE';
  }

  /**
   * Computes the renewal date of a billing period starting on the given date.
   * @param from - Start of the billing period. Defaults to the current date.
   * @returns The renewal date in ISO format (`YYYY-MM-DD`).
   */
  static nextRenewalDate(from: Date = new Date()): string {
    return Subscription.addDays(Subscription.formatDate(from), BILLING_PERIOD_DAYS);
  }

  /**
   * Adds days to an ISO date.
   * @param isoDate - Date in ISO format (`YYYY-MM-DD`).
   * @param days - Days to add.
   * @returns The resulting date in ISO format.
   */
  private static addDays(isoDate: string, days: number): string {
    const date = Subscription.parseDate(isoDate);
    date.setDate(date.getDate() + days);
    return Subscription.formatDate(date);
  }

  /**
   * Parses an ISO date as a local calendar date, ignoring any time part.
   * @param isoDate - Date in ISO format (`YYYY-MM-DD`).
   */
  private static parseDate(isoDate: string): Date {
    const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Formats a date as an ISO calendar date using its local components.
   * @param date - Date to format.
   * @returns The date in ISO format (`YYYY-MM-DD`).
   */
  private static formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
