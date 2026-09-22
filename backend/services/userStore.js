'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// In-memory store -- replace with database in next phase.
// Keys: id (UUID), github_id, github_username, name, email, avatar_url,
//       github_profile_url, role (DEVELOPER | ADMIN), created_at, updated_at
const users = new Map();

// Indexes for fast lookup
const byGithubId = new Map();
const byEmail = new Map();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;
  if (!email || !plainPassword) {
    console.warn('[UserStore] ADMIN_EMAIL or ADMIN_PASSWORD not set -- admin login disabled');
    return;
  }
  if (byEmail.has(email)) return; // already seeded
  const passwordHash = await bcrypt.hash(plainPassword, 12);
  const admin = {
    id: uuidv4(),
    github_id: null,
    github_username: null,
    name: 'Platform Administrator',
    email,
    avatar_url: null,
    github_profile_url: null,
    role: 'ADMIN',
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  users.set(admin.id, admin);
  byEmail.set(email, admin.id);
  console.log('[UserStore] Admin account seeded for:', email);
}

function findById(id) {
  return users.get(id) || null;
}

function findByGithubId(githubId) {
  const userId = byGithubId.get(String(githubId));
  return userId ? users.get(userId) : null;
}

function findByEmail(email) {
  const userId = byEmail.get(email);
  return userId ? users.get(userId) : null;
}

// Upsert a GitHub user -- creates or updates identity fields
function upsertGithubUser({ github_id, github_username, name, email, avatar_url, github_profile_url }) {
  const existing = findByGithubId(github_id);
  const now = new Date().toISOString();
  if (existing) {
    // Update identity fields that may have changed on GitHub
    existing.github_username = github_username || existing.github_username;
    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.avatar_url = avatar_url || existing.avatar_url;
    existing.github_profile_url = github_profile_url || existing.github_profile_url;
    existing.updated_at = now;
    return existing;
  }
  const user = {
    id: uuidv4(),
    github_id: String(github_id),
    github_username,
    name: name || github_username,
    email: email || null,
    avatar_url: avatar_url || null,
    github_profile_url: github_profile_url || null,
    role: 'DEVELOPER',
    password_hash: null,
    created_at: now,
    updated_at: now,
  };
  users.set(user.id, user);
  byGithubId.set(user.github_id, user.id);
  if (user.email) byEmail.set(user.email, user.id);
  return user;
}

// Return a safe public representation (no password_hash)
function publicProfile(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

module.exports = { seedAdmin, findById, findByGithubId, findByEmail, upsertGithubUser, publicProfile };
