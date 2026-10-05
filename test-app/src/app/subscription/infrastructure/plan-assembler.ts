import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Plan } from '../domain/model/plan.entity';
import { PlanResource, PlansResponse } from './plans-response';

/**
 * Converts between {@link Plan} entities and {@link PlanResource} resources.
 */
export class PlanAssembler implements BaseAssembler<Plan, PlanResource, PlansResponse> {
  /**
   * Converts a plan resource into a plan entity.
   * @param resource - Resource received from the API.
   */
  toEntityFromResource(resource: PlanResource): Plan {
    return new Plan({
      id: resource.id,
      name: resource.name,
      monthlyPrice: resource.monthlyPrice,
      features: resource.features ?? [],
      highlighted: resource.highlighted ?? false,
    });
  }

  /**
   * Converts a plan entity into a plan resource.
   * @param entity - Entity to send to the API.
   */
  toResourceFromEntity(entity: Plan): PlanResource {
    return {
      id: entity.id,
      name: entity.name,
      monthlyPrice: entity.monthlyPrice,
      features: [...entity.features],
      highlighted: entity.highlighted,
    };
  }

  /**
   * Converts a wrapped plans response into plan entities.
   * @param response - Response received from the API.
   */
  toEntitiesFromResponse(response: PlansResponse): Plan[] {
    return (response.plans ?? []).map((resource) => this.toEntityFromResource(resource));
  }
}
