import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Cottage {
  private apiUrl = 'http://localhost:3000/api/cottages';

  constructor(private http: HttpClient) {}

  getCottages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMyCottages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-cottages`);
  }

  getCottageById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCottage(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  updateCottage(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  deleteCottage(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  deletePicture(id: string, picturePath: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/pictures`, {body: {picturePath}});
  }
}
