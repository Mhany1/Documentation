import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Developer, Project } from '../models';
import { DevelopersService } from '../developers.service';
import { ProjectsService } from '../projects.service';
import { SelectionService } from '../selection.service';

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
    private router: Router
  ) {
    this.form = this.fb.group({
      developerId: [null, Validators.required],
      projectId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDevelopers();
    this.loadProjects();
  }

  private loadDevelopers(): void {
    this.loadingDevelopers = true;
    this.developersService.getDevelopers().subscribe(
      developers => {
        this.developers = developers;
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
      projects => {
        this.projects = projects;
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
        const existingIndex = this.developers.findIndex(d => d.id === developer.id);
        if (existingIndex === -1) {
          this.developers = [...this.developers, developer].sort((a, b) => a.name.localeCompare(b.name));
        } else {
          this.developers[existingIndex] = developer;
        }
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
        const existingIndex = this.projects.findIndex(p => p.id === project.id);
        if (existingIndex === -1) {
          this.projects = [...this.projects, project].sort((a, b) => a.name.localeCompare(b.name));
        } else {
          this.projects[existingIndex] = project;
        }
        this.form.patchValue({ projectId: project.id });
        this.newProjectName = '';
      },
      () => {
        this.errorMessage = 'Failed to create project.';
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

