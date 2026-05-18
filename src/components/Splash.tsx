import { EloopLogo } from "./EloopLogo";

export function Splash() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "#0A0F0A" }}
    >
      <EloopLogo size={96} withText subtitle />
    </div>
  );
}
