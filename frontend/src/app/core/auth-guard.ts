import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth)
  const router = inject(Router)

  if(authService.getUser() === null) {
    router.navigate(['/login'])
    return false
  } else {
    return true
  }
};
