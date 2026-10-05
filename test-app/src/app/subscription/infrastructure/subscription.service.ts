import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { PlansApiEndpoint } from './plans-api-endpoint';
import { SubscriptionsApiEndpoint } from './subscriptions-api-endpoint';

/**
 * Facade over the API of the Subscription and Payment Management context.
 * Composes the plans and subscriptions endpoints behind a single service.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionService extends BaseApi {
  /** Angular HTTP client shared by the endpoints. */
  private readonly http = inject(HttpClient);
  /** Endpoint of the plans collection. */
  private readonly plansEndpoint = new PlansApiEndpoint(this.http);
  /** Endpoint of the subscriptions collection. */
  private readonly subscriptionsEndpoint = new SubscriptionsApiEndpoint(this.http);

  /**
   * Retrieves the catalog of plans.
   */
  getPlans(): Observable<Plan[]> {
    return this.plansEndpoint.getAll();
  }

  /**
   * Retrieves a single plan.
   * @param id - Identifier of the plan.
   */
  getPlan(id: number): Observable<Plan> {
    return this.plansEndpoint.getById(id);
  }

  /**
   * Retrieves every subscription.
   */
  getSubscriptions(): Observable<Subscription[]> {
    return this.subscriptionsEndpoint.getAll();
  }

  /**
   * Creates a new subscription.
   * @param subscription - Subscription to create.
   */
  createSubscription(subscription: Subscription): Observable<Subscription> {
    return this.subscriptionsEndpoint.create(subscription);
  }

  /**
   * Replaces an existing subscription.
   * @param subscription - Subscription carrying the new state.
   */
  updateSubscription(subscription: Subscription): Observable<Subscription> {
    return this.subscriptionsEndpoint.update(subscription, subscription.id);
  }
}
