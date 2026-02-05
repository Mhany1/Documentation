import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectionService } from '../selection.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DocumentationService } from '../documentation.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-next-page',
  templateUrl: './next-page.component.html',
  styleUrls: ['./next-page.component.css']
})
export class NextPageComponent implements OnInit {
  form: FormGroup;
  private currentDocId: string | null = null;

  constructor(
    private selectionService: SelectionService,
    private fb: FormBuilder,
    private http: HttpClient,
    private documentationService: DocumentationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required],
      purpose: ['', Validators.required],
      location: ['', Validators.required],
      dependencies: ['', Validators.required],
      thoughts: ['', Validators.required],
      challenges: ['', Validators.required],
      assumptions: ['', Validators.required],
      approach: ['', Validators.required],
      alternatives: ['', Validators.required],
      solution: ['', Validators.required],
      summary: ['', Validators.required],
      architecture: ['', Validators.required]
    });
  }

  ngOnInit() {

  }

  get developer() {
    return this.selectionService.getDeveloper();
  }

  get project() {
    return this.selectionService.getProject();
  }

  saveSuccess = false;
  saveError = false;

  saveDocumentation(redirect = true): Observable<any> | null {
    this.saveSuccess = false;
    this.saveError = false;

    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });
      return null;
    }

    const payload = {
      ...this.form.value,
      id: this.currentDocId,
      developerId: this.developer ? this.developer.id : null,
      developerName: this.developer ? this.developer.name : null,
      projectId: this.project ? this.project.id : null,
      projectName: this.project ? this.project.name : null
    };

    // Use service to save both to backend and local cache
    const obs = this.documentationService.saveDoc(payload).pipe(
      tap(res => {
        this.currentDocId = res.id;
        this.saveSuccess = true;
        if (redirect) {
          setTimeout(() => {
            this.saveSuccess = false;
            this.selectionService.clear();
            this.router.navigate(['/']);
          }, 1500);
        }
      })
    );

    // Only subscribe here if it's a standalone save (redirect=true)
    // If redirect=false, the caller (like downloadPdf) will subscribe
    if (redirect) {
      obs.subscribe(
        () => { },
        err => {
          console.error(err);
          this.saveError = true;
          setTimeout(() => this.saveError = false, 3000);
        }
      );
    }

    return obs;
  }

  downloadPdf() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });
      return;
    }

    if (!this.project) {
      alert('No project selected');
      return;
    }

    // First save current work WITHOUT redirecting
    const saveObs = this.saveDocumentation(false);

    if (!saveObs) {
      // Form was invalid, saveDocumentation already marked fields as touched
      return;
    }

    saveObs.subscribe(
      () => {
        // Collect ALL docs for this project from our local persistent cache
        const allProjectDocs = this.documentationService.getDocsForProject(this.project!.id);

        // request the PDF via POST so we can provide the full context
        const url = `${environment.apiUrl}/download-pdf/${this.project!.id}`;

        this.http.post(url, allProjectDocs, { responseType: 'blob' }).subscribe(
          (blob: Blob) => {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${this.project!.name.replace(/\s+/g, '_')}_Documentation.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            // After download, show success and redirect (same logic as save)
            this.saveSuccess = true;
            setTimeout(() => {
              this.saveSuccess = false;
              this.selectionService.clear();
              this.router.navigate(['/']);
            }, 1500);
          },
          error => {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. The server might have encountered an error.');
          }
        );
      },
      err => {
        console.error('Save failed before download:', err);
        alert('Failed to save data. Cannot generate PDF without saving.');
      }
    );
  }
}
