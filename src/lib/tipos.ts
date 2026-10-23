export type Produto = { nome: string; preco: number; esgotado: boolean };

export type Banca = {
  id: string;
  numero: number;
  nome: string;
  descricao: string;
  produtos: Produto[];
  pagamento: string;
  instagram: string;
};

export type Voto = { banca: string; nota: number };

export type Sabor = { id: string; nome: string; preco: number; produzidos: number; vendidos: number };

export type Ingrediente = { nome: string; preco: string; pacote: string; unidade: "g" | "ml" | "un"; uso: string };

export type Ficha = {
  ingredientes: Ingrediente[];
  rendimento: string;
  embalagem: string;
  margem: string;
  meta: string;
  peso: string;
  forno: string;
};
