"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar } from "@/app/acoes";
import type { Banca } from "@/lib/tipos";

const campo = "min-h-12 w-full rounded-campo border border-linha bg-fundo px-3";

export default function Entrar({ bancas, fixa, voltar }: { bancas: Banca[]; fixa?: string; voltar: string }) {
  const [resposta, enviar, enviando] = useActionState(entrar, null);
  const nomeFixo = bancas.find((b) => b.id === fixa)?.nome;

  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-10">
      <Link href="/" className="text-tinta-fraca hover:text-tinta">← Guia da feira</Link>
      <h1 className="mt-4 text-[clamp(2rem,6vw,3rem)] font-bold tracking-[-0.02em]">{nomeFixo ? `Entrar na ${nomeFixo}` : "Entrar na sua banca"}</h1>
      <p className="mt-1 text-tinta-fraca">Cada grupo tem uma senha. Peça ao grupo UniRide se não tiver a sua.</p>

      <form action={enviar} className="mt-8 rounded-cartao bg-superficie p-5">
        <input type="hidden" name="voltar" value={voltar} />
        {fixa ? (
          <input type="hidden" name="banca" value={fixa} />
        ) : (
          <>
            <label htmlFor="banca" className="mb-1 block font-bold">Sua banca</label>
            <select id="banca" name="banca" required className={campo} defaultValue="">
              <option value="" disabled>Escolha</option>
              {bancas.map((b) => <option key={b.id} value={b.id}>{b.numero}. {b.nome}</option>)}
            </select>
          </>
        )}
        <label htmlFor="senha" className="mb-1 mt-4 block font-bold">Senha</label>
        <input id="senha" name="senha" required autoComplete="current-password" autoCapitalize="none" className={campo} type="password" />
        <button disabled={enviando} className="mt-6 min-h-12 w-full rounded-campo bg-tinta font-bold text-fundo disabled:opacity-60">
          {enviando ? "Entrando..." : "Entrar"}
        </button>
        <p role="status" className="mt-3 min-h-6 font-bold text-erro">{resposta?.texto}</p>
      </form>
    </main>
  );
}
