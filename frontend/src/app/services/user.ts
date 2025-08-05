import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class User {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient, private authService: Auth) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getActiveToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`, {headers: this.getAuthHeaders()});
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, formData, {headers: this.getAuthHeaders()});
  }
}
