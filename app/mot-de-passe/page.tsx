import FunnelNav from "@/components/funnel/FunnelNav";
import { ForgotForm } from "@/components/PasswordForms";

export default function Page() {
  return (
    <div className="mc dark has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <ForgotForm />
    </div>
  );
}
