# PipelineHub (Project ID: CLOUD-240)
## Continuous Integration Pipeline Step Reuse Without Hidden Coupling

PipelineHub is a developer-focused CI/CD governance and step composition platform designed to detect undeclared dependencies and prevent hidden coupling across reusable pipeline components.

---

## Repository Structure

```
CapstoneSAS/
├── frontend/                     # Dedicated frontend application
│   ├── src/
│   │   ├── components/           # Reusable developer platform components
│   │   │   ├── AppShell.jsx
│   │   │   ├── BuildHistoryTable.jsx
│   │   │   ├── DependencyIndicator.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── LogViewer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Notification.jsx
│   │   │   ├── PipelineCard.jsx
│   │   │   ├── PipelineStep.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Skeletons.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── StatusChip.jsx
│   │   │   └── VersionBadge.jsx
│   │   ├── context/              # Authentication context (Mock Login)
│   │   │   └── AuthContext.jsx
│   │   ├── data/                 # Mock projects, pipelines, versions, dependencies
│   │   │   └── mockData.js
│   │   ├── pages/                # Redesigned pages (GitHub dark aesthetic)
│   │   │   ├── BuildHistory.jsx
│   │   │   ├── CreateProject.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DependencyTracking.jsx
│   │   │   ├── Deployments.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── PipelineVersions.jsx
│   │   │   ├── Pipelines.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Settings.jsx
│   │   ├── routes/               # Application routing
│   │   │   └── AppRoutes.jsx
│   │   ├── services/             # API services with mock fallbacks
│   │   ├── styles/               # Design system stylesheets
│   │   ├── theme.js              # Dark palette Material-UI theme
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
└── AGENTS.md
```

---

## Quick Start

### 1. Navigate to the frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## Mock Authentication and Credentials

The application uses local mock authentication with session persistence via `localStorage`.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@pipelinehub.io` | `admin123` |
| Developer | `dev@pipelinehub.io` | `password123` |

*Note: Clicking "Continue with GitHub" automatically establishes a developer mock session.*

---

## Core Capstone Architecture and Capabilities

1. **Explicit Step Contracts (`/pipelines`)**: Compose modular pipeline steps (Install, Compile, Test, Scan, Docker Build, Push, Kubernetes Deploy) with declared inputs and outputs.
2. **Hidden Coupling Detection (`/dependencies`)**: Engineering analysis view identifying undeclared state mutations and implicit dependencies between pipeline steps.
3. **Independent Versioning (`/pipeline-versions`)**: Release stream governance allowing downstream repositories to pin semantic releases and upgrade autonomously.
4. **Repository Management (`/projects`)**: Dense repository catalog displaying git branches, tech stacks, and pinned pipeline releases.
5. **CI Execution Logs (`/build-history`)**: Terminal-style log viewer with execution timestamps and exit status.
6. **Kubernetes Cluster Operations (`/deployments`)**: Container deployments, pod resource metrics, and rollback history audit.