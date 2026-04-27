import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { config } from "../config";

const BASE = config.apiUrl;

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash));
  return btoa(hashArray.map((b) => String.fromCharCode(b)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function Login() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleLogin = async () => {
    const state = crypto.randomUUID().replace(/-/g, "");
    const redirectUri = `${window.location.origin}/callback`;
    const verifier = generateCodeVerifier();
    const challenge = await deriveCodeChallenge(verifier);
    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem("pkce_verifier", verifier);
    const url = `${BASE}/auth/github?state=${state}&code_challenge=${encodeURIComponent(challenge)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "380px",
          textAlign: "center",
          boxShadow: "var(--shadow-green)",
          border: "1px solid var(--border-bright)",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "var(--primary)",
            letterSpacing: "4px",
            marginBottom: "8px",
          }}
        >
          INSIGHTA
        </div>
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "12px",
            letterSpacing: "2px",
            marginBottom: "32px",
          }}
        >
          LABS+ INTELLIGENCE PLATFORM
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            border: "1px solid var(--primary)",
            color: "var(--primary)",
            fontFamily: "var(--font)",
            fontSize: "13px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: "var(--radius)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        <div
          style={{
            marginTop: "24px",
            color: "var(--text-muted)",
            fontSize: "11px",
          }}
        >
          Access requires authorization. Contact your administrator if you need
          elevated permissions.
        </div>
      </div>
    </div>
  );
}
