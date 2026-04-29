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

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
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
      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: "clamp(24px, 4vw, 32px)",
          fontSize: "clamp(14px, 3vw, 16px)",
        }}
      >
        Enter a natural language query (e.g. "men from Nigeria", "teenagers").
      </p>

      <form
        onSubmit={handleSearch}
        className="flex-between-responsive"
        style={{ marginBottom: "clamp(32px, 5vw, 48px)" }}
      >
        <input
          type="text"
          className="search-input"
          placeholder="Search profiles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            fontSize: "clamp(14px, 3vw, 18px)",
            width: "100%",
            padding: "clamp(12px, 2vw, 16px)",
          }}
        />
        <Button
          loading={loading}
          style={{
            width: "100%",
            maxWidth: "fit-content",
            padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 32px)",
          }}
        >
          Search
        </Button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <>
          <div
            style={{
              fontSize: "clamp(12px, 2vw, 14px)",
              color: "var(--text-muted)",
              marginBottom: "16px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Found {result.total} results
          </div>
          <div className="table-container">
            <div
              className="card"
              style={{ padding: 0, overflow: "hidden", minWidth: "600px" }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "3px solid var(--border)" }}>
                    {["Name", "Gender", "Age", "Country"].map((h) => (
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
                  {result.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: "48px 16px",
                          textAlign: "center",
                          color: "var(--text-muted)",
                          fontSize: "clamp(14px, 3vw, 16px)",
                        }}
                      >
                        No profiles found.
                      </td>
                    </tr>
                  ) : (
                    result.data.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`animate-fade-up animate-stagger-${(i % 5) + 1}`}
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
                          {p.age}
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            fontSize: "16px",
                            color: "var(--text-dim)",
                          }}
                        >
                          {p.country_id}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
