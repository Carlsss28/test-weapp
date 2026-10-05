import { Routes } from '@angular/router';

/**
 * Routes of the Subscription and Payment Management context.
 * Registered under the `subscription` path of the application.
 */
export const subscriptionRoutes: Routes = [
  {
    path: 'plans',
    title: 'Planes y suscripción · StockIA',
    loadComponent: () => import('./views/plan-list/plan-list').then((m) => m.PlanList),
  },
  {
    path: 'checkout/:planId',
    title: 'Confirmar pago · StockIA',
    loadComponent: () =>
      import('./views/payment-checkout/payment-checkout').then((m) => m.PaymentCheckout),
  },
  { path: '', redirectTo: 'plans', pathMatch: 'full' },
];
