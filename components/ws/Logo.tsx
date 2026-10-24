import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/app" className="text-xl font-extrabold tracking-tight text-slate-900">
      Mova<span className="text-brand-600">cash</span>
    </Link>
  );
}
