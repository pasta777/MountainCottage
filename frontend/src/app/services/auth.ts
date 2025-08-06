import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  register(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, formData);
  }

  adminLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/login`, credentials).pipe(
      tap(response => {
        if(response && response.token) {
          localStorage.setItem('admin_token', response.token);
          this.setLogoutTimer(response.token);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if(response && response.token) {
          localStorage.setItem(`user_token`, response.token);
          this.setLogoutTimer(response.token);
        }
      })
    );
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, passwordData);
  }

  logout(): void {
    localStorage.removeItem('user_token');
    localStorage.removeItem('admin_token');
    if(this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.router.navigate(['/login']);
  }

  private setLogoutTimer(token: string) {
    try {
      const decodedToken: any = jwtDecode(token);
      const expirationDuration = (decodedToken * 1000) - new Date().getTime();

      this.tokenExpirationTimer = setTimeout(() => {
        console.log("Token expired. Logging out...");
        this.logout();
      }, expirationDuration);
    } catch(error) {
      console.error("Error occured while decoding token:", error);
    }
  }

  autoLogin() {
    const token = this.getActiveToken();
    if(token) {
      const decodedToken: any = jwtDecode(token);
      if(decodedToken.exp * 1000 > new Date().getTime()) {
        this.setLogoutTimer(token);
      } else {
        this.logout();
      }
    }
  }

  getUserToken(): string | null {
    return localStorage.getItem('user_token');
  }

  getAdminToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  getActiveToken(): string | null {
    return this.getAdminToken() || this.getUserToken();
  }

  isLoggedIn(): boolean {
    return this.getActiveToken() !== null;
  }

  isAdminLoggedIn(): boolean {
    return this.getAdminToken() !== null;
  }
}
