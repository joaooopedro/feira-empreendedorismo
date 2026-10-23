import type { Metadata, Viewport } from "next";
import { Archivo, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: "Guia da Feira de Empreendedorismo",
  description: "Mapa 3D das bancas, cardápio, preços e votação da Feira de Empreendedorismo de 03/11.",
};

export const viewport: Viewport = { themeColor: "#fcfcfc" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${atkinson.variable} ${archivo.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
