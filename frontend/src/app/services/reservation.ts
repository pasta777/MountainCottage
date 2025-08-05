import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Reservation {
  private apiUrl = 'http://localhost:3000/api/reservations';

  constructor(private http: HttpClient) {}

  createReservation(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  getMyReservationsOwner(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/owner`);
  }

  approveReservation(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/approve`, {});
  }

  denyReservation(id: string, comment: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/deny`, {denyComment: comment});
  }

  getMyReservationsTourist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }

  cancelReservation(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
