import type { Metadata } from "next";
import Cadastro from "@/components/Cadastro";
import { buscarBancas } from "@/lib/bancas";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cardápio da banca", description: "Grupos de Gestão atualizam cardápio e preços da banca." };

export default async function Pagina() {
  return <Cadastro inicial={await buscarBancas()} />;
}
