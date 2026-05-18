import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  if (typeof console !== "undefined") console.error(error);
  const message = (error && (error.message || String(error))) || "Erro desconhecido";
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
          Erro
        </div>
        <h1 className="mt-4 text-2xl font-bold">Algo deu errado</h1>
        <pre
          className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl border p-4 text-xs"
          style={{ background: "#0F1A0F", borderColor: "#3a1414", color: "#ffb4b4" }}
        >
          {message}
        </pre>
        {error?.stack ? (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs" style={{ color: "#9bb09b" }}>
              Ver stack trace
            </summary>
            <pre
              className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border p-4 text-[11px]"
              style={{ background: "#0F1A0F", borderColor: "#1f2a1f", color: "#9bb09b" }}
            >
              {error.stack}
            </pre>
          </details>
        ) : null}
        <button
          onClick={reset}
          className="mt-6 rounded-md px-4 py-2 text-sm font-semibold"
          style={{ background: "#1DB954", color: "#0A0F0A" }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
