export const initialRepoSelectionState = {
  reposLoading: false,
  repos: [],
  repoError: null,
  repoPage: {
    page: 1,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  },
  branchesLoading: false,
  branches: [],
  branchError: null,
  selectedRepoFullName: "",
  selectedBranch: "",
};

export function applyRepositoriesLoading(state) {
  return {
    ...state,
    reposLoading: true,
    repoError: null,
  };
}

export function applyRepositoriesLoaded(state, result) {
  return {
    ...state,
    reposLoading: false,
    repoError: null,
    repos: Array.isArray(result?.repositories) ? result.repositories : [],
    repoPage: {
      page: result?.page ?? 1,
      hasNextPage: Boolean(result?.hasNextPage),
      hasPrevPage: Boolean(result?.hasPrevPage),
      nextPage: result?.nextPage ?? null,
      prevPage: result?.prevPage ?? null,
    },
  };
}

export function applyRepositoriesError(state, err) {
  return {
    ...state,
    reposLoading: false,
    repos: [],
    repoError: {
      code: err?.code || "GITHUB_UNAVAILABLE",
      message: err?.message || "Unable to load GitHub repositories.",
      requiresReconnect: Boolean(err?.requiresReconnect),
    },
  };
}

export function applyBranchesLoading(state) {
  return {
    ...state,
    branchesLoading: true,
    branchError: null,
    branches: [],
    selectedBranch: "",
  };
}

export function applyBranchesLoaded(state, result, defaultBranch) {
  const branches = Array.isArray(result?.branches) ? result.branches : [];
  const preferred =
    branches.find((b) => b.name === defaultBranch || b.default)?.name ||
    branches[0]?.name ||
    "";
  return {
    ...state,
    branchesLoading: false,
    branchError: null,
    branches,
    selectedBranch: preferred,
  };
}

export function applyBranchesError(state, err) {
  return {
    ...state,
    branchesLoading: false,
    branches: [],
    selectedBranch: "",
    branchError: {
      code: err?.code || "GITHUB_UNAVAILABLE",
      message: err?.message || "Unable to load repository branches.",
      requiresReconnect: Boolean(err?.requiresReconnect),
    },
  };
}

export function getRepositoryViewMode(state, isGithubConnected) {
  if (
    !isGithubConnected ||
    state.repoError?.requiresReconnect ||
    state.branchError?.requiresReconnect
  ) {
    return "disconnected";
  }
  if (state.reposLoading) return "loading";
  if (state.repoError) return "error";
  if (!state.repos || state.repos.length === 0) return "empty";
  return "ready";
}
