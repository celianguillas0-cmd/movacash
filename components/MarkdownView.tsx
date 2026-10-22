import { parseMarkdown, type Span } from "@/lib/markdown";

function Spans({ spans }: { spans: Span[] }) {
  return (
    <>
      {spans.map((s, i) => (s.bold ? <strong key={i}>{s.text}</strong> : s.italic ? <em key={i}>{s.text}</em> : <span key={i}>{s.text}</span>))}
    </>
  );
}

export default function MarkdownView({ md }: { md: string }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-800">
      {parseMarkdown(md).map((b, i) => {
        switch (b.type) {
          case "h2":
            return <h3 key={i} className="pt-3 text-lg font-bold text-brand-700"><Spans spans={b.spans} /></h3>;
          case "h3":
            return <h4 key={i} className="pt-2 font-semibold"><Spans spans={b.spans} /></h4>;
          case "p":
            return <p key={i}><Spans spans={b.spans} /></p>;
          case "quote":
            return <blockquote key={i} className="rounded-r-lg border-l-4 border-brand-500 bg-brand-50 p-3"><Spans spans={b.spans} /></blockquote>;
          case "ol":
            return <ol key={i} className="list-decimal space-y-1 pl-6">{b.items.map((it, j) => <li key={j}><Spans spans={it} /></li>)}</ol>;
          case "check":
            return <ul key={i} className="space-y-1">{b.items.map((it, j) => <li key={j}>☐ <Spans spans={it} /></li>)}</ul>;
          default:
            return <ul key={i} className="list-disc space-y-1 pl-6">{b.items.map((it, j) => <li key={j}><Spans spans={it} /></li>)}</ul>;
        }
      })}
    </div>
  );
}
