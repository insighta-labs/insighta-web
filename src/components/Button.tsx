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
      border: "3px solid var(--primary)",
      color: "var(--primary)",
      padding: "clamp(10px, 2vw, 16px) clamp(16px, 3vw, 32px)",
      textTransform: "uppercase",
      letterSpacing: "clamp(1px, 0.5vw, 3px)",
      fontSize: "clamp(12px, 3vw, 15px)",
      fontWeight: "bold",
    },
    ghost: {
      background: "transparent",
      border: "3px solid var(--border)",
      color: "var(--text)",
      padding: "clamp(10px, 2vw, 16px) clamp(16px, 3vw, 32px)",
      textTransform: "uppercase",
      letterSpacing: "clamp(1px, 0.5vw, 3px)",
      fontSize: "clamp(12px, 3vw, 15px)",
      fontWeight: "bold",
    },
    danger: {
      background: "transparent",
      border: "3px solid var(--error)",
      color: "var(--error)",
      padding: "clamp(10px, 2vw, 16px) clamp(16px, 3vw, 32px)",
      textTransform: "uppercase",
      letterSpacing: "clamp(1px, 0.5vw, 3px)",
      fontSize: "clamp(12px, 3vw, 15px)",
      fontWeight: "bold",
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
