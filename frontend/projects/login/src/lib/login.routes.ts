import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

/** Routes of the sign-in page, mounted at `login`. */
export const LOGIN_ROUTES: Routes = [{ path: '', component: LoginComponent, title: 'Sign in' }];
