import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ backgroundColor: "#0A0F0A" }}>
      <div className="w-full" style={{ maxWidth: "390px" }}>
        <h1 className="text-3xl font-bold" style={{ color: "#1DB954" }}>
          Dashboard ELP
        </h1>
      </div>
    </div>
  );
}
