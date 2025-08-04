import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Admin {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient, private authService: Auth) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAdminToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getRegistrationRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/registration-requests`, {headers: this.getAuthHeaders()});
  }

  approveRequest(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/approve-request/${userId}`, {}, {headers: this.getAuthHeaders()});
  }

  rejectRequest(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reject-request/${userId}`, {}, {headers: this.getAuthHeaders()});
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, {headers: this.getAuthHeaders()});
  }

  toggleUserStatus(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/${userId}/toggle-status`, {}, {headers: this.getAuthHeaders()});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`, {headers: this.getAuthHeaders()});
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, userData, {headers: this.getAuthHeaders()});
  }
}
