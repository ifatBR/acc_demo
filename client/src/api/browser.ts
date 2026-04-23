import { API_BASE } from "@/constants/routes";

export interface Hub {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface TopFolder {
  id: string;
  name: string;
  ct: string;
  mt: string;
  objectCount: number;
}

export interface FolderItem {
  type: "folders" | "items";
  id: string;
  name: string;
  ct: string;
  mt: string;
  createdBy?: string;
  modifiedBy?: string;
  hidden?: boolean;
}

export interface ItemVersions {
  type: "versions";
  id: string;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok)
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export const fetchHubs = () => get<Hub[]>("/hubs");

export const fetchProjects = (hubId: string) =>
  get<Project[]>(`/hubs/${hubId}/projects`);

export const fetchTopFolders = (hubId: string, projectId: string) =>
  get<TopFolder[]>(`/hubs/${hubId}/projects/${projectId}/topFolders`);

export const fetchFolderContents = (projectId: string, folderId: string) =>
  get<FolderItem[]>(`/projects/${projectId}/folders/${folderId}/contents`);

export const getItemVersions = (projectId: string, itemId: string) =>
  get<ItemVersions[]>(`/projects/${projectId}/items/${itemId}/versions`);
