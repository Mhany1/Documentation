export interface Developer {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentationEntry {
  id: string;
  projectId: string;
  projectName?: string;
  developerId: string;
  developerName?: string;
  description: string;
  purpose: string;
  location: string;
  dependencies: string;
  thoughts: string;
  challenges: string;
  assumptions: string;
  approach: string;
  alternatives: string;
  solution: string;
  summary: string;
  architecture: string;
  createdAt?: string;
  updatedAt?: string;
}

