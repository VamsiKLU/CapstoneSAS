import axios from "axios";
import { extractErrorMessage, ERROR_MESSAGES } from "./authService.js";

/**
 * Dedicated axios instance for GitHub repository and branch browsing.
 * Uses /api/v1/github/* routes. Credentials and CSRF headers included.
 */
const githubApi = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { "Content-Type": "application/json" },
});

const REAUTH_ERROR_CODES = new Set([
  "GITHUB_NOT_CONNECTED",
  "GITHUB_REAUTH_REQUIRED",
  "GITHUB_SCOPE_INSUFFICIENT",
]);

function fallbackCodeForStatus(status) {
  if (status === 401) return "AUTH_REQUIRED";
  if (status === 403) return "GITHUB_FORBIDDEN";
  if (status === 404) return "GITHUB_NOT_FOUND";
  if (status === 429) return "GITHUB_RATE_LIMIT";
  if (status === 504) return "GITHUB_TIMEOUT";
  if (status >= 500) return "GITHUB_UNAVAILABLE";
  return "GITHUB_UNAVAILABLE";
}

function isPublicRepository(repo) {
  if (!repo || repo.private === true) return false;
  if (repo.visibility && String(repo.visibility).toLowerCase() !== "public") return false;
  return true;
}

export function createGitHubService(client = githubApi) {
  function normalizeGitHubError(err) {
    if (!err?.response) {
      const error = new Error(ERROR_MESSAGES.BACKEND_UNAVAILABLE);
      error.code = "BACKEND_UNAVAILABLE";
      error.status = undefined;
      error.requiresReconnect = false;
      return error;
    }

    const status = err.response.status;
    const code = err.response.data?.code || fallbackCodeForStatus(status);
    const message = extractErrorMessage(err);
    const error = new Error(message);
    error.code = code;
    error.status = status;
    error.requiresReconnect = REAUTH_ERROR_CODES.has(code);
    return error;
  }

  async function getRepositories({ page = 1, perPage = 30 } = {}) {
    try {
      const { data } = await client.get("/github/repos", {
        params: { page, perPage },
      });
      const repositories = Array.isArray(data?.repositories)
        ? data.repositories.filter(isPublicRepository)
        : [];
      return {
        repositories,
        page: data?.page ?? page,
        perPage: data?.perPage ?? perPage,
        hasNextPage: Boolean(data?.hasNextPage),
        hasPrevPage: Boolean(data?.hasPrevPage),
        nextPage: data?.nextPage ?? null,
        prevPage: data?.prevPage ?? null,
      };
    } catch (err) {
      throw normalizeGitHubError(err);
    }
  }

  async function getBranches(owner, repo, { page = 1, perPage = 30 } = {}) {
    if (!owner || !repo) {
      const err = new Error("Select a repository to load branches.");
      err.code = "VALIDATION_ERROR";
      throw err;
    }
    try {
      const encodedOwner = encodeURIComponent(owner);
      const encodedRepo = encodeURIComponent(repo);
      const { data } = await client.get(
        `/github/repos/${encodedOwner}/${encodedRepo}/branches`,
        { params: { page, perPage } },
      );
      return {
        branches: Array.isArray(data?.branches) ? data.branches : [],
        page: data?.page ?? page,
        perPage: data?.perPage ?? perPage,
        hasNextPage: Boolean(data?.hasNextPage),
        hasPrevPage: Boolean(data?.hasPrevPage),
        nextPage: data?.nextPage ?? null,
        prevPage: data?.prevPage ?? null,
      };
    } catch (err) {
      throw normalizeGitHubError(err);
    }
  }

  async function getAllBranches(owner, repo, { perPage = 100, maxPages = 10 } = {}) {
    const firstPage = await getBranches(owner, repo, { page: 1, perPage });
    const allBranches = [...firstPage.branches];
    let current = firstPage;
    let pagesFetched = 1;

    while (current.hasNextPage && pagesFetched < maxPages) {
      const targetPage = current.nextPage || current.page + 1;
      current = await getBranches(owner, repo, { page: targetPage, perPage });
      allBranches.push(...current.branches);
      pagesFetched += 1;
    }

    return {
      branches: allBranches,
      page: 1,
      perPage,
      hasNextPage: current.hasNextPage,
      hasPrevPage: false,
      nextPage: current.nextPage,
      prevPage: null,
    };
  }

  return {
    getRepositories,
    getBranches,
    getAllBranches,
  };
}

const defaultGitHubService = createGitHubService();

export const getRepositories = defaultGitHubService.getRepositories;
export const getBranches = defaultGitHubService.getBranches;
export const getAllBranches = defaultGitHubService.getAllBranches;
