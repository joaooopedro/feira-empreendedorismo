import type { Metadata } from "next";
import Cadastro from "@/components/Cadastro";
import Entrar from "@/components/Entrar";
import { buscarBancas } from "@/lib/bancas";
import { bancaLogada } from "@/lib/acesso";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cardápio da banca", description: "Grupos de Gestão atualizam cardápio e preços da banca." };

export default async function Pagina() {
  const [bancas, banca] = await Promise.all([buscarBancas(), bancaLogada()]);
  if (!banca) return <Entrar bancas={bancas} voltar="/cadastro" />;
  return <Cadastro inicial={bancas} banca={banca} />;
}
