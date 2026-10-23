import type { Metadata } from "next";
import PainelMoki from "@/components/PainelMoki";

export const metadata: Metadata = {
  title: "Painel MOKI Cookies",
  description: "Estoque e vendas por sabor em tempo real e calculadora de insumos da MOKI Cookies.",
};

export default function Pagina() {
  return <PainelMoki />;
}
