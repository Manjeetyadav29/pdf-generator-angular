import { Routes } from '@angular/router';
import { tabsRoutes } from './tabs/tabs-routing.module'

export const routes: Routes = [
  {
    path: 'tabs',
    children: tabsRoutes
  },
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full'
  }
];
