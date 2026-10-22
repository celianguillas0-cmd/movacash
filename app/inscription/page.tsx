import PublicNav from "@/components/PublicNav";
import AuthForm from "@/components/AuthForm";

export default function Page() {
  return (
    <>
      <PublicNav />
      <main className="px-4"><AuthForm mode="signup" /></main>
    </>
  );
}
