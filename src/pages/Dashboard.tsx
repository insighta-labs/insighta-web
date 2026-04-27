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
    const isRateLimit = error.toLowerCase().includes("too many requests") || error.includes("429");
    return (
      <div className="page">
        <div className="card" style={{ border: isRateLimit ? "1px solid var(--warning)" : "1px solid var(--error)", padding: "40px", textAlign: "center" }}>
           <h3 style={{ color: isRateLimit ? "var(--warning)" : "var(--error)", marginBottom: "16px" }}>
             {isRateLimit ? "Rate Limit Exceeded" : "System Error"}
           </h3>
           <p style={{ color: "var(--text-dim)", marginBottom: "24px" }}>{error}</p>
           <Button onClick={() => window.location.reload()}>Retry Connection</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="flex-between-responsive" style={{ marginBottom: "24px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ margin: 0, fontSize: "20px" }}>Dashboard</h2>
        {user?.role === "admin" && (
          <Link
            to="/profiles?create=1"
            style={{
              padding: "6px 16px",
              border: "1px solid var(--primary)",
              color: "var(--primary)",
              borderRadius: "var(--radius)",
              fontSize: "12px",
              letterSpacing: "1px",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            + New Profile
          </Link>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid-dashboard" style={{ marginBottom: "32px" }}>
        <MetricCard label="Total Profiles" value={metrics!.total} />
        <MetricCard
          label="Male"
          value={metrics!.male}
          accent="var(--primary)"
        />
        <MetricCard
          label="Female"
          value={metrics!.female}
          accent="var(--warning)"
        />
      </div>

      {/* Recent profiles */}
      <div className="card">
        <div className="flex-between-responsive" style={{ marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "14px", color: "var(--text-dim)" }}>
            RECENTLY ADDED
          </h3>
          <Link
            to="/profiles"
            style={{
              fontSize: "12px",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            View all →
          </Link>
        </div>

        <div className="table-container">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "Gender", "Country", "Added"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
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
              {metrics!.recent.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "10px 12px" }}>
                    <Link
                      to={`/profiles/${p.id}`}
                      style={{ color: "var(--primary)", textDecoration: "none" }}
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                    {p.gender}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                    {p.country_name}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--text-muted)",
                      fontSize: "12px",
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
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: "36px",
          fontWeight: "bold",
          color: accent,
          lineHeight: 1,
          marginBottom: "8px",
        }}
      >
        {value.toLocaleString()}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </div>
    </div>
  );
}
