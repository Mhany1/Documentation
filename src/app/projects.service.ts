import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Project } from './models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = `${environment.apiUrl}/projects`;

  // Persistence bridge between serverless instances
  private projSubject = new BehaviorSubject<Project[]>(
    JSON.parse(localStorage.getItem('docs_cache_projs') || '[]')
  );
  projects$ = this.projSubject.asObservable();

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl).pipe(
      tap(serverData => {
        if (serverData && serverData.length > 0) {
          const current = this.projSubject.value;
          // Merge unique items from server into local memory
          const combined = [...current];
          serverData.forEach(item => {
            if (!combined.some(c => c.id === item.id)) {
              combined.push(item);
            }
          });
          const sorted = combined.sort((a, b) => a.name.localeCompare(b.name));
          this.projSubject.next(sorted);
          localStorage.setItem('docs_cache_projs', JSON.stringify(sorted));
        }
      })
    );
  }

  createProject(name: string): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, { name }).pipe(
      tap(newProj => {
        const current = this.projSubject.value;
        if (!current.some(c => c.id === newProj.id)) {
          const updated = [...current, newProj].sort((a, b) => a.name.localeCompare(b.name));
          this.projSubject.next(updated);
          localStorage.setItem('docs_cache_projs', JSON.stringify(updated));
        }
      })
    );
  }
}

