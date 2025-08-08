import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.authService.userData$.pipe(
      take(1),
      map(userData => {
        const currentUser = this.authService.getCurrentUser();
        
        if (!currentUser || !userData) {
          return this.router.createUrlTree(['/auth/login']);
        }
        
        // Get the route path to determine required role
        const routePath = route.routeConfig?.path || '';
        
        // Check role-based access
        if (routePath === 'admin' && userData.role !== 'admin') {
          return this.router.createUrlTree(['/auth/login']);
        }
        
        if (routePath.startsWith('technician') && userData.role !== 'technician') {
          return this.router.createUrlTree(['/auth/login']);
        }
        
        if (routePath.startsWith('driver') && userData.role !== 'driver') {
          return this.router.createUrlTree(['/auth/login']);
        }
        
        if (routePath.startsWith('customer') && userData.role !== 'user') {
          return this.router.createUrlTree(['/auth/login']);
        }
        
        // For admin-created accounts (admin, driver, technician), allow access without email verification
        if (userData.role === 'admin' || userData.role === 'driver' || userData.role === 'technician') {
          return true;
        }
        
        // For other users, check email verification
        if (currentUser.emailVerified || userData.emailVerified) {
          return true;
        } else {
          return this.router.createUrlTree(['/auth/pending-verification']);
        }
      })
    );
  }
}