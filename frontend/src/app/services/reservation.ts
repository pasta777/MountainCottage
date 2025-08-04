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

  createReservation(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.post<any>(this.apiUrl, data, {headers});
  }
}
