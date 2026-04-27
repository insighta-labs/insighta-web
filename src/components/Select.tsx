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

export function Select({ value, options, onChange, placeholder, style }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
          border: isOpen ? "1px solid var(--primary)" : "1px solid var(--border)",
          color: selectedOption ? "var(--text)" : "var(--text-muted)",
          padding: "8px 12px",
          paddingRight: "36px",
          borderRadius: "var(--radius)",
          cursor: "pointer",
          fontSize: "var(--font-size)",
          fontFamily: "var(--font)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all var(--transition)",
          boxShadow: isOpen ? "0 0 10px rgba(0, 255, 136, 0.2)" : "inset 0 1px 3px rgba(0,0,0,0.2)",
          position: "relative",
          userSelect: "none",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder || "Select..."}
        </span>
        
        {/* Arrow */}
        <div style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: `translateY(-50%) rotate(${isOpen ? "180deg" : "0deg"})`,
          transition: "transform var(--transition)",
          display: "flex"
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* Options list */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--primary)",
            borderRadius: "var(--radius)",
            zIndex: 2000,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
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
                e.currentTarget.style.background = "var(--secondary)";
                e.currentTarget.style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = opt.value === value ? "var(--primary)" : "var(--text)";
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "13px",
                color: opt.value === value ? "var(--primary)" : "var(--text)",
                background: opt.value === value ? "rgba(0, 255, 136, 0.05)" : "transparent",
                transition: "all 100ms ease",
                borderLeft: opt.value === value ? "2px solid var(--primary)" : "2px solid transparent",
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
