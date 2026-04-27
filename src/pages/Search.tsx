import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { ProfileListResponse } from "../types";
import { Button } from "../components/Button";

export function Search() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfileListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.profiles.search({ q: query });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">Intelligence Search</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
        Enter a natural language query (e.g. "men from Nigeria", "teenagers").
      </p>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: "12px", marginBottom: "32px" }}
      >
        <input
          type="text"
          placeholder="Search profiles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, fontSize: "16px" }}
        />
        <Button loading={loading} onClick={handleSearch}>
          Search
        </Button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "12px",
            }}
          >
            Found {result.total} results
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Name", "Gender", "Age", "Country"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 16px",
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
                {result.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "32px 16px",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      No profiles found.
                    </td>
                  </tr>
                ) : (
                  result.data.map((p) => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td style={{ padding: "10px 16px" }}>
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
                      <td style={{ padding: "10px 16px", color: "var(--text-dim)" }}>
                        {p.gender}
                      </td>
                      <td style={{ padding: "10px 16px", color: "var(--text-dim)" }}>
                        {p.age}
                      </td>
                      <td style={{ padding: "10px 16px", color: "var(--text-dim)" }}>
                        {p.country_id}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
