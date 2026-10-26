import Link from "next/link";
import { GOOGLE_G } from "@/lib/googleLogo";


export default function GoogleButton({ next, label }: { next: string; label: string }) {
  return (
    <Link href={`/api/auth/google?next=${encodeURIComponent(next)}`} prefetch={false} className="btn-google">
      <span dangerouslySetInnerHTML={{ __html: GOOGLE_G }} />
      {label}
    </Link>
  );
}
