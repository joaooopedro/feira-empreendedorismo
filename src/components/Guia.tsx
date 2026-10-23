"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useColecao } from "@/lib/useColecao";
import { ordenar } from "@/lib/bancas";
import { ranking, reais } from "@/lib/calculo";
import { toldo } from "@/lib/cores";
import type { Banca, Voto } from "@/lib/tipos";

const Mapa3D = dynamic(() => import("./Mapa3D"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-tinta-fraca">Montando a sala...</div>,
});

const saida = [0.22, 1, 0.36, 1] as const;

function Selo({ numero, tamanho = "size-10 text-lg" }: { numero: number; tamanho?: string }) {
  const { cor, tinta } = toldo(numero);
  return (
    <span
      className={`grid flex-none place-items-center rounded-full font-display font-bold ${tamanho}`}
      style={{ background: cor, color: tinta }}
      aria-hidden
    >
      {numero}
    </span>
  );
}

function Cardapio({ banca }: { banca: Banca }) {
  if (!banca.produtos.length) return <p className="text-tinta-fraca">O grupo ainda não cadastrou o cardápio.</p>;
  return (
    <ul className="flex flex-col gap-1.5">
      {banca.produtos.map((p) => (
        <li key={p.nome} className={`flex items-baseline gap-2 ${p.esgotado ? "text-tinta-fraca" : ""}`}>
          <span className={p.esgotado ? "line-through" : ""}>{p.nome}</span>
          {p.esgotado && <span className="text-sm font-bold text-erro">esgotou</span>}
          <span className="pontilhado" aria-hidden />
          <span className="font-bold tabular-nums">{reais(p.preco)}</span>
        </li>
      ))}
    </ul>
  );
}

function lerVotados(): string[] {
  try {
    return JSON.parse(localStorage.getItem("votados") ?? "[]");
  } catch {
    return [];
  }
}

// Sem armazenamento (aba anônima), o voto vale do mesmo jeito; só a trava do aparelho deixa de existir.
function guardarVotado(id: string) {
  try {
    localStorage.setItem("votados", JSON.stringify([...lerVotados(), id]));
    return true;
  } catch {
    return false;
  }
}

export default function Guia({ inicial }: { inicial: Banca[] }) {
  const { itens, erro } = useColecao<Banca>("bancas", inicial);
  const { itens: votos } = useColecao<Voto>("votos");
  const bancas = useMemo(() => ordenar(itens), [itens]);
  const notas = useMemo(() => ranking(votos), [votos]);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const atual = bancas.find((b) => b.id === selecionada);

  const [votoBanca, setVotoBanca] = useState("");
  const [nota, setNota] = useState(0);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function votar() {
    if (!votoBanca) return setAviso({ ok: false, texto: "Escolha a banca." });
    if (!nota) return setAviso({ ok: false, texto: "Escolha uma nota de 1 a 5." });
    // ponytail: um voto por banca por aparelho, travado no navegador; login institucional se valer prêmio.
    if (lerVotados().includes(votoBanca)) return setAviso({ ok: false, texto: "Você já votou nessa banca." });
    setEnviando(true);
    try {
      await addDoc(collection(db, "votos"), { banca: votoBanca, nota, criadoEm: serverTimestamp() });
      guardarVotado(votoBanca);
      setAviso({ ok: true, texto: "Nota enviada. Obrigado!" });
      setNota(0);
    } catch {
      setAviso({ ok: false, texto: "Não foi possível enviar. Confira a internet e tente de novo." });
    } finally {
      setEnviando(false);
    }
  }

  const escolherParaVotar = (id: string) => {
    setVotoBanca(id);
    setAviso(null);
    document.getElementById("votar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pt-6 sm:pt-10">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uniacademia-selo.png" alt="UniAcademia, Centro Universitário, 50 anos" className="h-9 w-auto sm:h-11" />
          <h1 className="mt-6 text-[clamp(1.9rem,7.6vw,4.4rem)] font-bold tracking-[-0.02em]">Feira de Empreendedorismo</h1>
        </div>
        <dl className="flex gap-6 pb-2 text-sm">
          <div><dt className="text-tinta-fraca">Quando</dt><dd className="font-bold">03/11, 20h às 22h30</dd></div>
          <div><dt className="text-tinta-fraca">Bancas</dt><dd className="font-bold">{bancas.length} grupos</dd></div>
        </dl>
      </header>

      {/* Sala em 3D com a ficha da banca ao lado */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]" aria-label="Mapa da sala">
        <div className="relative h-[58svh] min-h-[380px] overflow-hidden rounded-cartao bg-superficie ring-1 ring-linha lg:h-[560px]">
          <Mapa3D bancas={bancas} selecionada={selecionada} aoEscolher={setSelecionada} />
          <p className="pointer-events-none absolute bottom-3 left-3 rounded-campo bg-fundo/90 px-3 py-1.5 text-sm text-tinta-fraca">
            Arraste para girar. Toque numa mesa.
          </p>
        </div>

        <aside className="rounded-cartao bg-superficie p-5 lg:max-h-[560px] lg:overflow-y-auto" aria-live="polite">
          <AnimatePresence mode="wait">
            {atual ? (
              <motion.div key={atual.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: saida }}>
                <div className="flex items-center gap-3">
                  <Selo numero={atual.numero} tamanho="size-12 text-xl" />
                  <h2 className="text-2xl font-bold">{atual.nome}</h2>
                </div>
                <p className="mt-3 text-tinta-fraca">{atual.descricao}</p>
                <div className="mt-5"><Cardapio banca={atual} /></div>
                {atual.pagamento && <p className="mt-4 text-sm text-tinta-fraca">Pagamento: {atual.pagamento}</p>}
                <button
                  onClick={() => escolherParaVotar(atual.id)}
                  className="mt-6 min-h-12 w-full rounded-campo bg-tinta font-bold text-fundo transition-transform duration-200 ease-saida active:scale-[0.98]"
                >
                  Dar nota para {atual.nome}
                </button>
              </motion.div>
            ) : (
              <motion.div key="vazio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold">Escolha uma mesa</h2>
                <p className="mt-2 text-tinta-fraca">Toque numa mesa da sala ou num número abaixo para ver o cardápio e os preços.</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {bancas.map((b) => (
                    <li key={b.id}>
                      <button onClick={() => setSelecionada(b.id)} aria-label={`Ver ${b.nome}`} className="rounded-full ring-tinta transition-shadow duration-200 hover:ring-2 hover:ring-offset-2">
                        <Selo numero={b.numero} tamanho="size-11 text-lg" />
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </section>

      {erro && <p className="mt-6 font-bold text-erro">Sem conexão com o banco. Os dados podem estar desatualizados.</p>}

      {/* Cardápio geral, como um menu impresso */}
      <section className="mt-16" aria-labelledby="titulo-cardapio">
        <h2 id="titulo-cardapio" className="text-3xl font-bold">O que tem em cada banca</h2>
        <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {bancas.map((b) => (
            <article key={b.id} className={`border-t-4 pt-4 transition-colors duration-300`} style={{ borderColor: toldo(b.numero).cor }}>
              <button
                onClick={() => {
                  setSelecionada(b.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex w-full items-center gap-3 text-left"
              >
                <Selo numero={b.numero} />
                <h3 className="text-xl font-bold">{b.nome}</h3>
                <span className="ml-auto text-sm text-destaque underline underline-offset-4">ver na sala</span>
              </button>
              <p className="mb-4 mt-2 text-tinta-fraca">{b.descricao}</p>
              <Cardapio banca={b} />
            </article>
          ))}
        </div>
      </section>

      {/* Votação e ranking */}
      <div className="mt-20 grid gap-12 lg:grid-cols-2">
        <section id="votar" aria-labelledby="titulo-votar" className="scroll-mt-6">
          <h2 id="titulo-votar" className="text-3xl font-bold">Dê sua nota</h2>
          <p className="mt-1 text-tinta-fraca">Uma nota por banca. A banca mais bem avaliada ganha destaque no fim da noite.</p>

          <p id="rotulo-banca" className="mb-2 mt-6 font-bold">Banca</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="rotulo-banca">
            {bancas.map((b) => {
              const ativa = votoBanca === b.id;
              return (
                <button
                  key={b.id}
                  role="radio"
                  aria-checked={ativa}
                  onClick={() => setVotoBanca(b.id)}
                  className={`flex min-h-12 items-center gap-2 rounded-full py-1 pl-1 pr-4 ring-1 transition-colors duration-200 ${ativa ? "bg-tinta text-fundo ring-tinta" : "bg-fundo ring-linha hover:ring-tinta-fraca"}`}
                >
                  <Selo numero={b.numero} tamanho="size-9 text-base" />
                  <span className="font-bold">{b.nome}</span>
                </button>
              );
            })}
          </div>

          <p id="rotulo-nota" className="mb-2 mt-6 font-bold">Nota</p>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-labelledby="rotulo-nota">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                role="radio"
                aria-checked={nota === n}
                aria-label={`Nota ${n}`}
                whileTap={{ scale: 0.92 }}
                onClick={() => setNota(n)}
                className={`min-h-14 rounded-campo font-display text-xl font-bold ring-1 transition-colors duration-200 ${n <= nota ? "bg-marca text-tinta ring-marca" : "bg-fundo ring-linha"}`}
              >
                {n}
              </motion.button>
            ))}
          </div>

          <button
            onClick={votar}
            disabled={enviando}
            className="mt-6 min-h-12 w-full rounded-campo bg-tinta font-bold text-fundo transition-opacity disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Enviar nota"}
          </button>
          <p role="status" className={`mt-3 min-h-6 font-bold ${aviso?.ok ? "text-ok" : "text-erro"}`}>{aviso?.texto}</p>
        </section>

        <section aria-labelledby="titulo-ranking">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="titulo-ranking" className="text-3xl font-bold">Ranking ao vivo</h2>
            <span className="text-tinta-fraca">{votos.length} {votos.length === 1 ? "nota" : "notas"}</span>
          </div>
          <ol className="mt-6">
            <AnimatePresence initial={false}>
              {notas.map((n, i) => {
                const b = bancas.find((x) => x.id === n.banca);
                if (!b) return null;
                return (
                  <motion.li layout key={n.banca} className="grid grid-cols-[2rem_auto_1fr] items-center gap-x-3 gap-y-2 border-t border-linha py-4" transition={{ duration: 0.5, ease: saida }}>
                    <span className={`font-display text-2xl font-bold ${i === 0 ? "text-destaque" : "text-tinta-fraca"}`}>{i + 1}</span>
                    <Selo numero={b.numero} tamanho="size-9 text-base" />
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{b.nome}</span>
                      <span className="text-sm text-tinta-fraca">
                        {n.media.toFixed(1).replace(".", ",")} de 5 · {n.total} {n.total === 1 ? "voto" : "votos"}
                      </span>
                    </span>
                    <span className="col-span-3 h-2 overflow-hidden rounded-full bg-superficie-alta" aria-hidden>
                      <motion.span
                        className="block h-full rounded-full"
                        style={{ background: toldo(b.numero).cor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(n.media / 5) * 100}%` }}
                        transition={{ duration: 0.8, ease: saida }}
                      />
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {!notas.length && <li className="border-t border-linha py-4 text-tinta-fraca">Ainda sem notas. A primeira pode ser a sua.</li>}
          </ol>
        </section>
      </div>

      <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-linha pt-6 text-sm text-tinta-fraca">
        <span>Engenharia de Software, grupo UniRide. Disciplina de Empreendedorismo, UniAcademia.</span>
        <Link href="/cadastro" className="font-bold text-destaque underline underline-offset-4">Sou de um grupo: atualizar cardápio</Link>
      </footer>
    </main>
  );
}
