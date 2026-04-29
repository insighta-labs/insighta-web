import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export function Select({
  value,
  options,
  onChange,
  placeholder,
  style,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        ...style,
      }}
    >
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "var(--bg-input)",
          border: isOpen
            ? "3px solid var(--primary)"
            : "3px solid var(--border)",
          color: selectedOption ? "var(--text)" : "var(--text-muted)",
          padding: "clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px)",
          paddingRight: "40px",
          borderRadius: "var(--radius)",
          cursor: "pointer",
          fontSize: "clamp(13px, 2.5vw, 15px)",
          fontFamily: "var(--font)",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all var(--transition)",
          boxShadow: isOpen ? "4px 4px 0px #000" : "var(--shadow)",
          position: "relative",
          userSelect: "none",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder || "Select..."}
        </span>

        {/* Arrow */}
        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: `translateY(-50%) rotate(${isOpen ? "180deg" : "0deg"})`,
            transition: "transform var(--transition)",
            display: "flex",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* Options list */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "3px solid var(--primary)",
            borderRadius: "var(--radius)",
            zIndex: 2000,
            boxShadow: "6px 6px 0px #000",
            maxHeight: "240px",
            overflowY: "auto",
            animation: "selectFadeIn 150ms ease",
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.2)";
                e.currentTarget.style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color =
                  opt.value === value ? "var(--primary)" : "var(--text)";
              }}
              style={{
                padding: "clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px)",
                cursor: "pointer",
                fontSize: "clamp(13px, 2.5vw, 15px)",
                fontWeight: "bold",
                color: opt.value === value ? "var(--primary)" : "var(--text)",
                background: "transparent",
                transition: "all 100ms ease",
                borderLeft:
                  opt.value === value
                    ? "4px solid var(--primary)"
                    : "4px solid transparent",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes selectFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
