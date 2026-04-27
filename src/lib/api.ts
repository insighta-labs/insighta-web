import type { User, Profile, ProfileListResponse } from "../types";
import { config } from "../config";

const BASE = config.apiUrl;
const API_VERSION = "1";

function getCsrfToken(): string {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));
  return match ? match.split("=")[1] : "";
}

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  skipVersion?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, skipVersion = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!skipVersion) {
    headers["X-API-Version"] = API_VERSION;
  }

  if (method === "POST" || method === "DELETE") {
    headers["X-CSRF-Token"] = getCsrfToken();
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(json.message || "Request failed");
  }

  return json as T;
}

export const api = {
  me: () =>
    request<{ status: string; data: User }>("/auth/me", {
      skipVersion: true,
    }),

  webLogout: () =>
    fetch(`${BASE}/auth/web/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": getCsrfToken() },
    }),

  webRefresh: () =>
    fetch(`${BASE}/auth/web/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": getCsrfToken() },
    }),

  profiles: {
    list: (params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<ProfileListResponse>(
        `/api/profiles?${qs}`,
      );
    },
    get: (id: string) =>
      request<{ status: string; data: Profile }>(
        `/api/profiles/${id}`,
      ),
    search: (params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<ProfileListResponse>(
        `/api/profiles/search?${qs}`,
      );
    },
    create: (name: string) =>
      request<{ status: string; data: Profile }>(
        "/api/profiles",
        { method: "POST", body: { name } },
      ),
    delete: (id: string) =>
      request<void>(`/api/profiles/${id}`, { method: "DELETE" }),
    exportUrl: (params: Record<string, string>) => {
      const qs = new URLSearchParams({ ...params, format: "csv" }).toString();
      return `${BASE}/api/profiles/export?${qs}`;
    },
  },
};
