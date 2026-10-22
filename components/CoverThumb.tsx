type Cover = { style: string; color: string; accent: string };

function isLight(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 160;
}

// Aperçu HTML de la couverture (le rendu final est fait dans le PDF)
export default function CoverThumb({ title, subtitle, author, cover, large }: { title: string; subtitle?: string; author?: string; cover: Cover; large?: boolean }) {
  const fg = isLight(cover.color) ? "#1f2328" : "#fff";
  const base = `relative aspect-[1/1.414] w-full overflow-hidden rounded-md shadow ${large ? "p-8" : "p-4"}`;
  if (cover.style === "bold")
    return (
      <div className={base} style={{ background: cover.color, color: fg }}>
        <p className={`font-black uppercase leading-tight ${large ? "text-3xl" : "text-sm"}`}>{title}</p>
        <div className="absolute inset-x-0 bottom-0 h-[32%] p-4" style={{ background: cover.accent, color: isLight(cover.accent) ? "#111" : "#fff" }}>
          {subtitle && <p className={large ? "text-base font-semibold" : "text-[9px]"}>{subtitle}</p>}
          {author && large && <p className="mt-2 text-sm">{author}</p>}
        </div>
      </div>
    );
  if (cover.style === "elegant")
    return (
      <div className={`${base} flex flex-col items-center justify-center text-center`} style={{ background: cover.color, color: fg }}>
        <div className="absolute inset-2 border" style={{ borderColor: cover.accent }} />
        <p className={`font-serif font-bold leading-tight ${large ? "text-3xl" : "text-sm"}`}>{title}</p>
        <div className="my-2 h-px w-10" style={{ background: cover.accent }} />
        {subtitle && <p className={`font-serif italic ${large ? "text-base" : "text-[9px]"}`}>{subtitle}</p>}
        {author && large && <p className="absolute bottom-10 font-serif text-sm">{author}</p>}
      </div>
    );
  return (
    <div className={base} style={{ background: cover.color, color: fg }}>
      <div className="absolute -right-10 -top-10 h-2/3 w-2/3 rounded-full opacity-25" style={{ background: cover.accent }} />
      <div className="relative mt-[35%]">
        <p className={`font-bold leading-tight ${large ? "text-3xl" : "text-sm"}`}>{title}</p>
        <div className="my-2 h-1 w-8" style={{ background: cover.accent }} />
        {subtitle && <p className={`opacity-90 ${large ? "text-base" : "text-[9px]"}`}>{subtitle}</p>}
      </div>
      {author && large && <p className="absolute bottom-8 text-sm font-semibold">{author}</p>}
    </div>
  );
}
