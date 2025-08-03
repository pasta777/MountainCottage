import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:3000';

  getTestMessage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/test`);
  }
}
