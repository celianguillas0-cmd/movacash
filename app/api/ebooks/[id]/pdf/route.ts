import { fail, withUser } from "@/lib/api";
import { getEbook } from "@/lib/ebooks";
import { renderEbookPdf, type PageSize } from "@/lib/pdf";
import { slugify } from "@/lib/ideas-seed";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    const data = await getEbook(Number(id), user.id);
    if (!data) return fail("Introuvable", 404);
    if (data.chapters.some((c) => !c.content_md)) return fail("Tous les chapitres doivent être générés avant l'export", 409);
    const sizeParam = new URL(req.url).searchParams.get("size")?.toUpperCase();
    const size: PageSize = sizeParam === "A5" || sizeParam === "LETTER" ? sizeParam : "A4";
    const pdf = await renderEbookPdf(data.ebook, data.chapters, size);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slugify(data.ebook.title) || "ebook"}-${size.toLowerCase()}.pdf"`,
      },
    });
  });
}
