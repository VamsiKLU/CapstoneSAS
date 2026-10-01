# PipelineHub

PipelineHub is a developer-focused CI/CD governance and step composition platform designed to manage reusable pipeline steps, track dependencies, and enforce pipeline governance across microservices.

---

## Architecture Overview

```text
PipelineHub Frontend (React + Vite + MUI)
                  |
                  v  (HTTP / REST / Sessions on port 5173 -> 8080)
Java Spring Boot Backend (Spring Security + JPA / Hibernate)
                  |
        +---------+---------+
        |                   |
        v                   v
   MySQL 8.0           GitHub OAuth (API v3 / OAuth 2.0)
```

- **Frontend**: React 19, Vite, Material UI (MUI 9), React Router 7. Runs on port 5173. Proxies API requests to port 8080.
- **Backend**: Java 21, Spring Boot 3.3.4, Spring Security 6, Spring Data JPA, Hibernate. Runs on port 8080.
- **Database**: MySQL 8.0 with JPA/Hibernate automatic schema management.
- **Authentication**: Unified email and password authentication for developers and administrators with secure session cookies. GitHub OAuth 2.0 connection with server-side token exchange and email verification.

---

## Repository Structure

```text
PipelineHub/
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/           # UI components (AppShell, Navbar, Sidebar, etc.)
│   │   ├── context/              # Authentication context (AuthContext)
│   │   ├── data/                 # Mock CI/CD pipeline data
│   │   ├── hooks/                # Custom hooks (useGitHubGuard)
│   │   ├── pages/                # Application pages (Dashboard, ConnectGitHub, Settings, etc.)
│   │   ├── routes/               # Route definitions (AppRoutes, ProtectedRoute)
│   │   ├── services/             # API clients (authService, buildService)
│   │   ├── styles/               # Design system stylesheets
│   │   ├── theme.js              # Dark Material-UI theme
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── springboot-backend/           # Java Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/io/pipelinehub/
│   │   │   │   ├── config/       # SecurityConfig, JpaConfig
│   │   │   │   ├── controller/   # AuthController, AccountController, HealthController
│   │   │   │   ├── dto/          # UserDto, LoginRequest, RegisterRequest, ApiError
│   │   │   │   ├── entity/       # User entity
│   │   │   │   ├── exception/    # GlobalExceptionHandler
│   │   │   │   ├── repository/   # UserRepository
│   │   │   │   ├── security/     # SessionAuthenticationFilter, UserDetailsService
│   │   │   │   ├── service/      # UserService, GitHubService, UserMapper
│   │   │   │   └── PipelineHubApplication.java
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/                 # Test suites (OAuth verification, Auth integration)
│   ├── .env.example
│   ├── pom.xml
│   └── start.sh
├── .env.example                  # Root environment template
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Java 21 (JDK 21+)
- Apache Maven 3.9+
- Node.js 18+ and npm
- MySQL Server 8.0+

---

### 1. Database Setup

Create a MySQL database for the application:

```sql
CREATE DATABASE IF NOT EXISTS pipelinehub;
```

---

### 2. Backend Configuration and Startup

1. Navigate to the backend directory:
   ```bash
   cd springboot-backend
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Configure your local settings in `.env`:
   - `DB_HOST`: MySQL host (default: `localhost`)
   - `DB_PORT`: MySQL port (default: `3306`)
   - `DB_NAME`: Database name (default: `pipelinehub`)
   - `DB_USERNAME`: Database username (default: `root`)
   - `DB_PASSWORD`: Database password
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret
   - `GITHUB_CALLBACK_URL`: `http://localhost:8080/api/v1/auth/github/callback`
   - `ADMIN_EMAIL`: Admin email for platform administrator account (default: `admin@pipelinehub.io`)
   - `ADMIN_PASSWORD`: Admin password for platform administrator account

4. Start the backend server:
   ```bash
   ./start.sh
   ```
   Or run directly with Maven:
   ```bash
   mvn spring-boot:run
   ```

5. Verify the backend is running:
   ```bash
   curl http://localhost:8080/health
   ```
   Expected response:
   ```json
   {"status":"ok","timestamp":"..."}
   ```

---

### 3. Frontend Setup and Startup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

### 4. Running Backend Tests

To run the automated Spring Boot test suite:

```bash
cd springboot-backend
mvn test
```

The test suite covers:
- Spring application context initialization
- Exact GitHub OAuth redirect URI generation and callback mapping verification
- Developer registration with password hashing
- Unified login for both roles
- Safe user profile retrieval without sensitive credentials
- GitHub disconnection handling
- Permanent account deletion with session invalidation

---

## GitHub OAuth App Configuration

When configuring your GitHub OAuth App in GitHub Developer Settings (GitHub Settings > Developer settings > OAuth Apps):

- **Application name**: `PipelineHub` (or your chosen name)
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:8080/api/v1/auth/github/callback`

### Authentication Flow

1. Developer registers with email and password at `/register`. The registration role is automatically `DEVELOPER`.
2. Developer signs in at `/` using their email and password.
3. If GitHub is not connected, the user is directed to `/connect-github`.
4. Clicking "Connect with GitHub" initiates the OAuth flow via Spring Boot (`/api/v1/auth/github`).
5. GitHub redirects back to Spring Boot (`/api/v1/auth/github/callback`).
6. Spring Boot validates the OAuth state parameter, exchanges the code for an access token server-side, and retrieves the verified GitHub email.
7. Spring Boot compares the GitHub email with the registered account email. If they match, the connection is stored and the user is redirected to `/dashboard`.
8. If the emails do not match, the connection is rejected and the user is returned to `/connect-github` with an explanatory notification.
9. Administrators use the same sign-in page with their admin credentials; admin accounts do not require GitHub connection.