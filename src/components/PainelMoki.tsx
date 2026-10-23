"use client";

import Link from "next/link";
import { IconeFechar } from "./IconeFechar";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { addDoc, collection, doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useColecao } from "@/lib/useColecao";
import { numero, planejar, reais, restam } from "@/lib/calculo";
import type { Ficha, Ingrediente, Sabor } from "@/lib/tipos";

const saida = [0.22, 1, 0.36, 1] as const;
const campo = "min-h-12 w-full rounded-campo border border-linha bg-fundo px-3";
const campoTabela = "min-h-10 w-full rounded-cartao border border-linha bg-fundo px-2";

const fichaVazia: Ficha = { ingredientes: [], rendimento: "", embalagem: "", margem: "", meta: "", peso: "", forno: "" };
const ingredienteVazio: Ingrediente = { nome: "", preco: "", pacote: "", unidade: "g", uso: "" };

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.strong
          key={valor}
          className="block font-display text-3xl font-bold tabular-nums text-destaque"
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 14, opacity: 0 }}
          transition={{ duration: 0.35, ease: saida }}
        >
          {valor}
        </motion.strong>
      </AnimatePresence>
      <span className="text-tinta-fraca">{rotulo}</span>
    </div>
  );
}

function BancaAoVivo() {
  const { itens, erro } = useColecao<Sabor>("mokiSabores");
  const sabores = useMemo(() => [...itens].sort((a, b) => a.nome.localeCompare(b.nome)), [itens]);
  const ultimoCardapio = useRef("");

  // Mantém o cardápio da MOKI no guia da feira igual ao estoque real.
  useEffect(() => {
    if (!sabores.length) return;
    const produtos = sabores.map((s) => ({ nome: s.nome, preco: s.preco, esgotado: restam(s) === 0 }));
    const json = JSON.stringify(produtos);
    if (json === ultimoCardapio.current) return;
    ultimoCardapio.current = json;
    updateDoc(doc(db, "bancas", "moki"), { produtos }).catch(() => {});
  }, [sabores]);

  const vendidos = sabores.reduce((t, s) => t + s.vendidos, 0);
  const faturado = sabores.reduce((t, s) => t + s.vendidos * s.preco, 0);
  const sobram = sabores.reduce((t, s) => t + restam(s), 0);

  const [novo, setNovo] = useState({ nome: "", preco: "", produzidos: "" });
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    const preco = numero(novo.preco);
    const produzidos = Math.round(numero(novo.produzidos));
    if (!novo.nome.trim() || preco <= 0 || produzidos <= 0)
      return setAviso({ ok: false, texto: "Preencha sabor, preço e quantidade com números maiores que zero." });
    await addDoc(collection(db, "mokiSabores"), { nome: novo.nome.trim(), preco, produzidos, vendidos: 0 });
    setNovo({ nome: "", preco: "", produzidos: "" });
    setAviso({ ok: true, texto: "Sabor adicionado." });
  }

  return (
    <section id="banca" aria-labelledby="titulo-banca" className="scroll-mt-20">
      <h2 id="titulo-banca" className="text-3xl font-bold">Banca ao vivo</h2>
      <p className="mt-1 max-w-[60ch] text-tinta-fraca">
        Cada venda marcada aqui aparece na hora em todos os celulares do grupo e no guia da feira. Quando um sabor acaba, o guia mostra esgotado.
      </p>
      {erro && <p className="mt-3 font-bold text-erro">Sem conexão com o banco.</p>}

      <div className="mt-6 flex flex-wrap gap-x-12 gap-y-4 rounded-cartao bg-superficie p-5">
        <Numero valor={String(vendidos)} rotulo="cookies vendidos" />
        <Numero valor={reais(faturado)} rotulo="faturado" />
        <Numero valor={String(sobram)} rotulo="restam na banca" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sabores.map((s) => {
          const r = restam(s);
          const parte = s.produzidos ? s.vendidos / s.produzidos : 0;
          return (
            <motion.article layout key={s.id} className="flex flex-col gap-3 rounded-cartao bg-superficie p-5" transition={{ duration: 0.4, ease: saida }}>
              <h3 className="text-lg font-bold">{s.nome}</h3>
              <span className="text-tinta-fraca">
                {reais(s.preco)} · {s.vendidos} de {s.produzidos} vendidos
              </span>
              <span className={`font-display text-5xl font-bold tabular-nums ${r === 0 ? "text-erro" : "text-destaque"}`}>
                {r === 0 ? "Esgotou" : r}
                {r > 0 && <span className="ml-2 text-base font-bold text-tinta-fraca">restam</span>}
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-superficie-alta" aria-hidden>
                <motion.span
                  className="block h-full rounded-full bg-marca"
                  animate={{ width: `${parte * 100}%` }}
                  transition={{ duration: 0.5, ease: saida }}
                />
              </span>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={r === 0}
                  onClick={() => updateDoc(doc(db, "mokiSabores", s.id), { vendidos: increment(1) })}
                  className="min-h-14 flex-[2] rounded-campo bg-tinta text-lg font-bold text-fundo disabled:opacity-40"
                >
                  Vendi 1
                </motion.button>
                <button
                  disabled={s.vendidos === 0}
                  onClick={() => updateDoc(doc(db, "mokiSabores", s.id), { vendidos: increment(-1) })}
                  className="min-h-14 flex-1 rounded-campo bg-superficie-alta font-bold disabled:opacity-40"
                  aria-label={`Desfazer última venda de ${s.nome}`}
                >
                  Desfazer
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      <form onSubmit={adicionar} className="mt-4 grid gap-3 rounded-cartao bg-superficie p-5 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="s-nome" className="mb-1 block font-bold">Novo sabor</label>
          <input id="s-nome" className={campo} value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
        </div>
        <div>
          <label htmlFor="s-preco" className="mb-1 block font-bold">Preço (R$)</label>
          <input id="s-preco" inputMode="decimal" className={campo} value={novo.preco} onChange={(e) => setNovo({ ...novo, preco: e.target.value })} />
        </div>
        <div>
          <label htmlFor="s-prod" className="mb-1 block font-bold">Produzidos</label>
          <input id="s-prod" inputMode="numeric" className={campo} value={novo.produzidos} onChange={(e) => setNovo({ ...novo, produzidos: e.target.value })} />
        </div>
        <button className="min-h-12 rounded-campo bg-tinta px-5 font-bold text-fundo">Adicionar</button>
        <p role="status" className={`min-h-6 font-bold sm:col-span-4 ${aviso?.ok ? "text-ok" : "text-erro"}`}>{aviso?.texto}</p>
      </form>
    </section>
  );
}

function Calculadora() {
  const ref = useMemo(() => doc(db, "mokiFicha", "receita"), []);
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  // Lê uma vez para não sobrescrever o que alguém está digitando.
  useEffect(() => {
    getDoc(ref)
      .then((s) => setFicha({ ...fichaVazia, ...(s.data() as Ficha | undefined) }))
      .catch(() => setFicha(fichaVazia));
  }, [ref]);

  const plano = useMemo(
    () =>
      ficha &&
      planejar(ficha.ingredientes, numero(ficha.rendimento), numero(ficha.embalagem), numero(ficha.margem), numero(ficha.meta)),
    [ficha],
  );

  if (!ficha || !plano) return <p className="mt-14 text-tinta-fraca">Carregando ficha...</p>;

  const mudar = (campoFicha: keyof Ficha, valor: string) => setFicha({ ...ficha, [campoFicha]: valor });
  const mudarIng = (i: number, campoIng: keyof Ingrediente, valor: string) =>
    setFicha({ ...ficha, ingredientes: ficha.ingredientes.map((x, j) => (j === i ? { ...x, [campoIng]: valor } : x)) });

  async function salvar() {
    try {
      await setDoc(ref, { ...ficha, ingredientes: ficha!.ingredientes.filter((i) => i.nome.trim()) });
      setAviso({ ok: true, texto: "Ficha salva para todo o grupo." });
    } catch {
      setAviso({ ok: false, texto: "Não foi possível salvar." });
    }
  }

  const entrada = (id: keyof Ficha, rotulo: string, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <div>
      <label htmlFor={id} className="mb-1 block font-bold">{rotulo}</label>
      <input id={id} className={campo} value={ficha[id] as string} onChange={(e) => mudar(id, e.target.value)} {...extra} />
    </div>
  );

  return (
    <section id="calculadora" aria-labelledby="titulo-calc" className="mt-16 scroll-mt-20">
      <h2 id="titulo-calc" className="text-3xl font-bold">Calculadora de insumos</h2>
      <p className="mt-1 max-w-[60ch] text-tinta-fraca">
        Uma receita base. Preencha o que foi comprado e quanto a receita usa: sai o custo de cada cookie, o preço mínimo e a lista de compras para a feira.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-cartao bg-superficie p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead className="text-sm text-tinta-fraca">
                <tr>
                  <th className="pb-2 font-bold">Ingrediente</th>
                  <th className="pb-2 font-bold">Preço pago</th>
                  <th className="pb-2 font-bold">No pacote</th>
                  <th className="pb-2 font-bold">Unid.</th>
                  <th className="pb-2 font-bold">Por receita</th>
                  <th className="pb-2"><span className="sr-only">Remover</span></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {ficha.ingredientes.map((ing, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-linha">
                      <td className="py-2 pr-2"><input aria-label="Ingrediente" className={campoTabela} value={ing.nome} onChange={(e) => mudarIng(i, "nome", e.target.value)} /></td>
                      <td className="py-2 pr-2"><input aria-label="Preço pago" inputMode="decimal" className={campoTabela} value={ing.preco} onChange={(e) => mudarIng(i, "preco", e.target.value)} /></td>
                      <td className="py-2 pr-2"><input aria-label="Quantidade no pacote" inputMode="decimal" className={campoTabela} value={ing.pacote} onChange={(e) => mudarIng(i, "pacote", e.target.value)} /></td>
                      <td className="py-2 pr-2">
                        <select aria-label="Unidade" className={`${campoTabela} min-w-16`} value={ing.unidade} onChange={(e) => mudarIng(i, "unidade", e.target.value)}>
                          <option>g</option><option>ml</option><option>un</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2"><input aria-label="Usa por receita" inputMode="decimal" className={campoTabela} value={ing.uso} onChange={(e) => mudarIng(i, "uso", e.target.value)} /></td>
                      <td className="py-2">
                        <button
                          aria-label={`Remover ${ing.nome || "ingrediente"}`}
                          onClick={() => setFicha({ ...ficha, ingredientes: ficha.ingredientes.filter((_, j) => j !== i) })}
                          className="grid size-10 place-items-center rounded-cartao text-tinta-fraca hover:bg-superficie-alta"
                        >
                          <IconeFechar />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setFicha({ ...ficha, ingredientes: [...ficha.ingredientes, { ...ingredienteVazio }] })}
            className="mt-3 min-h-12 rounded-campo bg-superficie-alta px-4 font-bold"
          >
            Adicionar ingrediente
          </button>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {entrada("rendimento", "Cookies por receita", { inputMode: "numeric" })}
            {entrada("embalagem", "Embalagem por cookie (R$)", { inputMode: "decimal" })}
            {entrada("margem", "Margem de lucro (%)", { inputMode: "numeric" })}
            {entrada("meta", "Cookies para a feira", { inputMode: "numeric" })}
          </div>

          <h3 className="mt-8 text-xl font-bold">Padrão de produção</h3>
          <p className="text-tinta-fraca">Para todo cookie sair do mesmo tamanho e textura.</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {entrada("peso", "Massa por cookie (g)", { inputMode: "numeric" })}
            {entrada("forno", "Forno", { placeholder: "180 °C por 12 minutos" })}
          </div>

          <button onClick={salvar} className="mt-6 min-h-12 rounded-campo bg-tinta px-6 font-bold text-fundo">Salvar ficha</button>
          <p role="status" className={`mt-2 min-h-6 font-bold ${aviso?.ok ? "text-ok" : "text-erro"}`}>{aviso?.texto}</p>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div className="grid grid-cols-2 gap-5 rounded-cartao bg-superficie p-5">
            <Numero valor={reais(plano.porCookie)} rotulo="custo por cookie" />
            <Numero valor={reais(plano.precoMinimo)} rotulo={`preço para ${numero(ficha.margem)}% de margem`} />
            <Numero valor={String(plano.receitas)} rotulo={`receitas para ${numero(ficha.meta)} cookies`} />
            <Numero valor={reais(plano.gastoTotal)} rotulo="gasto em compras" />
          </div>
          <div className="rounded-cartao bg-superficie p-5">
            <h3 className="text-xl font-bold">Lista de compras</h3>
            {plano.receitas && plano.compras.length ? (
              <ul className="mt-3 divide-y divide-linha">
                {plano.compras.filter((c) => c.nome).map((c) => (
                  <li key={c.nome} className="flex justify-between gap-3 py-2">
                    <span>
                      {c.nome}
                      <span className="block text-sm text-tinta-fraca">
                        {c.total.toLocaleString("pt-BR")} {c.unidade} · {c.pacotes} {c.pacotes === 1 ? "pacote" : "pacotes"}
                      </span>
                    </span>
                    <span className="font-bold tabular-nums">{reais(c.gasto)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-tinta-fraca">Preencha ingredientes, cookies por receita e a meta para a feira.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PainelMoki() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <header className="pt-10">
        <Link href="/" className="text-tinta-fraca hover:text-tinta">← Guia da feira</Link>
        <h1 className="mt-4 text-[clamp(2.1rem,6vw,3.6rem)] font-bold tracking-[-0.02em]">Painel MOKI Cookies</h1>
        <p className="mt-1 text-tinta-fraca">Uso interno da banca.</p>
      </header>
      <nav className="sticky top-0 z-10 -mx-4 mt-6 flex gap-2 overflow-x-auto bg-fundo px-4 py-3" aria-label="Partes do painel">
        <a href="#banca" className="flex-none rounded-full bg-superficie px-4 py-2 font-bold">Banca ao vivo</a>
        <a href="#calculadora" className="flex-none rounded-full bg-superficie px-4 py-2 font-bold">Calculadora de insumos</a>
      </nav>
      <div className="mt-8">
        <BancaAoVivo />
        <Calculadora />
      </div>
    </main>
  );
}
