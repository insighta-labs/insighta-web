import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "transparent",
      border: "1px solid var(--primary)",
      color: "var(--primary)",
      padding: "8px 20px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    ghost: {
      background: "transparent",
      border: "1px solid var(--border)",
      color: "var(--text-dim)",
      padding: "8px 20px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    danger: {
      background: "transparent",
      border: "1px solid var(--error)",
      color: "var(--error)",
      padding: "8px 20px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
  };

  return (
    <button
      {...props}
      style={{
        ...styles[variant],
        opacity: disabled || loading ? 0.5 : 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        fontFamily: "var(--font)",
        fontSize: "var(--font-size)",
        borderRadius: "var(--radius)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...(props.style || {}),
      }}
      disabled={disabled || loading}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}
