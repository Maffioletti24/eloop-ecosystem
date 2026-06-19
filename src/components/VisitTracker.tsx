import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { trackSiteVisit } from "@/lib/analytics.functions";

export function VisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const track = useServerFn(trackSiteVisit);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    track({
      data: {
        path: pathname,
        referrer: document.referrer || null,
      },
    }).catch(() => undefined);
  }, [pathname, track]);

  return null;
}
