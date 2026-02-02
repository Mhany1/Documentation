import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectionService } from '../selection.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-next-page',
  templateUrl: './next-page.component.html',
  styleUrls: ['./next-page.component.css']
})
export class NextPageComponent implements OnInit {
  form: FormGroup;

  constructor(
    private selectionService: SelectionService,
    private fb: FormBuilder,
    private http: HttpClient,
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

  saveDocumentation() {
    this.saveSuccess = false;
    this.saveError = false;

    if (this.form.invalid) {
      // Mark all as touched to show errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });
      return;
    }

    const payload = {
      ...this.form.value,
      developerId: this.developer ? this.developer.id : null,
      developerName: this.developer ? this.developer.name : null,
      projectId: this.project ? this.project.id : null
    };

    this.http.post(`${environment.apiUrl}/documentation`, payload).subscribe(
      res => {
        this.saveSuccess = true;
        this.form.reset();
        setTimeout(() => {
          this.saveSuccess = false;
          this.selectionService.clear();
          this.router.navigate(['/']);
        }, 1500);
      },
      err => {
        console.error(err);
        this.saveError = true;
        setTimeout(() => this.saveError = false, 3000);
      }
    );
  }

  downloadPdf() {
    // Validate form first
    if (this.form.invalid) {
      // Mark all as touched to show errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });
      // alert('Please fill out all required fields before downloading.');
      return;
    }

    if (!this.project) {
      alert('No project selected');
      return;
    }

    // First save current work
    this.saveDocumentation();

    // Then download PDF from backend using HttpClient
    setTimeout(() => {
      const url = `${environment.apiUrl}/download-pdf/${this.project.id}`;

      // Use HttpClient to get the PDF as a blob
      this.http.get(url, { responseType: 'blob' }).subscribe(
        (blob: Blob) => {
          // Create a blob URL
          const blobUrl = window.URL.createObjectURL(blob);

          // Create a temporary link and trigger download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${this.project.name}_Documentation.pdf`;
          document.body.appendChild(link);
          link.click();

          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        },
        error => {
          console.error('Error downloading PDF:', error);
          alert('Failed to download PDF. Please try again.');
        }
      );
    }, 500);
  }
}
