import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { Plan } from '../domain/model/plan.entity';
import { SubscribeToPlanCommand } from '../domain/model/subscribe-to-plan.command';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionService } from '../infrastructure/subscription.service';

/**
 * Application state and use cases of the Subscription and Payment Management context.
 * Presentation components talk to this store, never to the API service directly.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionStore {
  /** Facade over the context API. */
  private readonly subscriptionService = inject(SubscriptionService);

  private readonly plansSignal = signal<Plan[]>([]);
  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  private readonly pendingLoadsSignal = signal(0);
  private readonly processingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  /** Whether the subscriptions have been loaded at least once. */
  private subscriptionsLoaded = false;

  /** Catalog of plans. */
  readonly plans = this.plansSignal.asReadonly();
  /** Subscriptions returned by the API. */
  readonly subscriptions = this.subscriptionsSignal.asReadonly();
  /** Whether a payment, renewal or cancellation is being processed. */
  readonly processing = this.processingSignal.asReadonly();
  /** Message of the last failed use case, or `null` when there is none. */
  readonly error = this.errorSignal.asReadonly();
  /** Whether plans or subscriptions are being loaded. */
  readonly loading = computed(() => this.pendingLoadsSignal() > 0);

  /** Subscription of the restaurant: the first one returned by the API. */
  readonly currentSubscription = computed<Subscription | null>(
    () => this.subscriptionsSignal()[0] ?? null,
  );

  /** Plan of the current subscription, once both have been loaded. */
  readonly currentPlan = computed<Plan | null>(() => {
    const subscription = this.currentSubscription();
    if (!subscription) return null;
    return this.plansSignal().find((plan) => plan.id === subscription.planId) ?? null;
  });

  /**
   * Loads the catalog of plans.
   */
  async loadPlans(): Promise<void> {
    const plans = await this.load(
      this.subscriptionService.getPlans(),
      'No se pudieron cargar los planes',
    );
    if (plans) this.plansSignal.set(plans);
  }

  /**
   * Loads the subscriptions; the first one becomes the current subscription.
   */
  async loadCurrentSubscription(): Promise<void> {
    const subscriptions = await this.load(
      this.subscriptionService.getSubscriptions(),
      'No se pudo cargar la suscripción',
    );
    if (subscriptions) {
      this.subscriptionsSignal.set(subscriptions);
      this.subscriptionsLoaded = true;
    }
  }

  /**
   * Subscribes the restaurant to a plan with a simulated payment.
   * Updates the current subscription when there is one; creates it otherwise.
   * The subscriptions are loaded first when needed, so an existing subscription
   * is never duplicated.
   * @param command - Plan and payment method chosen by the user.
   * @returns `true` when the subscription was saved.
   */
  async subscribeToPlan(command: SubscribeToPlanCommand): Promise<boolean> {
    if (!this.subscriptionsLoaded) await this.loadCurrentSubscription();
    if (!this.subscriptionsLoaded) return false;

    const current = this.currentSubscription();
    const subscription = new Subscription({
      id: current?.id ?? 0,
      planId: command.planId,
      status: 'ACTIVE',
      renewalDate: Subscription.nextRenewalDate(),
      paymentMethod: command.paymentMethod,
    });
    const request = current
      ? this.subscriptionService.updateSubscription(subscription)
      : this.subscriptionService.createSubscription(subscription);
    return this.save(request, 'No se pudo procesar el pago');
  }

  /**
   * Cancels the current subscription.
   * @returns `true` when the subscription was saved.
   */
  cancelSubscription(): Promise<boolean> {
    const subscription = this.copyOfCurrentSubscription();
    if (!subscription) return this.failWithoutSubscription();
    subscription.cancel();
    return this.save(
      this.subscriptionService.updateSubscription(subscription),
      'No se pudo cancelar la suscripción',
    );
  }

  /**
   * Renews the current subscription for one more billing period.
   * @returns `true` when the subscription was saved.
   */
  renewSubscription(): Promise<boolean> {
    const subscription = this.copyOfCurrentSubscription();
    if (!subscription) return this.failWithoutSubscription();
    subscription.renew();
    return this.save(
      this.subscriptionService.updateSubscription(subscription),
      'No se pudo renovar la suscripción',
    );
  }

  /**
   * Runs a query, tracking the loading and error state.
   * @param request - Query to run.
   * @param fallback - Error message shown when the query fails.
   * @returns The result, or `null` when the query failed.
   */
  private async load<T>(request: Observable<T>, fallback: string): Promise<T | null> {
    this.pendingLoadsSignal.update((count) => count + 1);
    this.errorSignal.set(null);
    try {
      return await firstValueFrom(request);
    } catch (error) {
      this.errorSignal.set(this.formatError(error, fallback));
      return null;
    } finally {
      this.pendingLoadsSignal.update((count) => count - 1);
    }
  }

  /**
   * Saves a subscription, tracking the processing and error state,
   * and stores the result returned by the API.
   * @param request - Create or update request.
   * @param fallback - Error message shown when the request fails.
   * @returns `true` when the subscription was saved.
   */
  private async save(request: Observable<Subscription>, fallback: string): Promise<boolean> {
    this.processingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const saved = await firstValueFrom(request);
      this.subscriptionsSignal.update((subscriptions) =>
        subscriptions.some((subscription) => subscription.id === saved.id)
          ? subscriptions.map((subscription) =>
              subscription.id === saved.id ? saved : subscription,
            )
          : [...subscriptions, saved],
      );
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, fallback));
      return false;
    } finally {
      this.processingSignal.set(false);
    }
  }

  /**
   * Copies the current subscription so it can be changed without mutating the state.
   * @returns The copy, or `null` when there is no current subscription.
   */
  private copyOfCurrentSubscription(): Subscription | null {
    const current = this.currentSubscription();
    if (!current) return null;
    return new Subscription({
      id: current.id,
      planId: current.planId,
      status: current.status,
      renewalDate: current.renewalDate,
      paymentMethod: current.paymentMethod,
    });
  }

  /**
   * Reports that a use case needs a current subscription and there is none.
   */
  private failWithoutSubscription(): Promise<boolean> {
    this.errorSignal.set('No hay una suscripción activa');
    return Promise.resolve(false);
  }

  /**
   * Builds the message shown to the user for a failed use case.
   * @param error - Error thrown by the API service.
   * @param fallback - Message describing the failed use case.
   */
  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.includes('Resource not found')) {
      return `${fallback}: recurso no encontrado`;
    }
    return fallback;
  }
}
