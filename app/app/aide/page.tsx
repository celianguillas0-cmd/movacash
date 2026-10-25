import { redirect } from "next/navigation";

// L'aide est maintenant dans Support
export default function Help() {
  redirect("/app/support");
}
