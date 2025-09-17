import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs/tabs.component';
import { ChartTabComponent } from './chart-tab/chart-tab.component';
import { ProfileTabComponent } from './profile-tab/profile-tab.component';
import { SocialmediaTabComponent } from './socialmedia-tab/socialmedia-tab.component';

export const tabsRoutes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      { path: 'chart', component: ChartTabComponent },
      { path: 'profile', component: ProfileTabComponent },
      { path: 'socialmedia', component: SocialmediaTabComponent },
      { path: '', redirectTo: 'chart', pathMatch: 'full' }
    ]
  }
];
