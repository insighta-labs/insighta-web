import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, hydrated, setUser, setHydrated, setLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated) return;

    const hydrate = async () => {
      setLoading(true);
      try {
        const res = await api.me();
        setUser(res.data);
      } catch {
        // Try refresh once before redirecting
        try {
          const refreshRes = await api.webRefresh();
          if (refreshRes.ok) {
            const res = await api.me();
            setUser(res.data);
            return;
          }
        } catch {
          // fall through
        }
        setUser(null);
        navigate("/login");
      } finally {
        setLoading(false);
        setHydrated();
      }
    };

    hydrate();
  }, [hydrated, navigate, setHydrated, setLoading, setUser]);

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="spinner" style={{ width: "24px", height: "24px" }} />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
