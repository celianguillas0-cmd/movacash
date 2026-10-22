"use client";
export default function LogoutButton() {
  return (
    <button
      className="text-xs text-slate-500 underline"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      Se déconnecter
    </button>
  );
}
