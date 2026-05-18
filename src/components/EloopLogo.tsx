import logoUrl from "@/assets/eloop-logo.png";

export function EloopLogo({
  size = 64,
  showWordmark = true,
  className = "",
}: {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <img
      src={logoUrl}
      alt="Eloop"
      width={size}
      height={showWordmark ? size : size}
      style={{
        width: size,
        height: "auto",
        objectFit: "contain",
        // crop wordmark off when not desired by clipping aspect
      }}
      className={className}
    />
  );
}
