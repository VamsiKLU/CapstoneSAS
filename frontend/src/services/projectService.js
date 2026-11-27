import api, { shouldUseDemoFallback } from "./api";

/**
 * Project persistence API service.
 * Uses /api/v1/projects on the backend.
 * Never falls back on 401, 403, 404, 500 or other HTTP errors from a reachable backend.
 */

export async function getProjects() {
  try {
    const { data } = await api.get("/v1/projects");
    return Array.isArray(data?.projects) ? data.projects : [];
  } catch (error) {
    if (shouldUseDemoFallback(error)) return [];
    throw error;
  }
}

export async function createProject(project) {
  const { data } = await api.post("/v1/projects", project);
  return data?.project ?? data;
}

export async function updateProject(id, project) {
  const { data } = await api.put(`/v1/projects/${id}`, project);
  return data?.project ?? data;
}

export async function deleteProject(id) {
  await api.delete(`/v1/projects/${id}`);
  return true;
}
