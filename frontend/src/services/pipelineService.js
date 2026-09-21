import api, { isNetworkError } from "./api";
import { pipelines as mockPipelines, pipelineVersions as mockVersions } from "../data/mockData";

let localPipelines = [...mockPipelines];
let localVersions = [...mockVersions];

export async function getPipelines() {
  try {
    const { data } = await api.get("/pipelines");
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) return localPipelines;
    throw error;
  }
}

export async function getPipeline(id) {
  try {
    const { data } = await api.get(`/pipelines/${id}`);
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      return localPipelines.find((p) => p.id === Number(id));
    }
    throw error;
  }
}

export async function createPipeline(pipeline) {
  try {
    const { data } = await api.post("/pipelines", pipeline);
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      const created = { ...pipeline, id: Date.now(), projects: 0, status: "Active" };
      localPipelines = [created, ...localPipelines];
      return created;
    }
    throw error;
  }
}

export async function updatePipeline(id, pipeline) {
  try {
    const { data } = await api.put(`/pipelines/${id}`, pipeline);
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      localPipelines = localPipelines.map((p) => (p.id === id ? { ...p, ...pipeline } : p));
      return localPipelines.find((p) => p.id === id);
    }
    throw error;
  }
}

export async function getPipelineVersions() {
  try {
    const { data } = await api.get("/pipelines/versions");
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) return localVersions;
    throw error;
  }
}

export async function clonePipeline(id) {
  const source = localPipelines.find((p) => p.id === id);
  if (!source) return null;
  const clone = { ...source, id: Date.now(), name: `${source.name}-clone`, version: "v1" };
  localPipelines = [clone, ...localPipelines];
  return clone;
}

export async function rollbackPipelineVersion(name, version) {
  const rolled = localVersions.find((v) => v.name === name && v.version === version);
  return rolled || null;
}
