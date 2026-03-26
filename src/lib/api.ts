const AUTH_URL = "https://functions.poehali.dev/c8265601-1efd-44e2-8f04-964846023311";

export interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  email: string;
  avatar: string;
  status: string;
  bio: string;
  role: string;
  created_at: string;
}

function getToken(): string {
  return localStorage.getItem("nexus_token") || "";
}

async function callAuth(action: string, body?: object, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = token || getToken();
  if (t) headers["X-Session-Token"] = t;

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

export async function register(username: string, display_name: string, email: string, password: string) {
  const data = await callAuth("register", { username, display_name, email, password });
  localStorage.setItem("nexus_token", data.token);
  return data as { token: string; user: UserProfile };
}

export async function login(login: string, password: string) {
  const data = await callAuth("login", { login, password });
  localStorage.setItem("nexus_token", data.token);
  return data as { token: string; user: UserProfile };
}

export async function logout() {
  await callAuth("logout");
  localStorage.removeItem("nexus_token");
}

export async function getMe(): Promise<UserProfile | null> {
  const token = getToken();
  if (!token) return null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Session-Token": token,
  };
  const res = await fetch(AUTH_URL, { method: "POST", headers, body: JSON.stringify({ action: "me" }) });
  if (!res.ok) { localStorage.removeItem("nexus_token"); return null; }
  const data = await res.json();
  return data.user as UserProfile;
}
