import { Routes } from '@angular/router';
import { Login } from './auth/login/login'; // Import your new component
import { Chat } from './chat/chat';
import { authGuard } from './core/auth-guard';
import { guestGuard } from './core/guest-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'chat', component: Chat, canActivate: [authGuard] },
  { path: '**', redirectTo: 'chat' }
];