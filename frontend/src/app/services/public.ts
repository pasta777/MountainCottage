import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Public {
  private statsApiUrl = 'http://localhost:3000/api/stats';
  private cottagesApiUrl = 'http://localhost:3000/api/cottages';

  constructor(private http: HttpClient) {}

  getGeneralStats(): Observable<any> {
    return this.http.get<any>(`${this.statsApiUrl}/general`);
  }

  getCottages(params: any): Observable<any[]> {
    let httpParams = new HttpParams();
    if(params.name) httpParams = httpParams.append('name', params.name);
    if(params.location) httpParams = httpParams.append('location', params.location);
    if(params.sortBy) httpParams = httpParams.append('sortBy', params.sortBy);
    if(params.sortOrder) httpParams = httpParams.append('sortOrder', params.sortOrder);

    return this.http.get<any[]>(this.cottagesApiUrl, {params: httpParams});
  }
}
