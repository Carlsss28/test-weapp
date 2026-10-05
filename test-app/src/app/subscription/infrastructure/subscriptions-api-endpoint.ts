import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionAssembler } from './subscription-assembler';
import { SubscriptionResource, SubscriptionsResponse } from './subscriptions-response';

/** Absolute URL of the subscriptions collection. */
const subscriptionsEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSubscriptionsEndpointPath}`;

/**
 * API endpoint for the subscriptions collection.
 */
export class SubscriptionsApiEndpoint extends BaseApiEndpoint<
  Subscription,
  SubscriptionResource,
  SubscriptionsResponse,
  SubscriptionAssembler
> {
  /**
   * @param http - Angular HTTP client.
   */
  constructor(http: HttpClient) {
    super(http, subscriptionsEndpointUrl, new SubscriptionAssembler());
  }

  /**
   * Creates a new subscription.
   * The id is left out of the request so the API assigns it.
   * @param entity - Subscription to create.
   */
  override create(entity: Subscription): Observable<Subscription> {
    const { id, ...resource } = this.assembler.toResourceFromEntity(entity);
    return this.http.post<SubscriptionResource>(this.endpointUrl, resource).pipe(
      map((created) => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create subscription')),
    );
  }
}
