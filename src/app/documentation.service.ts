import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentationEntry } from './models';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DocumentationService {
    private apiUrl = `${environment.apiUrl}/documentation`;

    constructor(private http: HttpClient) { }

    /**
     * Get all documentation entries from the backend
     * No localStorage - all data comes from Supabase
     */
    getAllDocs(): Observable<DocumentationEntry[]> {
        return this.http.get<DocumentationEntry[]>(this.apiUrl);
    }

    /**
     * Get documentation for a specific project from the backend
     */
    getDocsForProject(projectId: string): Observable<DocumentationEntry[]> {
        return this.http.get<DocumentationEntry[]>(this.apiUrl).pipe(
            // Filter on client side, or you could add a query param to the API
        );
    }

    /**
     * Get documentation for a specific project and developer
     */
    getDoc(projectId: string, developerId: string): Observable<DocumentationEntry> {
        return this.http.get<DocumentationEntry>(`${this.apiUrl}/${projectId}/${developerId}`);
    }

    /**
     * Save or update documentation entry
     * Data is persisted to Supabase cloud database
     */
    saveDoc(payload: any): Observable<DocumentationEntry> {
        return this.http.post<DocumentationEntry>(this.apiUrl, payload);
    }
}

