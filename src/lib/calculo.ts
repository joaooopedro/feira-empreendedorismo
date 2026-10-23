import type { Ingrediente, Sabor, Voto } from "./tipos";

// Aceita "6,50" e "6.50".
export const numero = (v: string | number | undefined) => Number(String(v ?? "").replace(",", ".")) || 0;

export const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function custoDaReceita(ingredientes: Ingrediente[]) {
  return ingredientes.reduce((total, i) => {
    const pacote = numero(i.pacote);
    return pacote ? total + (numero(i.preco) / pacote) * numero(i.uso) : total;
  }, 0);
}

export function planejar(ingredientes: Ingrediente[], rendimento: number, embalagem: number, margem: number, meta: number) {
  const receita = custoDaReceita(ingredientes);
  const porCookie = rendimento ? receita / rendimento + embalagem : 0;
  const receitas = rendimento ? Math.ceil(meta / rendimento) : 0;
  const compras = ingredientes.map((i) => {
    const total = numero(i.uso) * receitas;
    const pacotes = numero(i.pacote) ? Math.ceil(total / numero(i.pacote)) : 0;
    return { nome: i.nome, unidade: i.unidade, total, pacotes, gasto: pacotes * numero(i.preco) };
  });
  return {
    receita,
    porCookie,
    precoMinimo: porCookie * (1 + margem / 100),
    receitas,
    compras,
    gastoTotal: compras.reduce((t, c) => t + c.gasto, 0),
  };
}

export function ranking(votos: Voto[]) {
  const porBanca = new Map<string, { soma: number; total: number }>();
  for (const v of votos) {
    const atual = porBanca.get(v.banca) ?? { soma: 0, total: 0 };
    porBanca.set(v.banca, { soma: atual.soma + v.nota, total: atual.total + 1 });
  }
  return [...porBanca]
    .map(([banca, { soma, total }]) => ({ banca, media: soma / total, total }))
    .sort((a, b) => b.media - a.media || b.total - a.total);
}

export const restam = (s: Sabor) => Math.max(0, s.produzidos - s.vendidos);
