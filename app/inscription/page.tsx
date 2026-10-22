import FunnelNav from "@/components/funnel/FunnelNav";
import AuthForm from "@/components/AuthForm";

export default function Page() {
  return (
    <div className="mc">
      <FunnelNav />
      <AuthForm mode="signup" />
    </div>
  );
}
