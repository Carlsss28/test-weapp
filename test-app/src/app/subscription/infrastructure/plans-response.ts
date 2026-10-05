import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Plan as exchanged with the API.
 */
export interface PlanResource extends BaseResource {
  /** Unique identifier of the plan. */
  id: number;
  /** Commercial name of the plan. */
  name: string;
  /** Monthly price of the plan, in soles. */
  monthlyPrice: number;
  /** Features included in the plan. */
  features: string[];
  /** Whether the plan is promoted as the recommended one. */
  highlighted: boolean;
}

/**
 * Wrapped collection of plans.
 * The API currently answers with a plain array, handled by the base endpoint.
 */
export interface PlansResponse extends BaseResponse {
  /** Plans contained in the response. */
  plans: PlanResource[];
}
