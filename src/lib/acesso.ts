import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Senhas por banca na variável SENHAS_BANCAS: {"moki":"abc123", ...}. Fora do repositório, que é público.
const senhas: Record<string, string> = JSON.parse(process.env.SENHAS_BANCAS ?? "{}");
const segredo = process.env.SEGREDO_SESSAO ?? "";
const COOKIE = "banca";

const assinar = (id: string) => createHmac("sha256", segredo).update(id).digest("base64url");

function iguais(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function senhaConfere(banca: string, senha: string) {
  return Boolean(senhas[banca]) && iguais(senhas[banca], senha.trim().toLowerCase());
}

export async function abrirSessao(banca: string) {
  (await cookies()).set(COOKIE, `${banca}.${assinar(banca)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function fecharSessao() {
  (await cookies()).delete(COOKIE);
}

export async function bancaLogada(): Promise<string | null> {
  const valor = (await cookies()).get(COOKIE)?.value ?? "";
  const i = valor.lastIndexOf(".");
  if (i < 1 || !segredo) return null;
  const id = valor.slice(0, i);
  return iguais(valor.slice(i + 1), assinar(id)) ? id : null;
}
