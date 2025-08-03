import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'https://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, formData);
  }

  adminLogin(credentials: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/login`, credentials).pipe(
      tap(response => {
        if(response && response.token) {
          localStorage.setItem('admin_token', response.token);
        }
      })
    );
  }

  getAdminToken(): string | null {
    return localStorage.getItem('admin_token');
  }
}
