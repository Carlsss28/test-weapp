import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'subscription',
    loadChildren: () =>
      import('./subscription/presentation/subscription.routes').then((m) => m.subscriptionRoutes),
  },
  { path: '', redirectTo: 'subscription/plans', pathMatch: 'full' },
];
