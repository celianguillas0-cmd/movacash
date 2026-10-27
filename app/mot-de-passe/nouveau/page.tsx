import FunnelNav from "@/components/funnel/FunnelNav";
import { ResetForm } from "@/components/PasswordForms";

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <div className="mc dark has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <ResetForm token={token || ""} />
    </div>
  );
}
