"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const cartazes = [
  { titulo: "Guia da Feira", texto: "Mapa, cardápio, preços e votação", caminho: "/" },
  { titulo: "Vote nas bancas", texto: "Dê sua nota de 1 a 5", caminho: "/#votar" },
  { titulo: "Painel MOKI Cookies", texto: "Uso interno da banca", caminho: "/moki" },
];

export default function Cartazes() {
  const [origem, setOrigem] = useState("");
  useEffect(() => setOrigem(window.location.origin), []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 print:p-0">
      <div className="print:hidden">
        <h1 className="text-4xl font-bold">QR Codes para imprimir</h1>
        <p className="mt-1 text-tinta-fraca">Um cartaz grande para a entrada e um por mesa.</p>
        <button onClick={() => window.print()} className="mt-4 min-h-12 rounded-campo bg-tinta px-6 font-bold text-fundo">Imprimir</button>
      </div>
      {origem && cartazes.map((c) => (
        <section key={c.caminho} className="mt-6 break-after-page rounded-cartao bg-fundo p-8 text-center text-tinta ring-1 ring-linha">
          <h2 className="text-4xl font-bold">{c.titulo}</h2>
          <p className="mt-1 text-lg">{c.texto}</p>
          <QRCodeSVG value={origem + c.caminho} size={300} className="mx-auto mt-6 h-auto w-full max-w-[300px]" />
          <p className="mt-4 break-all text-sm">{origem + c.caminho}</p>
        </section>
      ))}
    </main>
  );
}
