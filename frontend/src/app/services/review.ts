import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class Review {
  private apiUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient, private authService: Auth) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getActiveToken()}`
    });
  }

  getReviewsForCottage(cottageId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cottage/${cottageId}`);
  }

  addReview(data: {cottageId: string, reservationId: string, rating: number, comment: string}): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, {headers: this.getAuthHeaders()});
  }
}
