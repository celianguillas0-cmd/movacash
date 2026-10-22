import EbookEditor from "./EbookEditor";

export default async function EbookPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ autostart?: string }> }) {
  const { id } = await params;
  const { autostart } = await searchParams;
  return <EbookEditor id={Number(id)} autostart={autostart === "1"} />;
}
