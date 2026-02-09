import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Developer } from './models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevelopersService {
  private apiUrl = `${environment.apiUrl}/developers`;

  // Singleton state: Holds data in class memory (survives navigation)
  private devSubject = new BehaviorSubject<Developer[]>([]);
  developers$ = this.devSubject.asObservable();

  constructor(private http: HttpClient) { }

  getDevelopers(): Observable<Developer[]> {
    return this.http.get<Developer[]>(this.apiUrl).pipe(
      tap(serverData => {
        if (serverData) {
          const sorted = serverData.sort((a, b) => a.name.localeCompare(b.name));
          this.devSubject.next(sorted);
        }
      })
    );
  }

  createDeveloper(name: string): Observable<Developer> {
    return this.http.post<Developer>(this.apiUrl, { name }).pipe(
      tap(newDev => {
        const current = this.devSubject.value;
        if (!current.some(c => c.id === newDev.id)) {
          const updated = [...current, newDev].sort((a, b) => a.name.localeCompare(b.name));
          this.devSubject.next(updated);
        }
      })
    );
  }
}

