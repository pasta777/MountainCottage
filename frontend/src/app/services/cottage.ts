import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Cottage {
  private apiUrl = 'http://localhost:3000/api/cottages';

  constructor(private http: HttpClient, private authService: Auth) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getActiveToken()}`
    });
  }

  getMyCottages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-cottages`, {headers: this.getAuthHeaders()});
  }

  getCottageById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCottage(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData, {headers: this.getAuthHeaders()});
  }

  updateCottage(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData, {headers: this.getAuthHeaders()});
  }

  deleteCottage(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {headers: this.getAuthHeaders()});
  }
}
