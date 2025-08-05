import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Review {
  private apiUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) {}

  getReviewsForCottage(cottageId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cottage/${cottageId}`);
  }

  addReview(data: {cottageId: string, reservationId: string, rating: number, comment: string}): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
