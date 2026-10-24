"use client";
import { useEffect, useRef } from "react";
import { mountFunnel, type FunnelPlan } from "@/lib/funnel/engine";

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export default function Funnel({ categories, plans, user, demo }: { categories: { slug: string; name: string }[]; plans: FunnelPlan[]; user: { name?: string } | null; demo: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const f = mountFunnel({
      root: ref.current,
      categories,
      plans,
      user,
      demo,
      api: {
        async signup({ name, email, password, answers }) {
          const r = await post("/api/auth/signup", { name, email, password, acceptTerms: true, quiz: { answers } });
          return { ok: r.ok, error: r.data.error };
        },
        async saveQuiz(answers) {
          const r = await post("/api/quiz", { answers });
          try {
            if (r.data.quiz) localStorage.setItem("mc_quiz", JSON.stringify(r.data.quiz));
          } catch {}
        },
        async checkout(plan) {
          const r = await post("/api/billing/checkout", { plan, annual: false, waiver: true });
          return r.ok ? { url: r.data.url } : { error: r.data.error };
        },
      },
    });
    return () => f.destroy();
    // Le sondage se monte une seule fois ; les données viennent du serveur au premier rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="tf-root" />;
}
