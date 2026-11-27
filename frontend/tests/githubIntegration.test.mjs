import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createGitHubService } from "../src/services/githubService.js";
import {
  initialRepoSelectionState,
  applyRepositoriesLoading,
  applyRepositoriesLoaded,
  applyRepositoriesError,
  applyBranchesLoading,
  applyBranchesLoaded,
  applyBranchesError,
  getRepositoryViewMode,
} from "../src/utils/repoSelectionState.js";
import { createServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendSrc = path.resolve(__dirname, "../src");

test("githubService loads public repositories, excludes private ones defensively, and preserves backend error codes/status", async () => {
  const calls = [];
  const mockClient = {
    async get(url, config) {
      calls.push({ url, config });
      return {
        data: {
          repositories: [
            {
              id: 101,
              name: "pipeline-demo",
              fullName: "octodev/pipeline-demo",
              ownerLogin: "octodev",
              visibility: "public",
              defaultBranch: "main",
              htmlUrl: "https://github.com/octodev/pipeline-demo",
            },
            {
              id: 102,
              name: "hidden-private",
              fullName: "octodev/hidden-private",
              ownerLogin: "octodev",
              private: true,
              visibility: "private",
            },
          ],
          page: 2,
          perPage: 15,
          hasNextPage: true,
          hasPrevPage: true,
          nextPage: 3,
          prevPage: 1,
        },
      };
    },
  };

  const service = createGitHubService(mockClient);
  const res = await service.getRepositories({ page: 2, perPage: 15 });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/github/repos");
  assert.deepEqual(calls[0].config.params, { page: 2, perPage: 15 });
  assert.equal(res.repositories.length, 1);
  assert.equal(res.repositories[0].fullName, "octodev/pipeline-demo");
  assert.equal(res.hasNextPage, true);
  assert.equal(res.nextPage, 3);
  assert.equal(res.hasPrevPage, true);

  for (const [status, code, expectReconnect] of [
    [401, "GITHUB_REAUTH_REQUIRED", true],
    [403, "GITHUB_SCOPE_INSUFFICIENT", true],
    [404, "GITHUB_NOT_FOUND", false],
    [429, "GITHUB_RATE_LIMIT", false],
    [502, "GITHUB_UNAVAILABLE", false],
    [504, "GITHUB_TIMEOUT", false],
  ]) {
    const failingService = createGitHubService({
      async get() {
        const err = new Error("Request failed");
        err.response = {
          status,
          data: { code, message: "Backend error " + code },
        };
        throw err;
      },
    });
    await assert.rejects(() => failingService.getRepositories(), (err) => {
      assert.equal(err.status, status);
      assert.equal(err.code, code);
      assert.equal(err.requiresReconnect, expectReconnect);
      return true;
    });
  }

  // Unreachable backend (no HTTP response) maps cleanly to BACKEND_UNAVAILABLE
  const offlineService = createGitHubService({
    async get() {
      const err = new Error("Network Error");
      err.code = "ERR_NETWORK";
      throw err;
    },
  });
  await assert.rejects(() => offlineService.getRepositories(), (err) => {
    assert.equal(err.code, "BACKEND_UNAVAILABLE");
    assert.equal(err.status, undefined);
    assert.equal(err.requiresReconnect, false);
    return true;
  });
});

test("githubService loads multi-page branches with safe URL encoding and rejects empty owner/repo", async () => {
  const calls = [];
  const service = createGitHubService({
    async get(url, config) {
      calls.push({ url, config });
      const page = config.params.page;
      if (page === 1) {
        return {
          data: {
            branches: [{ name: "main", protected: true, default: true }],
            page: 1,
            perPage: 100,
            hasNextPage: true,
            nextPage: 2,
          },
        };
      }
      return {
        data: {
          branches: [{ name: "feature/test", protected: false, default: false }],
          page: 2,
          perPage: 100,
          hasNextPage: false,
          hasPrevPage: true,
        },
      };
    },
  });

  await assert.rejects(() => service.getBranches("", "repo"), /Select a repository/);
  const result = await service.getAllBranches("octo.dev", "my-repo", { perPage: 100 });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "/github/repos/octo.dev/my-repo/branches");
  assert.equal(result.branches.length, 2);
  assert.equal(result.branches[0].name, "main");
  assert.equal(result.branches[1].name, "feature/test");
});

test("repoSelectionState covers loading, empty, error, reauth, and branch reset on repository change", () => {
  let state = { ...initialRepoSelectionState };

  assert.equal(getRepositoryViewMode(state, false), "disconnected");

  state = applyRepositoriesLoading(state);
  assert.equal(getRepositoryViewMode(state, true), "loading");

  state = applyRepositoriesLoaded(state, { repositories: [], page: 1 });
  assert.equal(getRepositoryViewMode(state, true), "empty");

  state = applyRepositoriesError(state, { code: "GITHUB_RATE_LIMIT", message: "Rate limit" });
  assert.equal(getRepositoryViewMode(state, true), "error");
  assert.equal(state.repos.length, 0);

  state = applyRepositoriesError(state, {
    code: "GITHUB_SCOPE_INSUFFICIENT",
    message: "Permission required",
    requiresReconnect: true,
  });
  assert.equal(getRepositoryViewMode(state, true), "disconnected");

  state = applyRepositoriesLoaded(state, {
    repositories: [{ id: 1, name: "demo", fullName: "octo/demo", defaultBranch: "main" }],
    page: 1,
    hasNextPage: false,
  });
  assert.equal(getRepositoryViewMode(state, true), "ready");

  state = applyBranchesLoaded(
    state,
    { branches: [{ name: "develop" }, { name: "main", protected: true }] },
    "main",
  );
  assert.equal(state.selectedBranch, "main");

  // Switching repository resets branches and selectedBranch before loading the next repo
  state = applyBranchesLoading(state);
  assert.equal(state.branchesLoading, true);
  assert.equal(state.branches.length, 0);
  assert.equal(state.selectedBranch, "");

  state = applyBranchesError(state, {
    code: "GITHUB_REAUTH_REQUIRED",
    message: "Reconnect required",
    requiresReconnect: true,
  });
  assert.equal(getRepositoryViewMode(state, true), "disconnected");
});

test("frontend auth, github, and project services never store tokens in browser storage or expose token fields", () => {
  const filesToInspect = [
    "services/authService.js",
    "services/githubService.js",
    "services/projectService.js",
    "services/api.js",
    "context/AuthContext.jsx",
    "pages/CreateProject.jsx",
    "pages/ConnectGitHub.jsx",
    "pages/Settings.jsx",
    "pages/Projects.jsx",
  ];

  for (const rel of filesToInspect) {
    const content = fs.readFileSync(path.join(frontendSrc, rel), "utf8");
    assert.equal(/\blocalStorage\b/.test(content), false, `${rel} must not use localStorage`);
    assert.equal(/\bsessionStorage\b/.test(content), false, `${rel} must not use sessionStorage`);
    assert.equal(/access_token|accessToken|clientSecret|GITHUB_CLIENT_SECRET/.test(content), false, `${rel} must not reference OAuth secrets/tokens`);
  }
});

test("projectService calls /v1/projects and never substitutes mock projects on 401, 403, 404, or 500", async () => {
  const vite = await createServer({
    root: path.resolve(__dirname, ".."),
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const apiMod = await vite.ssrLoadModule("/src/services/api.js");
    const projMod = await vite.ssrLoadModule("/src/services/projectService.js");
    const origGet = apiMod.api.get;
    const origPost = apiMod.api.post;
    try {
      const requestedUrls = [];
      apiMod.api.get = async (url) => {
        requestedUrls.push(url);
        return { data: { projects: [{ id: 1, name: "demo" }] } };
      };
      const rows = await projMod.getProjects();
      assert.deepEqual(requestedUrls, ["/v1/projects"]);
      assert.equal(rows.length, 1);

      for (const status of [401, 403, 404, 500]) {
        apiMod.api.get = async () => {
          const err = new Error("HTTP " + status);
          err.response = { status, data: { code: "ERR", message: "Backend error" } };
          throw err;
        };
        await assert.rejects(() => projMod.getProjects(), (e) => e.response?.status === status);

        apiMod.api.post = async () => {
          const err = new Error("HTTP " + status);
          err.response = { status, data: { code: "ERR", message: "Backend error" } };
          throw err;
        };
        await assert.rejects(() => projMod.createProject({ name: "x" }), (e) => e.response?.status === status);
      }
    } finally {
      apiMod.api.get = origGet;
      apiMod.api.post = origPost;
    }
  } finally {
    await vite.close();
  }
});
