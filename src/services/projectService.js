import api, { isNetworkError } from "./api";
import { projects as mockProjects } from "../data/mockData";

let localProjects = [...mockProjects].map((p) => ({
  ...p,
  branch: p.branch || "main",
  stack: p.stack || "Node.js",
  repositoryUrl: p.repo,
}));

export async function getProjects() {
  try {
    const { data } = await api.get("/projects");
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) return localProjects;
    throw error;
  }
}

export async function createProject(project) {
  try {
    const { data } = await api.post("/projects", project);
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      const created = { ...project, id: Date.now(), status: "Queued", lastBuild: "—" };
      localProjects = [created, ...localProjects];
      return created;
    }
    throw error;
  }
}

export async function updateProject(id, project) {
  try {
    const { data } = await api.put(`/projects/${id}`, project);
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      localProjects = localProjects.map((p) => (p.id === id ? { ...p, ...project } : p));
      return localProjects.find((p) => p.id === id);
    }
    throw error;
  }
}

export async function deleteProject(id) {
  try {
    await api.delete(`/projects/${id}`);
    return true;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      localProjects = localProjects.filter((p) => p.id !== id);
      return true;
    }
    throw error;
  }
}
