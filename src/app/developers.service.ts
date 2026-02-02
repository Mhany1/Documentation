import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Developer } from './models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevelopersService {
  private apiUrl = `${environment.apiUrl}/developers`;

  constructor(private http: HttpClient) { }

  getDevelopers(): Observable<Developer[]> {
    return this.http.get<Developer[]>(this.apiUrl);
  }

  createDeveloper(name: string): Observable<Developer> {
    return this.http.post<Developer>(this.apiUrl, { name });
  }
}

