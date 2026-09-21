/* Dummy JSON data used until the Spring Boot backend is wired up. */

export const stats = [
  { id: "projects", label: "Total Projects", value: 42, delta: "+4 this month", tone: "primary", icon: "folder" },
  { id: "pipelines", label: "Active Pipelines", value: 18, delta: "+2 this week", tone: "info", icon: "pipeline" },
  { id: "running", label: "Running Builds", value: 5, delta: "3 queued", tone: "warning", icon: "play" },
  { id: "deploys", label: "Successful Deployments", value: 231, delta: "98.2% success", tone: "success", icon: "rocket" },
  { id: "failed", label: "Failed Builds", value: 7, delta: "-3 vs last week", tone: "error", icon: "error" },
  { id: "security", label: "Security Alerts", value: 3, delta: "1 critical", tone: "error", icon: "shield" },
];

export const buildTrend = [
  { day: "Mon", success: 42, failed: 5 },
  { day: "Tue", success: 51, failed: 3 },
  { day: "Wed", success: 38, failed: 8 },
  { day: "Thu", success: 62, failed: 4 },
  { day: "Fri", success: 74, failed: 6 },
  { day: "Sat", success: 21, failed: 1 },
  { day: "Sun", success: 17, failed: 2 },
];

export const deployTrend = [
  { week: "W1", staging: 24, production: 8 },
  { week: "W2", staging: 31, production: 12 },
  { week: "W3", staging: 28, production: 9 },
  { week: "W4", staging: 44, production: 16 },
  { week: "W5", staging: 39, production: 14 },
  { week: "W6", staging: 52, production: 21 },
];

export const notifications = [
  { id: 1, type: "error", title: "Build #4821 failed", body: "payments-service · unit tests", time: "4m ago" },
  { id: 2, type: "warning", title: "Critical CVE detected", body: "log4j-core 2.14.1 in auth-service", time: "22m ago" },
  { id: 3, type: "success", title: "Deployment complete", body: "checkout-web → production v2.4.1", time: "1h ago" },
  { id: 4, type: "info", title: "Pipeline v3 published", body: "java-microservice-standard", time: "3h ago" },
];

export const projects = [
  { id: 1, name: "payments-service", repo: "github.com/acme/payments-service", version: "v3", status: "Passing", lastBuild: "2026-08-06 04:12" },
  { id: 2, name: "checkout-web", repo: "github.com/acme/checkout-web", version: "v2", status: "Failed", lastBuild: "2026-08-06 03:48" },
  { id: 3, name: "auth-service", repo: "github.com/acme/auth-service", version: "v3", status: "Passing", lastBuild: "2026-08-05 23:10" },
  { id: 4, name: "inventory-api", repo: "gitlab.com/acme/inventory-api", version: "v1", status: "Running", lastBuild: "2026-08-06 04:55" },
  { id: 5, name: "notification-worker", repo: "github.com/acme/notification-worker", version: "v2", status: "Passing", lastBuild: "2026-08-05 18:02" },
  { id: 6, name: "analytics-etl", repo: "gitlab.com/acme/analytics-etl", version: "v1", status: "Queued", lastBuild: "2026-08-05 12:44" },
];

export const stepLibrary = [
  { id: "install", label: "Install Dependencies", icon: "download" },
  { id: "compile", label: "Compile", icon: "build" },
  { id: "test", label: "Test", icon: "science" },
  { id: "scan", label: "Security Scan", icon: "shield" },
  { id: "docker", label: "Docker Build", icon: "docker" },
  { id: "push", label: "Docker Push", icon: "cloud" },
  { id: "k8s", label: "Kubernetes Deploy", icon: "cloud" },
];

export const pipelines = [
  { id: 1, name: "java-microservice-standard", version: "v3", steps: ["install", "compile", "test", "scan", "docker", "push", "k8s"], projects: 14, status: "Active" },
  { id: 2, name: "node-frontend-standard", version: "v2", steps: ["install", "compile", "test", "docker", "push"], projects: 9, status: "Active" },
  { id: 3, name: "batch-etl-nightly", version: "v1", steps: ["install", "compile", "test"], projects: 4, status: "Deprecated" },
];

export const pipelineVersions = [
  { id: 1, name: "java-microservice-standard", version: "v3", created: "2026-07-28", projects: ["payments-service", "auth-service"], status: "Active" },
  { id: 2, name: "java-microservice-standard", version: "v2", created: "2026-05-14", projects: ["notification-worker"], status: "Supported" },
  { id: 3, name: "node-frontend-standard", version: "v2", created: "2026-06-02", projects: ["checkout-web"], status: "Active" },
  { id: 4, name: "batch-etl-nightly", version: "v1", created: "2026-02-19", projects: ["analytics-etl", "inventory-api"], status: "Deprecated" },
];

export const dependencies = [
  { version: "Pipeline v1", consumers: ["analytics-etl", "inventory-api"], risk: "low" },
  { version: "Pipeline v2", consumers: ["checkout-web", "notification-worker"], risk: "medium" },
  { version: "Pipeline v3", consumers: ["payments-service", "auth-service"], risk: "high" },
];

export const builds = Array.from({ length: 34 }).map((_, i) => {
  const statuses = ["Success", "Failed", "Running", "Cancelled"];
  const names = projects.map((p) => p.name);
  const users = ["a.sharma", "j.okafor", "m.rossi", "ci-bot", "l.chen"];
  return {
    id: `#48${(90 - i).toString().padStart(2, "0")}`,
    project: names[i % names.length],
    version: `v${(i % 3) + 1}`,
    status: statuses[i % 4],
    duration: `${2 + (i % 9)}m ${(i * 7) % 60}s`,
    triggeredBy: users[i % users.length],
    date: `2026-08-${String(6 - (i % 6)).padStart(2, "0")} ${String(10 + (i % 12)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
  };
});

export const dockerImages = [
  { name: "acme/payments-service", tag: "2.9.1", size: "184 MB", pushed: "12m ago", status: "Healthy" },
  { name: "acme/checkout-web", tag: "2.4.1", size: "96 MB", pushed: "1h ago", status: "Healthy" },
  { name: "acme/auth-service", tag: "1.8.7", size: "142 MB", pushed: "4h ago", status: "Degraded" },
];

export const pods = [
  { name: "payments-7d9f-4kx2", ns: "prod", cpu: 62, mem: 71, status: "Running" },
  { name: "checkout-5b1a-9tt0", ns: "prod", cpu: 38, mem: 54, status: "Running" },
  { name: "auth-6c2d-11ab", ns: "staging", cpu: 88, mem: 92, status: "Pressure" },
  { name: "etl-2f7c-77kk", ns: "batch", cpu: 12, mem: 30, status: "Pending" },
];

export const resourceTrend = Array.from({ length: 12 }).map((_, i) => ({
  t: `${i * 5}m`,
  cpu: 30 + Math.round(35 * Math.abs(Math.sin(i / 2))),
  memory: 40 + Math.round(30 * Math.abs(Math.cos(i / 3))),
}));

export const rollbacks = [
  { id: "RB-118", service: "checkout-web", from: "v2.4.1", to: "v2.3.9", by: "m.rossi", date: "2026-08-04 19:22" },
  { id: "RB-117", service: "auth-service", from: "v1.8.7", to: "v1.8.4", by: "a.sharma", date: "2026-07-30 08:05" },
];

export const securityFindings = [
  { id: "CVE-2026-3311", severity: "Critical", pkg: "log4j-core 2.14.1", project: "auth-service", status: "Open" },
  { id: "CVE-2026-1180", severity: "High", pkg: "express 4.17.1", project: "checkout-web", status: "Open" },
  { id: "CVE-2025-9902", severity: "Medium", pkg: "urllib3 1.26.5", project: "analytics-etl", status: "Mitigated" },
];
