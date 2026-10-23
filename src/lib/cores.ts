// Cor do toldo de cada banca. Vale no 3D e na interface: número, cardápio e ranking.
// slop-ok: hex porque o three.js e o style inline usam o mesmo valor.
const TOLDOS = [
  { cor: "#E4472F", tinta: "#FFFFFF" }, // tomate
  { cor: "#2F5BE0", tinta: "#FFFFFF" }, // cobalto
  { cor: "#1F9D5B", tinta: "#FFFFFF" }, // verde
  { cor: "#E8A817", tinta: "#1B1E2B" }, // mostarda
  { cor: "#D93F78", tinta: "#FFFFFF" }, // rosa
  { cor: "#F07A1F", tinta: "#1B1E2B" }, // laranja
  { cor: "#0E8F94", tinta: "#FFFFFF" }, // turquesa
];

export const toldo = (numero: number) => TOLDOS[(numero - 1 + TOLDOS.length) % TOLDOS.length];
