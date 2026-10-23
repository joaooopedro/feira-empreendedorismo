"use client";

import Link from "next/link";
import { IconeFechar } from "./IconeFechar";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { sair, salvarCardapio } from "@/app/acoes";
import { useColecao } from "@/lib/useColecao";
import { ordenar } from "@/lib/bancas";
import { numero } from "@/lib/calculo";
import type { Banca } from "@/lib/tipos";

type Linha = { nome: string; preco: string; esgotado: boolean };
const campo = "min-h-12 w-full rounded-campo border border-linha bg-fundo px-3";

export default function Cadastro({ inicial, banca }: { inicial: Banca[]; banca: string }) {
  const { itens } = useColecao<Banca>("bancas", inicial);
  const bancas = useMemo(() => ordenar(itens), [itens]);
  const [id, setId] = useState("");
  const minha = bancas.find((b) => b.id === banca);
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

  // Abre já com o cardápio da banca logada.
  useEffect(() => {
    if (!id && minha) escolher(minha.id);
  }, [minha]); // eslint-disable-line react-hooks/exhaustive-deps -- escolher só roda na primeira carga

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const produtos = linhas.filter((l) => l.nome.trim()).map((l) => ({ nome: l.nome.trim(), preco: numero(l.preco), esgotado: l.esgotado }));
    if (linhas.some((l) => l.nome.trim() && !(numero(l.preco) > 0)))
      return setAviso({ ok: false, texto: "Confira os preços: use números, como 6,50." });
    try {
      setAviso(await salvarCardapio(produtos, pagamento, instagram));
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
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xl font-bold">{minha ? `${minha.numero}. ${minha.nome}` : "Carregando..."}</p>
          <button type="button" onClick={() => sair()} className="text-sm text-tinta-fraca underline underline-offset-4 hover:text-tinta">Sair</button>
        </div>

        <AnimatePresence>
          {id && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <h2 className="mt-6 text-xl font-bold">Produtos</h2>
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
