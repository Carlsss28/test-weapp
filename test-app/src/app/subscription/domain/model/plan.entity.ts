import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Subscription plan offered by StockIA to a restaurant.
 */
export class Plan implements BaseEntity {
  /** Unique identifier of the plan. */
  #id: number;
  /** Commercial name of the plan. */
  #name: string;
  /** Monthly price of the plan, in soles. */
  #monthlyPrice: number;
  /** Features included in the plan. */
  #features: string[];
  /** Whether the plan is promoted as the recommended one. */
  #highlighted: boolean;

  /**
   * Creates a plan.
   * @param plan - Initial state of the plan.
   */
  constructor(plan: {
    id: number;
    name: string;
    monthlyPrice: number;
    features: string[];
    highlighted: boolean;
  }) {
    this.#id = plan.id;
    this.#name = plan.name;
    this.#monthlyPrice = plan.monthlyPrice;
    this.#features = [...plan.features];
    this.#highlighted = plan.highlighted;
  }

  /** Unique identifier of the plan. */
  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  /** Commercial name of the plan. */
  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.#name = value;
  }

  /** Monthly price of the plan, in soles. */
  get monthlyPrice(): number {
    return this.#monthlyPrice;
  }

  set monthlyPrice(value: number) {
    this.#monthlyPrice = value;
  }

  /** Features included in the plan. */
  get features(): string[] {
    return this.#features;
  }

  set features(value: string[]) {
    this.#features = [...value];
  }

  /** Whether the plan is promoted as the recommended one. */
  get highlighted(): boolean {
    return this.#highlighted;
  }

  set highlighted(value: boolean) {
    this.#highlighted = value;
  }

  /**
   * Tells whether the plan has no monthly cost.
   * @returns `true` when the monthly price is zero.
   */
  isFree(): boolean {
    return this.#monthlyPrice === 0;
  }

  /**
   * Formats the monthly price in soles.
   * @returns The price prefixed with the currency symbol, e.g. `"S/39"`.
   */
  formattedPrice(): string {
    return `S/${this.#monthlyPrice}`;
  }
}
