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

  // Singleton state: Holds data in class memory (survives navigation)
  private projSubject = new BehaviorSubject<Project[]>([]);
  projects$ = this.projSubject.asObservable();

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl).pipe(
      tap(serverData => {
        if (serverData) {
          const sorted = serverData.sort((a, b) => a.name.localeCompare(b.name));
          this.projSubject.next(sorted);
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
        }
      })
    );
  }
}

