import api, { isNetworkError } from "./api";
import { builds as mockBuilds } from "../data/mockData";

let localBuilds = [...mockBuilds];

export async function startBuild({ projectId, pipelineVersion }) {
  try {
    const { data } = await api.post("/build/start", { projectId, pipelineVersion });
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      const build = {
        id: `#${4900 + localBuilds.length}`,
        projectId,
        project: `project-${projectId}`,
        version: pipelineVersion,
        pipelineVersion,
        status: "Running",
        duration: "0m 00s",
        triggeredBy: "you",
        date: new Date().toISOString().slice(0, 16).replace("T", " "),
        logs: [
          "[INFO] Cloning repository…",
          "[INFO] Installing dependencies…",
          "[INFO] Running unit tests…",
          "[INFO] Building Docker image…",
        ],
        progress: 35,
      };
      localBuilds = [build, ...localBuilds];
      return build;
    }
    throw error;
  }
}

export async function getBuildHistory() {
  try {
    const { data } = await api.get("/build/history");
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) return localBuilds;
    throw error;
  }
}

export async function getBuildStatus(id) {
  try {
    const { data } = await api.get(`/build/status/${id}`);
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      const build = localBuilds.find((b) => b.id === id || b.id === `#${id}`);
      if (!build) return { status: "Unknown" };
      if (build.status === "Running") {
        build.progress = Math.min(100, (build.progress || 35) + 20);
        if (build.progress >= 100) {
          build.status = "Success";
          build.duration = "4m 12s";
          build.logs.push("[SUCCESS] Build completed.");
        }
      }
      return build;
    }
    throw error;
  }
}
