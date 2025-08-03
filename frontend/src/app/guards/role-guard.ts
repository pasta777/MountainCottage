import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../services/auth';
import { jwtDecode } from 'jwt-decode';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const expectedRole = route.data['expectedRole'];

  const token = authService.getToken();

  if(!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const tokenPayload: any = jwtDecode(token);
    if(tokenPayload.userType === expectedRole) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  } catch(error) {
    router.navigate(['/login']);
    return false;
  }
};
