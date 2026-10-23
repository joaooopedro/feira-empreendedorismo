"use client";

import Link from "next/link";
import { IconeFechar } from "./IconeFechar";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useColecao } from "@/lib/useColecao";
import { ordenar } from "@/lib/bancas";
import { numero } from "@/lib/calculo";
import type { Banca } from "@/lib/tipos";

type Linha = { nome: string; preco: string; esgotado: boolean };
const campo = "min-h-12 w-full rounded-campo border border-linha bg-fundo px-3";

export default function Cadastro({ inicial }: { inicial: Banca[] }) {
  const { itens } = useColecao<Banca>("bancas", inicial);
  const bancas = useMemo(() => ordenar(itens), [itens]);
  const [id, setId] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [pagamento, setPagamento] = useState("");
  const [instagram, setInstagram] = useState("");
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  function escolher(novo: string) {
    setId(novo);
    setAviso(null);
    const b = bancas.find((x) => x.id === novo);
    if (!b) return;
    setLinhas(b.produtos.length ? b.produtos.map((p) => ({ ...p, preco: String(p.preco).replace(".", ",") })) : [{ nome: "", preco: "", esgotado: false }]);
    setPagamento(b.pagamento);
    setInstagram(b.instagram);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const produtos = linhas.filter((l) => l.nome.trim()).map((l) => ({ nome: l.nome.trim(), preco: numero(l.preco), esgotado: l.esgotado }));
    if (linhas.some((l) => l.nome.trim() && !(numero(l.preco) > 0)))
      return setAviso({ ok: false, texto: "Confira os preços: use números, como 6,50." });
    try {
      await updateDoc(doc(db, "bancas", id), { produtos, pagamento: pagamento.trim(), instagram: instagram.trim() });
      setAviso({ ok: true, texto: "Cardápio salvo. Já aparece no guia." });
    } catch {
      setAviso({ ok: false, texto: "Não foi possível salvar. Tente de novo." });
    }
  }

  const mudar = (i: number, parte: Partial<Linha>) => setLinhas(linhas.map((l, j) => (j === i ? { ...l, ...parte } : l)));

  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-10">
      <Link href="/" className="text-tinta-fraca hover:text-tinta">← Guia da feira</Link>
      <h1 className="mt-4 text-[clamp(2rem,6vw,3.2rem)] font-bold tracking-[-0.02em]">Cardápio da sua banca</h1>
      <p className="mt-1 text-tinta-fraca">Para os grupos de Gestão. O que você salvar aparece na hora no guia e no mapa.</p>

      <form onSubmit={salvar} className="mt-8 rounded-cartao bg-superficie p-5">
        <label htmlFor="banca" className="mb-1 block font-bold">Sua banca</label>
        <select id="banca" className={campo} value={id} onChange={(e) => escolher(e.target.value)}>
          <option value="">Escolha</option>
          {bancas.map((b) => <option key={b.id} value={b.id}>{b.numero}. {b.nome}</option>)}
        </select>

        <AnimatePresence>
          {id && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <h2 className="mt-8 text-xl font-bold">Produtos</h2>
              <ul className="mt-3 flex flex-col gap-3">
                {linhas.map((l, i) => (
                  <li key={i} className="grid grid-cols-[1fr_96px_auto_auto] items-center gap-2">
                    <input aria-label="Produto" placeholder="Produto" className={campo} value={l.nome} onChange={(e) => mudar(i, { nome: e.target.value })} />
                    <input aria-label="Preço" placeholder="R$" inputMode="decimal" className={campo} value={l.preco} onChange={(e) => mudar(i, { preco: e.target.value })} />
                    <label className="flex items-center gap-1 text-sm text-tinta-fraca">
                      <input type="checkbox" className="size-5 accent-tinta" checked={l.esgotado} onChange={(e) => mudar(i, { esgotado: e.target.checked })} />
                      esgotado
                    </label>
                    <button type="button" aria-label="Remover produto" className="grid size-10 place-items-center rounded-cartao text-tinta-fraca hover:bg-superficie-alta" onClick={() => setLinhas(linhas.filter((_, j) => j !== i))}><IconeFechar /></button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setLinhas([...linhas, { nome: "", preco: "", esgotado: false }])} className="mt-3 min-h-12 rounded-campo bg-superficie-alta px-4 font-bold">
                Adicionar produto
              </button>

              <label htmlFor="pagamento" className="mb-1 mt-6 block font-bold">Formas de pagamento</label>
              <input id="pagamento" className={campo} placeholder="Pix, dinheiro e cartão" value={pagamento} onChange={(e) => setPagamento(e.target.value)} />
              <label htmlFor="instagram" className="mb-1 mt-4 block font-bold">Instagram</label>
              <input id="instagram" className={campo} placeholder="@suabanca" value={instagram} onChange={(e) => setInstagram(e.target.value)} />

              <button className="mt-6 min-h-12 w-full rounded-campo bg-tinta font-bold text-fundo">Salvar cardápio</button>
            </motion.div>
          )}
        </AnimatePresence>
        <p role="status" className={`mt-3 min-h-6 font-bold ${aviso?.ok ? "text-ok" : "text-erro"}`}>{aviso?.texto}</p>
      </form>
    </main>
  );
}
