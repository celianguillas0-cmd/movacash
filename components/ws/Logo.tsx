import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/app" className="font-display text-2xl uppercase tracking-wide text-slate-900">
      Mova<span className="glacier-text">cash</span>
    </Link>
  );
}
