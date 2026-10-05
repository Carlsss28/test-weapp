import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionResource, SubscriptionsResponse } from './subscriptions-response';

/**
 * Converts between {@link Subscription} entities and {@link SubscriptionResource} resources.
 */
export class SubscriptionAssembler
  implements BaseAssembler<Subscription, SubscriptionResource, SubscriptionsResponse>
{
  /**
   * Converts a subscription resource into a subscription entity.
   * @param resource - Resource received from the API.
   */
  toEntityFromResource(resource: SubscriptionResource): Subscription {
    return new Subscription({
      id: resource.id,
      planId: resource.planId,
      status: resource.status,
      renewalDate: resource.renewalDate,
      paymentMethod: resource.paymentMethod,
    });
  }

  /**
   * Converts a subscription entity into a subscription resource.
   * The related plan is domain only and is left out of the resource.
   * @param entity - Entity to send to the API.
   */
  toResourceFromEntity(entity: Subscription): SubscriptionResource {
    return {
      id: entity.id,
      planId: entity.planId,
      status: entity.status,
      renewalDate: entity.renewalDate,
      paymentMethod: entity.paymentMethod,
    };
  }

  /**
   * Converts a wrapped subscriptions response into subscription entities.
   * @param response - Response received from the API.
   */
  toEntitiesFromResponse(response: SubscriptionsResponse): Subscription[] {
    return (response.subscriptions ?? []).map((resource) => this.toEntityFromResource(resource));
  }
}
