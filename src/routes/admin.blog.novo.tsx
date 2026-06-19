import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/blog/novo")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/blog/$id", params: { id: "novo" } });
  },
});
