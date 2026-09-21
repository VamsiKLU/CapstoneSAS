import api, { isNetworkError } from "./api";
import { dockerImages, pods, rollbacks } from "../data/mockData";

let localDeployments = dockerImages.map((img, i) => ({
  id: i + 1,
  project: img.name.split("/")[1],
  imageTag: img.tag,
  status: img.status === "Healthy" ? "Success" : "Degraded",
  cpu: pods[i]?.cpu || 45,
  memory: pods[i]?.mem || 60,
  namespace: pods[i]?.ns || "prod",
  deployedAt: img.pushed,
}));

export async function deploy({ projectId, imageTag }) {
  try {
    const { data } = await api.post("/deploy", { projectId, imageTag });
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      const deployment = {
        id: Date.now(),
        projectId,
        imageTag: imageTag || "latest",
        status: "Running",
        cpu: 42,
        memory: 58,
        namespace: "prod",
        deployedAt: "just now",
        logs: ["[INFO] Pulling Docker image…", "[INFO] Applying Kubernetes manifest…"],
      };
      localDeployments = [deployment, ...localDeployments];
      setTimeout(() => {
        deployment.status = "Success";
        deployment.logs.push("[SUCCESS] Deployment complete.");
      }, 2000);
      return deployment;
    }
    throw error;
  }
}

export async function getDeployments() {
  try {
    const { data } = await api.get("/deployments");
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) return localDeployments;
    throw error;
  }
}

export async function getDeployment(id) {
  try {
    const { data } = await api.get(`/deployments/${id}`);
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      return localDeployments.find((d) => d.id === Number(id));
    }
    throw error;
  }
}

export async function rollbackDeployment(project, toTag) {
  return {
    id: `RB-${Date.now()}`,
    service: project,
    to: toTag,
    status: "Rollback initiated",
    history: rollbacks,
  };
}
