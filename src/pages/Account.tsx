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
    <div
      className="page"
      style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}
    >
      <h2 className="page-title">Identity & Account</h2>

      <div className="card" style={{ padding: "clamp(32px, 6vw, 48px)" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            marginBottom: "clamp(32px, 5vw, 48px)",
          }}
        >
          <div
            style={{
              width: "clamp(80px, 15vw, 110px)",
              height: "clamp(80px, 15vw, 110px)",
              borderRadius: "var(--radius)",
              background: "var(--secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(36px, 8vw, 48px)",
              color: "var(--primary)",
              border: "3px solid var(--border)",
              boxShadow: "var(--shadow)",
              fontFamily: "var(--font-heading)",
              fontWeight: "bold",
              textShadow: "2px 2px 0px #000",
            }}
          >
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "clamp(28px, 6vw, 36px)",
                fontWeight: "bold",
                color: "var(--text)",
                fontFamily: "var(--font-heading)",
                letterSpacing: "3px",
                textShadow: "3px 3px 0px #000",
              }}
            >
              {user.username}
            </div>
            <div
              style={{
                fontSize: "clamp(14px, 2.5vw, 16px)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "3px",
                marginTop: "8px",
                background: "rgba(255,255,255,0.05)",
                padding: "6px 16px",
                borderRadius: "var(--radius)",
                border: "3px solid var(--border)",
                fontWeight: "bold",
                display: "inline-block",
              }}
            >
              {user.role}
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "3px solid var(--border)",
            paddingTop: "clamp(24px, 4vw, 32px)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
              User ID
            </span>
            <code
              style={{
                fontSize: "clamp(12px, 2vw, 14px)",
                color: "var(--text-dim)",
                fontWeight: "bold",
              }}
            >
              {user.id}
            </code>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
              Auth Status
            </span>
            <span
              style={{
                fontSize: "clamp(14px, 2.5vw, 16px)",
                color: "var(--primary)",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Active Session
            </span>
          </div>

          <div style={{ marginTop: "24px" }}>
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
