import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Reservation {
  private apiUrl = 'http://localhost:3000/api/reservations';

  constructor(private http: HttpClient, private authService: Auth) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    })
  }

  createReservation(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, {headers: this.getAuthHeaders()});
  }

  getMyReservationsOwner(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/owner`, {headers: this.getAuthHeaders()});
  }

  approveReservation(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/approve`, {}, {headers: this.getAuthHeaders()});
  }

  denyReservation(id: string, comment: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/deny`, {denyComment: comment}, {headers: this.getAuthHeaders()});
  }

  getMyReservationsTourist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`, {headers: this.getAuthHeaders()});
  }

  cancelReservation(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/cancel`, {}, {headers: this.getAuthHeaders()});
  }
}
