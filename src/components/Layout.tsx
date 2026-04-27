import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";
import "./Layout.css";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.webLogout();
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-left">
          <Link to="/dashboard" className="layout-logo">
            INSIGHTA
          </Link>
          <nav className="layout-nav">
            <Link to="/dashboard" className="layout-nav-link">
              Dashboard
            </Link>
            <Link to="/profiles" className="layout-nav-link">
              Profiles
            </Link>
            <Link to="/search" className="layout-nav-link">
              Search
            </Link>
          </nav>
        </div>

        {user && (
          <div className="layout-user">
            <span className={`badge badge-${user.role}`} style={{ fontSize: "11px" }}>
              {user.role}
            </span>
            <Link to="/account" className="layout-username">
              @{user.username}
            </Link>
            <button onClick={handleLogout} className="layout-logout">
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="layout-main">{children}</main>

      <footer className="layout-footer">
        INSIGHTA LABS+ — PROFILE INTELLIGENCE SYSTEM
      </footer>
    </div>
  );
}
