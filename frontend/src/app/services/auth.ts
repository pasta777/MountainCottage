import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'https://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, formData);
  }
}
