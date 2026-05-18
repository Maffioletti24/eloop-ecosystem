import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const message =
    (error && (error.message || String(error))) || "Erro desconhecido";
  const stack = error?.stack;

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: "#0A0F0A", color: "#E8F5E8" }}
    >
      <div className="mx-auto max-w-2xl">
        <div
          className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{ background: "#3a1414", color: "#ff8a8a" }}
        >
          Erro de renderização
        </div>
        <h1 className="mt-4 text-2xl font-bold">A página não carregou</h1>
        <p className="mt-1 text-sm" style={{ color: "#9bb09b" }}>
          Mensagem capturada pelo Error Boundary do root:
        </p>

        <pre
          className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl border p-4 text-xs"
          style={{
            background: "#0F1A0F",
            borderColor: "#3a1414",
            color: "#ffb4b4",
          }}
        >
          {message}
        </pre>

        {stack ? (
          <details className="mt-3">
            <summary
              className="cursor-pointer text-xs font-medium"
              style={{ color: "#9bb09b" }}
            >
              Ver stack trace
            </summary>
            <pre
              className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border p-4 text-[11px] leading-relaxed"
              style={{
                background: "#0F1A0F",
                borderColor: "#1f2a1f",
                color: "#9bb09b",
              }}
            >
              {stack}
            </pre>
          </details>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md px-4 py-2 text-sm font-semibold"
            style={{ background: "#1DB954", color: "#0A0F0A" }}
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="rounded-md border px-4 py-2 text-sm font-medium"
            style={{ borderColor: "#1f2a1f", color: "#E8F5E8" }}
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}
