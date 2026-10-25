import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return Response.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return Response.json({ error: "Envie apenas imagens (PNG, JPG, WEBP, GIF, SVG, AVIF)." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "Imagem muito grande. Limite de 5MB." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(path.join(dir, filename), buffer);
    return Response.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch {
    return Response.json({ error: "Falha no upload. Tente novamente." }, { status: 500 });
  }
}
