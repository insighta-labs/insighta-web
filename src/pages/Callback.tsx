import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { config } from "../config";

const BASE = config.apiUrl;

export function Callback() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error) {
      navigate(
        `/login?error=${encodeURIComponent(params.get("error_description") || error)}`,
      );
      return;
    }

    const storedState = sessionStorage.getItem("oauth_state");
    sessionStorage.removeItem("oauth_state");
    const pkceVerifier = sessionStorage.getItem("pkce_verifier") || "";
    sessionStorage.removeItem("pkce_verifier");

    if (!code || !state || state !== storedState) {
      navigate("/login?error=invalid_state");
      return;
    }

    const exchange = async () => {
      try {
        const res = await fetch(
          `${BASE}/auth/web/exchange?code=${code}&state=${state}&code_verifier=${pkceVerifier}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          },
        );

        const json = await res.json();

        if (!res.ok) {
          navigate(
            `/login?error=${encodeURIComponent(json.message || "Login failed")}`,
          );
          return;
        }

        setUser(json.data);
        navigate("/dashboard");
      } catch {
        navigate("/login?error=network_error");
      }
    };

    exchange();
  }, [navigate, setUser]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <span className="spinner" style={{ width: "32px", height: "32px" }} />
      <div
        style={{
          color: "var(--text-muted)",
          letterSpacing: "2px",
          fontSize: "12px",
        }}
      >
        COMPLETING AUTHENTICATION...
      </div>
    </div>
  );
}
