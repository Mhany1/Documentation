import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Developer, Project } from '../models';
import { DevelopersService } from '../developers.service';
import { ProjectsService } from '../projects.service';
import { SelectionService } from '../selection.service';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css']
})
export class StartPageComponent implements OnInit {
  form: FormGroup;
  developers: Developer[] = [];
  projects: Project[] = [];

  loadingDevelopers = false;
  loadingProjects = false;
  errorMessage: string | null = null;

  newDeveloperName = '';
  newProjectName = '';

  constructor(
    private fb: FormBuilder,
    private developersService: DevelopersService,
    private projectsService: ProjectsService,
    private selectionService: SelectionService,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      developerId: [null, Validators.required],
      projectId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // 1. Subscribe to the shared state (will instantly receive localStorage cached data)
    this.developersService.developers$.subscribe(devs => {
      this.developers = devs;
    });

    this.projectsService.projects$.subscribe(projs => {
      this.projects = projs;
    });

    // 2. Trigger background refresh from backend
    this.loadDevelopers();
    this.loadProjects();
  }

  private loadDevelopers(): void {
    this.loadingDevelopers = true;
    this.developersService.getDevelopers().subscribe(
      () => {
        // Data is handled by the subscription in ngOnInit via BehaviorSubject
        this.loadingDevelopers = false;
      },
      () => {
        this.errorMessage = 'Failed to load developers.';
        this.loadingDevelopers = false;
      }
    );
  }

  private loadProjects(): void {
    this.loadingProjects = true;
    this.projectsService.getProjects().subscribe(
      () => {
        // Data is handled by the subscription in ngOnInit via BehaviorSubject
        this.loadingProjects = false;
      },
      () => {
        this.errorMessage = 'Failed to load projects.';
        this.loadingProjects = false;
      }
    );
  }

  addDeveloper(): void {
    const name = (this.newDeveloperName || '').trim();
    if (!name) {
      return;
    }

    this.developersService.createDeveloper(name).subscribe(
      developer => {
        // Dropdown will update automatically via service subscription
        this.form.patchValue({ developerId: developer.id });
        this.newDeveloperName = '';
      },
      () => {
        this.errorMessage = 'Failed to create developer.';
      }
    );
  }

  addProject(): void {
    const name = (this.newProjectName || '').trim();
    if (!name) {
      return;
    }

    this.projectsService.createProject(name).subscribe(
      project => {
        // Dropdown will update automatically via service subscription
        this.form.patchValue({ projectId: project.id });
        this.newProjectName = '';
      },
      () => {
        this.errorMessage = 'Failed to create project.';
      }
    );
  }

  downloadAllProjectsReport(): void {
    const url = `${environment.apiUrl}/download-all-projects`;

    this.http.post(url, { responseType: 'blob' }).subscribe(
      (blob: Blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'Full_System_Documentation.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      },
      error => {
        console.error('Global PDF Error:', error);
        alert('Failed to generate community report.');
      }
    );
  }

  continue(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });
      return;
    }

    const developerId = this.form.value.developerId;
    const projectId = this.form.value.projectId;

    const developer = this.developers.find(d => d.id === developerId) || null;
    const project = this.projects.find(p => p.id === projectId) || null;

    if (!developer || !project) {
      return;
    }

    this.selectionService.setSelection(developer, project);
    this.router.navigate(['/next']);
  }
}

