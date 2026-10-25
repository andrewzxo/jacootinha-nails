import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const SECRET = "studio-bella-unhas-secret-2026";
const COOKIE_NAME = "bella_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  userId?: string;
  role: "admin" | "client" | "visitor";
  name: string;
  email?: string;
  iat: number;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function sign(payloadB64: string): string {
  return createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
}

export function createToken(payload: Omit<SessionPayload, "iat">): string {
  const body: SessionPayload = { ...payload, iat: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function parseToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as SessionPayload;
    if (Date.now() - payload.iat > MAX_AGE * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return parseToken(store.get(COOKIE_NAME)?.value);
}

export async function setSessionCookie(payload: Omit<SessionPayload, "iat">) {
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const s = await getSession();
  return s?.role === "admin";
}

export function unauthorized() {
  return Response.json({ error: "Acesso restrito à administradora." }, { status: 401 });
}
