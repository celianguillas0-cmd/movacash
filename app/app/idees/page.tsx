import { redirect } from "next/navigation";

// L'ancienne page « Idées » est remplacée par « Trouver mon idée ».
export default async function Idees({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  redirect(q ? `/app?q=${encodeURIComponent(q)}` : "/app");
}
