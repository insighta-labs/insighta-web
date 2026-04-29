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
            fontSize: "clamp(14px, 2.5vw, 16px)",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "24px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontWeight: "bold",
          }}
        >
          Back to Profiles
        </Link>
        <p
          className="error-text"
          style={{ fontSize: "clamp(14px, 3vw, 16px)", marginTop: "16px" }}
        >
          {error || "Profile not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "clamp(32px, 5vw, 48px)",
        }}
      >
        <div>
          <Link
            to="/profiles"
            style={{
              fontSize: "clamp(14px, 2.5vw, 16px)",
              color: "var(--text-muted)",
              textDecoration: "none",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: "bold",
            }}
          >
            Back to Profiles
          </Link>
          <h2
            style={{
              margin: 0,
              marginTop: "12px",
              fontSize: "clamp(28px, 6vw, 40px)",
              color: "var(--primary)",
            }}
          >
            {profile.name}
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "clamp(12px, 2vw, 14px)",
              marginTop: "8px",
              letterSpacing: "1px",
              fontWeight: "bold",
            }}
          >
            ID: {profile.id}
          </p>
        </div>

        {user?.role === "admin" && (
          <Button
            variant="danger"
            loading={deleting}
            onClick={() => setShowConfirm(true)}
          >
            Delete Profile
          </Button>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
        >
          <div
            className="modal-content"
            style={{
              border: "3px solid var(--error)",
              boxShadow: "6px 6px 0px #000",
            }}
          >
            <h3
              style={{
                marginBottom: "16px",
                fontSize: "clamp(18px, 3vw, 22px)",
                color: "var(--error)",
              }}
            >
              Confirm Deletion
            </h3>
            <p
              style={{
                marginBottom: "24px",
                fontSize: "clamp(14px, 2.5vw, 16px)",
                color: "var(--text-dim)",
              }}
            >
              Are you sure you want to permanently delete this profile? This
              action cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
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
          gap: "clamp(16px, 3vw, 32px)",
        }}
      >
        <div className="card" style={{ padding: "clamp(24px, 5vw, 40px)" }}>
          <SectionTitle>Demographics</SectionTitle>
          <DataRow label="Gender" value={profile.gender} />
          <DataRow
            label="Confidence"
            value={`${(profile.gender_probability * 100).toFixed(1)}%`}
          />
          <DataRow label="Age" value={profile.age} />
          <DataRow label="Age Group" value={profile.age_group} />
        </div>

        <div className="card" style={{ padding: "clamp(24px, 5vw, 40px)" }}>
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
        fontSize: "clamp(14px, 2.5vw, 18px)",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "3px",
        marginBottom: "24px",
        borderBottom: "3px solid var(--border)",
        paddingBottom: "12px",
        fontWeight: "bold",
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
        padding: "14px 0",
        borderBottom: "2px solid rgba(255,255,255,0.1)",
      }}
    >
      <span
        style={{
          color: "var(--text-muted)",
          fontSize: "clamp(14px, 2.5vw, 16px)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontWeight: "bold",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: "var(--text)",
          fontWeight: "bold",
          fontSize: "clamp(14px, 2.5vw, 16px)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
