type Props = {
  size?: number;
  withText?: boolean;
  subtitle?: boolean;
  className?: string;
};

// Eloop Token mark: outer ring + inner disc + 3 recycling arrows with circuit dots.
export function EloopLogo({
  size = 96,
  withText = false,
  subtitle = false,
  className,
}: Props) {
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Eloop Token"
        role="img"
      >
        <circle cx="40" cy="40" r="38" fill="none" stroke="#1DB954" strokeWidth="1.5" />
        <circle cx="40" cy="40" r="28" fill="#162016" />
        <path d="M26 40 A14 14 0 0 1 54 40" fill="none" stroke="#1DB954" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M54 40 A14 14 0 0 1 26 40" fill="none" stroke="#1DB954" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
        <line x1="26" y1="37" x2="36" y2="37" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" />
        <line x1="26" y1="43" x2="36" y2="43" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="37" r="2" fill="#1DB954" />
        <circle cx="36" cy="43" r="2" fill="#1DB954" />
        <path d="M52 36 L56 40 L52 44" fill="none" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {withText && (
        <>
          <div
            className="mt-3 text-sm font-bold tracking-[0.22em]"
            style={{ color: "#E8F5E8" }}
          >
            ELOOP TOKEN
          </div>
          {subtitle && (
            <div
              className="mt-1 text-[10px] tracking-wider"
              style={{ color: "#7A9E7A" }}
            >
              Compliance Infrastructure · ELP
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Compact filled green square mark used in headers/navbar.
export function EloopMark({ size = 20 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-md"
      style={{ width: size, height: size, background: "#1DB954" }}
      aria-label="Eloop"
    >
      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          stroke="#0A0F0A"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <g>
            <path d="M50 26 A24 24 0 0 1 70.8 38" />
            <path d="M64 33 L71.5 38.5 L65.7 45.5" />
          </g>
          <g transform="rotate(120 50 50)">
            <path d="M50 26 A24 24 0 0 1 70.8 38" />
            <path d="M64 33 L71.5 38.5 L65.7 45.5" />
          </g>
          <g transform="rotate(240 50 50)">
            <path d="M50 26 A24 24 0 0 1 70.8 38" />
            <path d="M64 33 L71.5 38.5 L65.7 45.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}
