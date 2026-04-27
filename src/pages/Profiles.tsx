import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";
import { config } from "../config";
import type { Profile, ProfileListResponse } from "../types";
import { Button } from "../components/Button";
import { Select } from "../components/Select";

const SORT_OPTIONS = [
  { value: "age", label: "Age" },
  { value: "created_at", label: "Date Added" },
  { value: "gender_probability", label: "Gender Confidence" },
];

interface Filters {
  gender: string;
  age_group: string;
  country_id: string;
  min_age: string;
  max_age: string;
  sort_by: string;
  order: string;
}

const DEFAULT_FILTERS: Filters = {
  gender: "",
  age_group: "",
  country_id: "",
  min_age: "",
  max_age: "",
  sort_by: "age",
  order: "asc",
};

export function Profiles() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [result, setResult] = useState<ProfileListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const page = Number(searchParams.get("page") || "1");

  const refresh = useCallback(() => setRefreshTrigger((v) => v + 1), []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: "20",
          sort_by: filters.sort_by,
          order: filters.order,
        };
        if (filters.gender) params.gender = filters.gender;
        if (filters.age_group) params.age_group = filters.age_group;
        if (filters.country_id)
          params.country_id = filters.country_id.toUpperCase();
        if (filters.min_age) params.min_age = filters.min_age;
        if (filters.max_age) params.max_age = filters.max_age;

        const data = await api.profiles.list(params);
        if (!ignore) setResult(data);
      } catch (e: unknown) {
        if (!ignore)
          setError(e instanceof Error ? e.message : "Failed to load profiles");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [page, filters, refreshTrigger]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setLoading(true);
    setSearchParams({ page: "1" });
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await api.profiles.create(createName.trim());
      setCreateName("");
      setShowCreate(false);
      refresh();
    } catch (e: unknown) {
      setCreateError(
        e instanceof Error ? e.message : "Failed to create profile",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setDeleteId(id);
    setConfirmDeleteId(null);
    try {
      await api.profiles.delete(id);
      refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete profile");
    } finally {
      setDeleteId(null);
    }
  };

  const handleExport = async () => {
    const params: Record<string, string> = { format: "csv" };
    if (filters.gender) params.gender = filters.gender;
    if (filters.country_id) params.country_id = filters.country_id;
    if (filters.age_group) params.age_group = filters.age_group;
    if (filters.min_age) params.min_age = filters.min_age;
    if (filters.max_age) params.max_age = filters.max_age;
    const qs = new URLSearchParams(params).toString();
    try {
      const res = await fetch(`${config.apiUrl}/api/profiles/export?${qs}`, {
        method: "GET",
        credentials: "include",
        headers: { "X-API-Version": "1" },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          (json as { message?: string }).message || "Export failed",
        );
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] || "profiles_export.csv";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Export failed");
    }
  };

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "20px" }}>Profiles</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="ghost"
            onClick={handleExport}
            style={{ fontSize: "12px" }}
          >
            Export CSV
          </Button>
          {user?.role === "admin" && (
            <Button
              onClick={() => setShowCreate(true)}
              style={{ fontSize: "12px" }}
            >
              + New Profile
            </Button>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
        >
          <div className="modal-content">
            <h3 style={{ marginBottom: "16px", fontSize: "14px" }}>
              Create Profile
            </h3>
            <input
              type="text"
              placeholder="Enter a name..."
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
              style={{ marginBottom: "12px" }}
            />
            {createError && (
              <p className="error-text" style={{ marginBottom: "12px" }}>
                {createError}
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="ghost"
                onClick={() => setShowCreate(false)}
                style={{ fontSize: "12px" }}
              >
                Cancel
              </Button>
              <Button
                loading={creating}
                onClick={handleCreate}
                style={{ fontSize: "12px" }}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setConfirmDeleteId(null)
          }
        >
          <div
            className="modal-content"
            style={{
              border: "1px solid var(--error)",
              boxShadow: "0 0 20px rgba(255, 68, 102, 0.1)",
            }}
          >
            <h3
              style={{
                marginBottom: "12px",
                fontSize: "14px",
                color: "var(--error)",
              }}
            >
              Confirm Deletion
            </h3>
            <p
              style={{
                marginBottom: "20px",
                fontSize: "13px",
                color: "var(--text-dim)",
              }}
            >
              Are you sure you want to permanently delete this profile? This
              action cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="ghost"
                onClick={() => setConfirmDeleteId(null)}
                style={{ fontSize: "12px" }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                style={{ fontSize: "12px" }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "24px",
        }}
      >
        {/* Filters sidebar */}
        <div className="card" style={{ alignSelf: "start" }}>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "16px",
            }}
          >
            Filters
          </div>

          <FilterGroup label="Gender">
            <Select
              value={filters.gender}
              onChange={(val) => setFilters({ ...filters, gender: val })}
              options={[
                { value: "", label: "All Genders" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
            />
          </FilterGroup>

          <FilterGroup label="Age Group">
            <Select
              value={filters.age_group}
              onChange={(val) => setFilters({ ...filters, age_group: val })}
              options={[
                { value: "", label: "All Ages" },
                { value: "child", label: "Child" },
                { value: "teenager", label: "Teenager" },
                { value: "adult", label: "Adult" },
                { value: "senior", label: "Senior" },
              ]}
            />
          </FilterGroup>

          <FilterGroup label="Country Code">
            <input
              type="text"
              placeholder="e.g. NG"
              maxLength={2}
              value={filters.country_id}
              onChange={(e) =>
                handleFilterChange("country_id", e.target.value.toUpperCase())
              }
            />
          </FilterGroup>

          <FilterGroup label="Age Range">
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                placeholder="Min"
                min={0}
                max={120}
                value={filters.min_age}
                onChange={(e) => handleFilterChange("min_age", e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                min={0}
                max={120}
                value={filters.max_age}
                onChange={(e) => handleFilterChange("max_age", e.target.value)}
              />
            </div>
          </FilterGroup>

          <FilterGroup label="Sort By">
            <Select
              value={filters.sort_by}
              onChange={(val) => setFilters({ ...filters, sort_by: val })}
              options={SORT_OPTIONS}
            />
          </FilterGroup>

          <FilterGroup label="Order">
            <Select
              value={filters.order}
              onChange={(val) => setFilters({ ...filters, order: val })}
              options={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
            />
          </FilterGroup>

          <button
            onClick={() => {
              setFilters(DEFAULT_FILTERS);
              setSearchParams({ page: "1" });
            }}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "6px",
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "var(--font)",
            }}
          >
            Reset filters
          </button>
        </div>

        {/* Table */}
        <div>
          {error && (
            <p className="error-text" style={{ marginBottom: "16px" }}>
              {error}
            </p>
          )}

          {loading ? (
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <span className="spinner" />
              <span style={{ color: "var(--text-muted)" }}>Loading...</span>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                }}
              >
                {result?.total.toLocaleString()} profiles — page {page} of{" "}
                {result?.total_pages}
              </div>

              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {[
                        "Name",
                        "Gender",
                        "Age",
                        "Country",
                        "Prob.",
                        "Added",
                        "",
                      ].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: "left",
                            padding: "10px 16px",
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            fontWeight: "normal",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result?.data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            padding: "32px 16px",
                            textAlign: "center",
                            color: "var(--text-muted)",
                          }}
                        >
                          No profiles match the current filters.
                        </td>
                      </tr>
                    ) : (
                      result?.data.map((p) => (
                        <ProfileRow
                          key={p.id}
                          profile={p}
                          isAdmin={user?.role === "admin"}
                          deleting={deleteId === p.id}
                          onDelete={() => setConfirmDeleteId(p.id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "16px",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                {result?.links.prev && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchParams({ page: String(page - 1) })}
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    ← Prev
                  </Button>
                )}
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    padding: "0 8px",
                  }}
                >
                  {page} / {result?.total_pages}
                </span>
                {result?.links.next && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchParams({ page: String(page + 1) })}
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Next →
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  profile,
  isAdmin,
  deleting,
  onDelete,
}: {
  profile: Profile;
  isAdmin: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <tr
      style={{
        borderBottom: "1px solid var(--border)",
        transition: "background var(--transition)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "var(--secondary)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "")
      }
    >
      <td style={{ padding: "10px 16px" }}>
        <Link
          to={`/profiles/${profile.id}`}
          style={{ color: "var(--primary)", textDecoration: "none" }}
        >
          {profile.name}
        </Link>
      </td>
      <td style={{ padding: "10px 16px", color: "var(--text-dim)" }}>
        {profile.gender}
      </td>
      <td style={{ padding: "10px 16px", color: "var(--text-dim)" }}>
        {profile.age}{" "}
        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
          ({profile.age_group})
        </span>
      </td>
      <td style={{ padding: "10px 16px", color: "var(--text-dim)" }}>
        {profile.country_name}{" "}
        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
          {profile.country_id}
        </span>
      </td>
      <td
        style={{
          padding: "10px 16px",
          color: "var(--text-muted)",
          fontSize: "12px",
        }}
      >
        {(profile.gender_probability * 100).toFixed(0)}%
      </td>
      <td
        style={{
          padding: "10px 16px",
          color: "var(--text-muted)",
          fontSize: "12px",
        }}
      >
        {new Date(profile.created_at).toLocaleDateString()}
      </td>
      <td style={{ padding: "10px 16px" }}>
        {isAdmin && (
          <button
            onClick={onDelete}
            disabled={deleting}
            style={{
              background: "none",
              border: "none",
              color: deleting ? "var(--text-muted)" : "var(--error)",
              cursor: deleting ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontFamily: "var(--font)",
              opacity: deleting ? 0.5 : 1,
            }}
          >
            {deleting ? "..." : "Delete"}
          </button>
        )}
      </td>
    </tr>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
