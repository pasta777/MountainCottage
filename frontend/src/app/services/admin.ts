import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Admin {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  getRegistrationRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/registration-requests`);
  }

  approveRequest(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/approve-request/${userId}`, {});
  }

  rejectRequest(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reject-request/${userId}`, {});
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
  }

  toggleUserStatus(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/${userId}/toggle-status`, {});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, userData);
  }

  getAllCottages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cottages`);
  }

  blockCottage(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cottages/${id}/block`, {});
  }
}
