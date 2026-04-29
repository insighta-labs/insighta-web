import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";
import { Button } from "../components/Button";

interface Metrics {
  total: number;
  male: number;
  female: number;
  recent: Array<{
    id: string;
    name: string;
    gender: string;
    country_name: string;
    created_at: string;
  }>;
}

export function Dashboard() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [total, male, female, recent] = await Promise.all([
          api.profiles.list({ page: "1", limit: "1" }),
          api.profiles.list({ page: "1", limit: "1", gender: "male" }),
          api.profiles.list({ page: "1", limit: "1", gender: "female" }),
          api.profiles.list({
            page: "1",
            limit: "5",
            sort_by: "created_at",
            order: "desc",
          }),
        ]);

        setMetrics({
          total: total.total,
          male: male.total,
          female: female.total,
          recent: recent.data,
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div
        className="page"
        style={{ display: "flex", gap: "12px", alignItems: "center" }}
      >
        <span className="spinner" />
        <span style={{ color: "var(--text-muted)" }}>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    const isRateLimit =
      error.toLowerCase().includes("too many requests") ||
      error.includes("429");
    return (
      <div className="page">
        <div
          className="card"
          style={{
            border: isRateLimit
              ? "3px solid var(--warning)"
              : "3px solid var(--error)",
            padding: "40px",
            textAlign: "center",
            boxShadow: "6px 6px 0px #000",
          }}
        >
          <h3
            style={{
              color: isRateLimit ? "var(--warning)" : "var(--error)",
              marginBottom: "16px",
            }}
          >
            {isRateLimit ? "Rate Limit Exceeded" : "System Error"}
          </h3>
          <p style={{ color: "var(--text-dim)", marginBottom: "24px" }}>
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          paddingBottom: "16px",
          borderBottom: "3px solid var(--border)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(24px, 5vw, 32px)",
            letterSpacing: "clamp(2px, 1vw, 4px)",
          }}
        >
          Dashboard
        </h2>
        {user?.role === "admin" && (
          <Link
            to="/profiles?create=1"
            style={{
              padding: "clamp(8px, 1.5vw, 12px) clamp(16px, 3vw, 24px)",
              border: "3px solid var(--primary)",
              color: "var(--primary)",
              borderRadius: "var(--radius)",
              fontSize: "clamp(12px, 2vw, 14px)",
              letterSpacing: "clamp(1px, 0.5vw, 2px)",
              fontWeight: "bold",
              textDecoration: "none",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            + New Profile
          </Link>
        )}
      </div>

      {/* Metric cards */}
      <div
        className="grid-dashboard"
        style={{ marginBottom: "clamp(32px, 6vw, 48px)" }}
      >
        <MetricCard
          className="animate-fade-up animate-stagger-1"
          label="Total Profiles"
          value={metrics!.total}
        />
        <MetricCard
          className="animate-fade-up animate-stagger-2"
          label="Male"
          value={metrics!.male}
          accent="var(--primary)"
        />
        <MetricCard
          className="animate-fade-up animate-stagger-3"
          label="Female"
          value={metrics!.female}
          accent="var(--warning)"
        />
      </div>

      {/* Recent profiles */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "clamp(16px, 3vw, 20px)",
              color: "var(--text-dim)",
              letterSpacing: "2px",
            }}
          >
            RECENTLY ADDED
          </h3>
          <Link
            to="/profiles"
            style={{
              fontSize: "clamp(14px, 2.5vw, 16px)",
              color: "var(--primary)",
              fontWeight: "bold",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            View all
          </Link>
        </div>

        <div className="table-container">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "600px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "3px solid var(--border)" }}>
                {["Name", "Gender", "Country", "Added"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: "clamp(12px, 2vw, 14px)",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      fontWeight: "bold",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics!.recent.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "2px solid var(--border)" }}
                >
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    <Link
                      to={`/profiles/${p.id}`}
                      style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                      }}
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "16px",
                      color: "var(--text-dim)",
                    }}
                  >
                    {p.gender}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "16px",
                      color: "var(--text-dim)",
                    }}
                  >
                    {p.country_name}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                    }}
                  >
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent = "var(--text)",
  className = "",
}: {
  label: string;
  value: number;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={`card ${className}`}
      style={{ textAlign: "center", padding: "clamp(24px, 5vw, 40px)" }}
    >
      <div
        style={{
          fontSize: "clamp(48px, 10vw, 64px)",
          fontWeight: "bold",
          color: accent,
          lineHeight: 1,
          marginBottom: "12px",
        }}
      >
        {value.toLocaleString()}
      </div>
      <div
        style={{
          fontSize: "clamp(14px, 3vw, 18px)",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "3px",
          fontWeight: "bold",
        }}
      >
        {label}
      </div>
    </div>
  );
}
