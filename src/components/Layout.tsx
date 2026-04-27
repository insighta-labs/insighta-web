import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.webLogout();
    setUser(null);
    navigate("/login");
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 32px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link
            to="/dashboard"
            style={{
              color: "var(--primary)",
              fontWeight: "bold",
              fontSize: "16px",
              letterSpacing: "2px",
              textDecoration: "none",
            }}
          >
            INSIGHTA
          </Link>
          <nav style={{ display: "flex", gap: "24px" }}>
            <Link
              to="/dashboard"
              style={{ color: "var(--text-dim)", textDecoration: "none" }}
            >
              Dashboard
            </Link>
            <Link
              to="/profiles"
              style={{ color: "var(--text-dim)", textDecoration: "none" }}
            >
              Profiles
            </Link>
            <Link
              to="/search"
              style={{ color: "var(--text-dim)", textDecoration: "none" }}
            >
              Search
            </Link>
          </nav>
        </div>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              className={`badge badge-${user.role}`}
              style={{ fontSize: "11px" }}
            >
              {user.role}
            </span>
            <Link
              to="/account"
              style={{ color: "var(--text-dim)", textDecoration: "none" }}
            >
              @{user.username}
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontFamily: "var(--font)",
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "12px 32px",
          color: "var(--text-muted)",
          fontSize: "12px",
          background: "var(--bg-card)",
        }}
      >
        INSIGHTA LABS+ — PROFILE INTELLIGENCE SYSTEM
      </footer>
    </div>
  );
}
