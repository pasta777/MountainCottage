import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  register(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, formData);
  }

  adminLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/login`, credentials).pipe(
      tap(response => {
        if(response && response.token) {
          localStorage.setItem('admin_token', response.token);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if(response && response.token) {
          localStorage.setItem(`user_token`, response.token);
        }
      })
    );
  }

  changePassword(passwordData: any): Observable<any> {
    const token = this.getUserToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/change-password`, passwordData, {headers: headers});
  }

  logout(): void {
    localStorage.removeItem('user_token');
    localStorage.removeItem('admin_token');

    this.router.navigate(['/login']);
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
