import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.getUser() !== null) {
    return router.createUrlTree(['/chat']); // Redirect to chat if already logged in
  }

  return true;
};

