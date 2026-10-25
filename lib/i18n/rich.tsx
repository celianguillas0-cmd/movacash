import { Fragment } from "react";

// Texte traduit avec balises numérotées : rich("Va dans <1>Mon idée</1>.", { 1: (s) => <Link href="/app">{s}</Link> }).
// Les balises restent dans la phrase pour que le traducteur puisse les déplacer.
export function rich(text: string, tags: Record<number, (inner: string) => React.ReactNode>): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /<(\d+)>(.*?)<\/\1>/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const fn = tags[Number(m[1])];
    parts.push(<Fragment key={k++}>{fn ? fn(m[2]) : m[2]}</Fragment>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
