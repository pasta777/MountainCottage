import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Stats {
  private apiUrl = 'http://localhost:3000/api/stats';

  constructor(private http: HttpClient, private authService: Auth) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getActiveToken()}`
    });
  }

  getOwnerStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/owner`, {headers: this.getAuthHeaders()});
  }
}
