import type { Metadata } from "next";
import Entrar from "@/components/Entrar";
import PainelMoki from "@/components/PainelMoki";
import { buscarBancas } from "@/lib/bancas";
import { bancaLogada } from "@/lib/acesso";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Painel MOKI Cookies",
  description: "Estoque e vendas por sabor em tempo real e calculadora de insumos da MOKI Cookies.",
};

export default async function Pagina() {
  if ((await bancaLogada()) !== "moki") return <Entrar bancas={await buscarBancas()} fixa="moki" voltar="/moki" />;
  return <PainelMoki />;
}
