"use client";
import { useT } from "@/lib/i18n/client";

export default function LogoutButton({ className = "text-xs text-slate-500 underline hover:text-slate-800" }: { className?: string }) {
  const t = useT();
  return (
    <button
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      {t("Se déconnecter")}
    </button>
  );
}
