import FunnelNav from "@/components/funnel/FunnelNav";
import AuthForm from "@/components/AuthForm";

export default function Page() {
  return (
    <div className="mc has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <AuthForm mode="login" />
    </div>
  );
}
