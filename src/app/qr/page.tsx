import type { Metadata } from "next";
import Cartazes from "@/components/Cartazes";

export const metadata: Metadata = { title: "QR Codes da Feira", description: "Cartazes com QR Code para imprimir." };

export default function Pagina() {
  return <Cartazes />;
}
