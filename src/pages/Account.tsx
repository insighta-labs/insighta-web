import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";
import { Button } from "../components/Button";

export function Account() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.webLogout();
      logout();
      navigate("/login");
    } catch (e: unknown) {
      console.error("Logout failed", e);
      logout(); // Force logout anyway
      navigate("/login");
    }
  };

  if (!user) return null;

  return (
    <div className="page" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 className="page-title">Identity & Account</h2>

      <div className="card" style={{ padding: "32px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "var(--primary)",
              border: "2px solid var(--border-bright)",
            }}
          >
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "var(--text)",
              }}
            >
              {user.username}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginTop: "4px",
                background: "rgba(255,255,255,0.05)",
                padding: "2px 8px",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              {user.role}
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              User ID
            </span>
            <code style={{ fontSize: "12px", color: "var(--text-dim)" }}>
              {user.id}
            </code>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Auth Status
            </span>
            <span style={{ fontSize: "13px", color: "var(--success)" }}>
              Active Session
            </span>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Button
              variant="danger"
              onClick={handleLogout}
              style={{ width: "100%" }}
            >
              Terminate Session (Logout)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
