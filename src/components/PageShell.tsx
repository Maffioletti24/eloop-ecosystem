import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { EloopMark } from "./EloopLogo";

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
        className="sticky top-0 z-30 grid grid-cols-[2rem_1.75rem_1fr] items-center gap-3 px-4 pt-5 pb-3"
        style={{ background: "#0A0F0A" }}
      >
        <div className="flex items-center justify-start">
          {showBack ? (
            <Link
              to="/dashboard"
              aria-label="Voltar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{ color: "#E8F5E8" }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : null}
        </div>
        <EloopMark size={24} />
        <h1 className="text-base font-bold leading-tight truncate min-w-0">
          {title}
        </h1>
      </header>
      <main className="px-5">{children}</main>
      <BottomNav />
    </div>
  );
}
