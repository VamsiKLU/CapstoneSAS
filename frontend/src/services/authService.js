import api, { isNetworkError } from "./api";

const DEMO_USERS = [
  { id: 1, name: "Aarav Sharma", email: "admin@pipelinehub.io", role: "Admin", department: "Platform Engineering" },
  { id: 2, name: "Jordan Lee", email: "dev@pipelinehub.io", role: "Developer", department: "Product Engineering" },
];

function demoSession(email, role = "Developer") {
  const user = DEMO_USERS.find((u) => u.email === email) || {
    id: 99,
    name: email.split("@")[0],
    email,
    role,
    department: "Engineering",
  };
  return { token: `demo-jwt-${user.id}`, user };
}

export async function login({ email, password }) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    return { token: data.token, user: data.user };
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      if (!email || !password) throw { message: "Email and password are required." };
      const role = email.includes("admin") ? "Admin" : "Developer";
      return demoSession(email, role);
    }
    throw error;
  }
}

export async function register({ name, email, password, role = "Developer" }) {
  try {
    const { data } = await api.post("/auth/register", { name, email, password, role });
    return { token: data.token, user: data.user };
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      if (!name || !email || !password) throw { message: "All fields are required." };
      return demoSession(email, role);
    }
    throw error;
  }
}

export async function getProfile() {
  try {
    const { data } = await api.get("/auth/profile");
    return data;
  } catch (error) {
    if (isNetworkError(error.original || error)) {
      const stored = localStorage.getItem("ph_user");
      if (stored) return JSON.parse(stored);
    }
    throw error;
  }
}
