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
  // localStorage: Holds data in browser (survives refresh)
  private devSubject = new BehaviorSubject<Developer[]>(
    JSON.parse(localStorage.getItem('docs_cache_devs') || '[]')
  );
  developers$ = this.devSubject.asObservable();

  constructor(private http: HttpClient) { }

  getDevelopers(): Observable<Developer[]> {
    return this.http.get<Developer[]>(this.apiUrl).pipe(
      tap(serverData => {
        if (serverData && serverData.length > 0) {
          const current = this.devSubject.value;
          // Merge: Add items from server that we don't have locally yet
          const combined = [...current];
          serverData.forEach(item => {
            if (!combined.some(c => c.id === item.id)) {
              combined.push(item);
            }
          });
          const sorted = combined.sort((a, b) => a.name.localeCompare(b.name));
          this.devSubject.next(sorted);
          localStorage.setItem('docs_cache_devs', JSON.stringify(sorted));
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
          localStorage.setItem('docs_cache_devs', JSON.stringify(updated));
        }
      })
    );
  }
}

