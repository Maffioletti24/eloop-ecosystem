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
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Eloop Token"
        role="img"
      >
        {/* Outer ring */}
        <circle cx="50" cy="50" r="38" stroke="#1DB954" strokeWidth="3" />
        {/* Inner disc */}
        <circle cx="50" cy="50" r="30" fill="#162016" />

        {/* Recycling arrows — 3 curved arms rotated 120° */}
        <g stroke="#1DB954" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <g>
            <path d="M50 28 A22 22 0 0 1 69.05 39" />
            <path d="M64 35 L69.5 39.2 L65.3 44.7" />
          </g>
          <g transform="rotate(120 50 50)">
            <path d="M50 28 A22 22 0 0 1 69.05 39" />
            <path d="M64 35 L69.5 39.2 L65.3 44.7" />
          </g>
          <g transform="rotate(240 50 50)">
            <path d="M50 28 A22 22 0 0 1 69.05 39" />
            <path d="M64 35 L69.5 39.2 L65.3 44.7" />
          </g>
        </g>

        {/* Circuit dots at arrow tails */}
        <g fill="#1DB954">
          <circle cx="50" cy="28" r="2.4" />
          <circle cx="30.9" cy="61" r="2.4" />
          <circle cx="69.1" cy="61" r="2.4" />
          {/* center pulse */}
          <circle cx="50" cy="50" r="2.6" />
        </g>
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
