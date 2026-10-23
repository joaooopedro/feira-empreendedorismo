# Guia Digital da Feira de Empreendedorismo

Trabalho de Empreendedorismo (Engenharia de Software, UniAcademia, grupo UniRide) para a Feira de Empreendedorismo de 03/11.

- `/`: guia do visitante com a sala em 3D (three.js), cardápio e preço de cada banca, votação e ranking ao vivo (demanda 1B).
- `/cadastro`: cada grupo de Gestão atualiza o cardápio da própria banca.
- `/moki`: painel da MOKI Cookies com estoque e vendas por sabor em tempo real e calculadora de insumos (demanda 1A).
- `/qr`: cartazes com QR Code para imprimir.

Stack: Next.js 15 (App Router, renderização no servidor), React 19, TypeScript, Tailwind 4, three.js com react-three-fiber, Motion e Cloud Firestore (projeto `feira-emp-80153`, regras em `firestore.rules`).

## Rodar

```bash
npm install
npm run dev
npm test
```

## Integrantes

João Pedro Silva de Almeida, Gabriel Caputo Morais, Caio Castilho Soranço, Nicolas Isaac Pinto de Jesus e Jonathan Delmonte Pereira.
