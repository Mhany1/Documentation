import { Injectable } from '@angular/core';
import { Developer, Project } from './models';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private selectedDeveloper: Developer | null = null;
  private selectedProject: Project | null = null;

  setSelection(developer: Developer, project: Project): void {
    this.selectedDeveloper = developer;
    this.selectedProject = project;
  }

  getDeveloper(): Developer | null {
    return this.selectedDeveloper;
  }

  getProject(): Project | null {
    return this.selectedProject;
  }

  clear(): void {
    this.selectedDeveloper = null;
    this.selectedProject = null;
  }
}

