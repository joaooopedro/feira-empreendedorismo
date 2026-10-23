import { test } from "node:test";
import assert from "node:assert/strict";
import { numero, planejar, ranking, restam } from "./calculo.ts";

test("numero aceita vírgula", () => {
  assert.equal(numero("6,50"), 6.5);
  assert.equal(numero(""), 0);
});

test("planejar calcula custo, preço e compras", () => {
  const p = planejar(
    [
      { nome: "Farinha", preco: "6", pacote: "1000", unidade: "g", uso: "300" },
      { nome: "Ovos", preco: "18", pacote: "30", unidade: "un", uso: "2" },
    ],
    16, 0.4, 50, 40,
  );
  assert.equal(p.receita.toFixed(2), "3.00"); // 1,80 de farinha + 1,20 de ovos
  assert.equal(p.porCookie.toFixed(4), "0.5875");
  assert.equal(p.receitas, 3); // 40 cookies, 16 por receita
  assert.deepEqual(p.compras.map((c) => c.pacotes), [1, 1]);
});

test("ranking ordena por média e desempata por votos", () => {
  const r = ranking([
    { banca: "a", nota: 5 }, { banca: "b", nota: 5 }, { banca: "b", nota: 5 }, { banca: "c", nota: 3 },
  ]);
  assert.deepEqual(r.map((x) => x.banca), ["b", "a", "c"]);
});

test("restam nunca fica negativo", () => {
  assert.equal(restam({ id: "x", nome: "x", preco: 1, produzidos: 2, vendidos: 3 }), 0);
});
