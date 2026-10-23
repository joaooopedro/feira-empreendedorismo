"use server";

import { FieldValue } from "firebase-admin/firestore";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/admin";
import { abrirSessao, bancaLogada, fecharSessao, senhaConfere } from "@/lib/acesso";
import { restam } from "@/lib/calculo";
import type { Ficha, Produto, Sabor } from "@/lib/tipos";

type Resposta = { ok: boolean; texto: string };

export async function entrar(_: Resposta | null, dados: FormData): Promise<Resposta> {
  const banca = String(dados.get("banca") ?? "");
  if (!senhaConfere(banca, String(dados.get("senha") ?? ""))) return { ok: false, texto: "Senha não confere com essa banca." };
  await abrirSessao(banca);
  redirect(String(dados.get("voltar") ?? "/cadastro"));
}

export async function sair() {
  await fecharSessao();
  redirect("/cadastro");
}

async function exigir(banca?: string) {
  const logada = await bancaLogada();
  if (!logada || (banca && logada !== banca)) throw new Error("Entre com a senha da banca.");
  return logada;
}

export async function salvarCardapio(produtos: Produto[], pagamento: string, instagram: string): Promise<Resposta> {
  const banca = await exigir();
  const limpos = produtos
    .slice(0, 40)
    .map((p) => ({ nome: String(p.nome).trim().slice(0, 80), preco: Number(p.preco), esgotado: Boolean(p.esgotado) }))
    .filter((p) => p.nome && p.preco > 0 && p.preco < 10000);
  await adminDb.doc(`bancas/${banca}`).update({
    produtos: limpos,
    pagamento: String(pagamento).trim().slice(0, 120),
    instagram: String(instagram).trim().slice(0, 60),
  });
  return { ok: true, texto: "Cardápio salvo. Já aparece no guia." };
}

// O cardápio da MOKI no guia acompanha o estoque dos sabores.
async function espelharMoki() {
  const sabores = (await adminDb.collection("mokiSabores").get()).docs.map((d) => d.data() as Sabor);
  const produtos = sabores
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((s) => ({ nome: s.nome, preco: s.preco, esgotado: restam(s) === 0 }));
  await adminDb.doc("bancas/moki").update({ produtos });
}

export async function registrarVenda(sabor: string, delta: 1 | -1) {
  await exigir("moki");
  const ref = adminDb.doc(`mokiSabores/${sabor}`);
  await adminDb.runTransaction(async (t) => {
    const s = (await t.get(ref)).data() as Sabor | undefined;
    if (!s) return;
    const vendidos = s.vendidos + delta;
    if (vendidos < 0 || vendidos > s.produzidos) return;
    t.update(ref, { vendidos: FieldValue.increment(delta) });
  });
  await espelharMoki();
}

export async function novoSabor(nome: string, preco: number, produzidos: number): Promise<Resposta> {
  await exigir("moki");
  if (!nome.trim() || !(preco > 0) || !(produzidos > 0)) return { ok: false, texto: "Preencha sabor, preço e quantidade com números maiores que zero." };
  await adminDb.collection("mokiSabores").add({ nome: nome.trim().slice(0, 80), preco, produzidos: Math.round(produzidos), vendidos: 0 });
  await espelharMoki();
  return { ok: true, texto: "Sabor adicionado." };
}

export async function salvarFicha(ficha: Ficha): Promise<Resposta> {
  await exigir("moki");
  await adminDb.doc("mokiFicha/receita").set(JSON.parse(JSON.stringify(ficha)));
  return { ok: true, texto: "Ficha salva para todo o grupo." };
}
