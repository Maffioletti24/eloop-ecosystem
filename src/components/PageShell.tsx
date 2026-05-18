import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "./BottomNav";

export function PageShell({
  title,
  children,
  showBack = true,
}: {
  title: string;
  children: ReactNode;
  showBack?: boolean;
}) {
  return (
    <div
      className="min-h-screen mx-auto max-w-[390px] pb-24"
      style={{ background: "#0A0F0A", color: "#E8F5E8" }}
    >
      <header
        className="flex items-center gap-3 px-5 pt-6 pb-4 sticky top-0 z-30"
        style={{ background: "#0A0F0A" }}
      >
        {showBack && (
          <Link to="/dashboard" className="-ml-2 p-2" style={{ color: "#E8F5E8" }}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <h1 className="text-lg font-bold">{title}</h1>
      </header>
      <main className="px-5">{children}</main>
      <BottomNav />
    </div>
  );
}
