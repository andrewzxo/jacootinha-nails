import { db } from "@/lib/db";
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  if (action === "register") {
    const { name, email, password } = body as { name?: string; email?: string; password?: string };
    if (!name?.trim() || !email?.includes("@") || !password || password.length < 4) {
      return Response.json({ error: "Preencha nome, e-mail válido e senha (mín. 4 caracteres)." }, { status: 400 });
    }
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      return Response.json({ error: "Este e-mail já está cadastrado. Faça login." }, { status: 409 });
    }
    const user = await db.user.create({
      data: { name: name.trim(), email, passwordHash: hashPassword(password), role: "CLIENT" },
    });
    await setSessionCookie({ userId: user.id, role: "client", name: user.name, email: user.email });
    return Response.json({ role: "client", name: user.name, email: user.email });
  }

  if (action === "login") {
    const { email, password } = body as { email?: string; password?: string };
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password ?? "", user.passwordHash)) {
      return Response.json({ error: "Credenciais inválidas. Verifique seu e-mail e senha." }, { status: 401 });
    }
    const role = user.role === "ADMIN" ? "admin" : "client";
    await setSessionCookie({ userId: user.id, role, name: user.name, email: user.email });
    return Response.json({ role, name: user.name, email: user.email });
  }

  if (action === "logout") {
    await clearSessionCookie();
    return Response.json({ ok: true });
  }

  if (action === "visitor") {
    await setSessionCookie({ role: "visitor", name: "Visitante" });
    return Response.json({ role: "visitor", name: "Visitante" });
  }

  return Response.json({ error: "Ação desconhecida." }, { status: 404 });
}

export async function GET(_req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  if (action === "me") {
    const session = await getSession();
    if (!session) return Response.json(null);
    return Response.json({ role: session.role, name: session.name, email: session.email });
  }
  return Response.json({ error: "Ação desconhecida." }, { status: 404 });
}
