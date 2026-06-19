import { useEffect, useRef } from "react";

const CLIENT_ID = (import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined) ?? "";

type Props = {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle";
  label?: string;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ slot, format = "auto", label, className }: Props) {
  const ref = useRef<HTMLModElement>(null);
  const enabled = Boolean(CLIENT_ID && slot);

  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* noop */
    }
  }, [enabled]);

  if (!enabled) {
    return (
      <div
        className={`flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-border bg-surface/40 px-4 py-6 text-center ${className ?? ""}`}
      >
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Espaço publicitário
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {label ?? "Slot reservado para Google AdSense"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
