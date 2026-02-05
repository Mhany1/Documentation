import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DocumentationEntry } from './models';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DocumentationService {
    private apiUrl = `${environment.apiUrl}/documentation`;
    private cacheKey = 'docs_cache_all';

    constructor(private http: HttpClient) { }

    getAllDocs(): DocumentationEntry[] {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            console.error('Error parsing local cache:', e);
            return [];
        }
    }

    getDocsForProject(projectId: string): DocumentationEntry[] {
        const all = this.getAllDocs();
        return all.filter(d => d.projectId === projectId);
    }

    saveDoc(payload: any): Observable<DocumentationEntry> {
        return this.http.post<DocumentationEntry>(this.apiUrl, payload).pipe(
            tap(savedDoc => {
                const all = this.getAllDocs();
                // Use a persistent client-side cache as requested in previous conversations
                // If it's a new doc, add it. If it's an update, replace it.
                const index = all.findIndex(d => d.id === savedDoc.id);
                if (index > -1) {
                    all[index] = savedDoc;
                } else {
                    all.push(savedDoc);
                }
                localStorage.setItem(this.cacheKey, JSON.stringify(all));
            })
        );
    }
}
