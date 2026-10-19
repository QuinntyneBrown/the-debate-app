import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';

/** Routes of the home page, mounted at the application root. */
export const HOME_ROUTES: Routes = [{ path: '', pathMatch: 'full', component: HomePageComponent, title: 'The Debate App' }];
