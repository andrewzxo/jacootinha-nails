import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import sharp from "sharp";
import { db } from "@/lib/db";

const MAX_INPUT_BYTES = 8 * 1024 * 1024; // 8MB limite de entrada

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const fd = await req.formData();
    file = fd.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "O arquivo deve ser uma imagem." }, { status: 400 });
  }
  if (file.size > MAX_INPUT_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 8MB)." }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const webp = await sharp(buffer)
      .rotate() // respeita orientação EXIF
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const upload = await db.upload.create({
      data: { mime: "image/webp", data: webp.toString("base64") },
    });

    return NextResponse.json({ url: `/api/uploads/${upload.id}` });
  } catch (err) {
    console.error("upload error:", err);
    return NextResponse.json({ error: "Não foi possível processar a imagem." }, { status: 500 });
  }
}
