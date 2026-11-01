import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const upload = await db.upload.findUnique({ where: { id } });
  if (!upload) {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  }

  const bytes = Buffer.from(upload.data, "base64");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": upload.mime,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
