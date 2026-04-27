import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";
import type { Profile } from "../types";
import { Button } from "../components/Button";

export function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const res = await api.profiles.get(id);
        setProfile(res.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setShowConfirm(false);
    try {
      await api.profiles.delete(id);
      navigate("/profiles");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete profile");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="page"
        style={{ display: "flex", gap: "12px", alignItems: "center" }}
      >
        <span className="spinner" />
        <span style={{ color: "var(--text-muted)" }}>Loading profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page">
        <Link
          to="/profiles"
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            textDecoration: "none",
            display: "block",
            marginBottom: "16px",
          }}
        >
          ← Back to Profiles
        </Link>
        <p className="error-text">{error || "Profile not found"}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div
        className="flex-between-responsive"
        style={{
          alignItems: "flex-start",
          marginBottom: "32px",
        }}
      >
        <div>
          <Link
            to="/profiles"
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "block",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            ← Back to Profiles
          </Link>
          <h2 style={{ margin: 0, fontSize: "28px", color: "var(--primary)" }}>
            {profile.name}
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "12px",
              marginTop: "4px",
            }}
          >
            ID: {profile.id}
          </p>
        </div>

        {user?.role === "admin" && (
          <Button variant="danger" loading={deleting} onClick={() => setShowConfirm(true)}>
            Delete Profile
          </Button>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}>
          <div className="modal-content" style={{ border: "1px solid var(--error)", boxShadow: "0 0 20px rgba(255, 68, 102, 0.1)" }}>
            <h3 style={{ marginBottom: "12px", fontSize: "14px", color: "var(--error)" }}>
              Confirm Deletion
            </h3>
            <p style={{ marginBottom: "20px", fontSize: "13px", color: "var(--text-dim)" }}>
              Are you sure you want to permanently delete this profile? This action cannot be undone.
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
                onClick={() => setShowConfirm(false)}
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
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        <div className="card">
          <SectionTitle>Demographics</SectionTitle>
          <DataRow label="Gender" value={profile.gender} />
          <DataRow
            label="Confidence"
            value={`${(profile.gender_probability * 100).toFixed(1)}%`}
          />
          <DataRow label="Age" value={profile.age} />
          <DataRow label="Age Group" value={profile.age_group} />
        </div>

        <div className="card">
          <SectionTitle>Location & Metadata</SectionTitle>
          <DataRow label="Country" value={profile.country_name} />
          <DataRow label="Country Code" value={profile.country_id} />
          <DataRow
            label="Confidence"
            value={`${(profile.country_probability * 100).toFixed(1)}%`}
          />
          <DataRow
            label="Date Added"
            value={new Date(profile.created_at).toLocaleString()}
          />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: "12px",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "2px",
        marginBottom: "20px",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "8px",
      }}
    >
      {children}
    </h3>
  );
}

function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
        {label}
      </span>
      <span
        style={{ color: "var(--text)", fontWeight: "bold", fontSize: "14px" }}
      >
        {value}
      </span>
    </div>
  );
}
