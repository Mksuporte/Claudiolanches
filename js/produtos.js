'use strict';

// Dados centralizados. Scripts clássicos também funcionam em file://.
const CARDAPIO = Object.freeze({
  config: { estabelecimento: 'Cláudio Lanches', whatsapp: '5543996243007', telefone: '4334752562', storageKey: 'claudio-lanches:cart:v1', validadeHoras: 24 },
  categorias: [
    { id: 'todos', nome: 'Todos' },
    { id: 'lanches', nome: 'Lanches' },
    { id: 'cachorro-quente', nome: 'Cachorro-quente' },
    { id: 'porcoes', nome: 'Porções' },
    { id: 'bebidas', nome: 'Bebidas' },
    { id: 'cervejas', nome: 'Cervejas' },
    { id: 'adicionais', nome: 'Adicionais' }
  ],
  produtos: [
  { "id": "porcoes-frango-desfiado", "categoria": "porcoes", "nome": "Frango desfiado", "descricao": "1 kg", "preco": 40, "adicionaisPermitidos": false, "imagem": "", "ativo": true },
  { "id": "porcoes-calabresa", "categoria": "porcoes", "nome": "Calabresa", "descricao": "1 kg", "preco": 40, "adicionaisPermitidos": false, "imagem": "", "ativo": true },
  { "id": "porcoes-enroladinho", "categoria": "porcoes", "nome": "Enroladinho de presunto e queijo", "descricao": "", "preco": 12, "adicionaisPermitidos": false, "imagem": "", "ativo": true },
  {
    "id": "lanches-misto-quente",
    "categoria": "lanches",
    "nome": "Misto quente",
    "descricao": "Presunto, mussarela, ketchup e maionese",
    "preco": 15,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-salada",
    "categoria": "lanches",
    "nome": "X-salada",
    "descricao": "Presunto, mussarela, alface, tomate, hambúrguer, ketchup e maionese",
    "preco": 20,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-burguer",
    "categoria": "lanches",
    "nome": "X-burguer",
    "descricao": "Presunto, mussarela, hambúrguer, ketchup e maionese",
    "preco": 17,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-galinha",
    "categoria": "lanches",
    "nome": "X-galinha",
    "descricao": "Presunto, mussarela, tomate, hambúrguer, frango, ovo, ketchup e maionese",
    "preco": 40,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-egg",
    "categoria": "lanches",
    "nome": "X-egg",
    "descricao": "Presunto, mussarela, tomate, alface, hambúrguer, ovo, ketchup e maionese",
    "preco": 22,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-calabresa",
    "categoria": "lanches",
    "nome": "X-calabresa",
    "descricao": "Presunto, mussarela, tomate, hambúrguer, calabresa, ketchup e maionese",
    "preco": 38,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-frango",
    "categoria": "lanches",
    "nome": "X-frango",
    "descricao": "Presunto, mussarela, tomate, hambúrguer, frango, ketchup e maionese",
    "preco": 38,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-bacon",
    "categoria": "lanches",
    "nome": "X-bacon",
    "descricao": "Presunto, mussarela, tomate, hambúrguer, bacon, ketchup e maionese",
    "preco": 40,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-begg",
    "categoria": "lanches",
    "nome": "X-begg",
    "descricao": "Presunto, mussarela, tomate, hambúrguer, bacon, ovo, ketchup e maionese",
    "preco": 42,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-b-f",
    "categoria": "lanches",
    "nome": "X-b/f",
    "descricao": "Presunto, mussarela, tomate, hambúrguer, bacon, frango, ketchup e maionese",
    "preco": 45,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-b-c",
    "categoria": "lanches",
    "nome": "X-b/c",
    "descricao": "Presunto, mussarela, tomate, hambúrguer, bacon, calabresa, ketchup e maionese",
    "preco": 45,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-misto",
    "categoria": "lanches",
    "nome": "X-misto",
    "descricao": "Presunto, mussarela, tomate, hambúrguer, calabresa, frango, ketchup e maionese",
    "preco": 45,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-tudo",
    "categoria": "lanches",
    "nome": "X-tudo",
    "descricao": "Hambúrguer, presunto, mussarela, frango, bacon, calabresa, ovo, tomate, maionese e ketchup",
    "preco": 60,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-vegetariano",
    "categoria": "lanches",
    "nome": "X-vegetariano",
    "descricao": "Ovo, queijo, tomate, alface, maionese e ketchup",
    "preco": 20,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "lanches-x-fit",
    "categoria": "lanches",
    "nome": "X-fit",
    "descricao": "Pão fit, frango, queijo, tomate e alface",
    "preco": 18,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-simples",
    "categoria": "cachorro-quente",
    "nome": "Simples",
    "descricao": "Salsicha, tomate, ketchup e maionese",
    "preco": 16,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-simples-duplo",
    "categoria": "cachorro-quente",
    "nome": "Simples duplo",
    "descricao": "Duas salsichas, tomate, ketchup e maionese",
    "preco": 18,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-simples-p-m",
    "categoria": "cachorro-quente",
    "nome": "Simples p/m",
    "descricao": "Salsicha, tomate, ketchup, maionese, presunto e mussarela",
    "preco": 22,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-simples-duplo-p-m",
    "categoria": "cachorro-quente",
    "nome": "Simples duplo p/m",
    "descricao": "Duas salsichas, tomate, ketchup, maionese, presunto e mussarela",
    "preco": 24,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-frango",
    "categoria": "cachorro-quente",
    "nome": "Frango",
    "descricao": "Salsicha, frango, tomate, ketchup e maionese",
    "preco": 30,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-calabresa",
    "categoria": "cachorro-quente",
    "nome": "Calabresa",
    "descricao": "Salsicha, calabresa, tomate, ketchup e maionese",
    "preco": 30,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-bacon",
    "categoria": "cachorro-quente",
    "nome": "Bacon",
    "descricao": "Salsicha, bacon, tomate, ketchup e maionese",
    "preco": 35,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-misto",
    "categoria": "cachorro-quente",
    "nome": "Misto",
    "descricao": "Salsicha, calabresa, frango, tomate, ketchup e maionese",
    "preco": 38,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-b-f",
    "categoria": "cachorro-quente",
    "nome": "B/f",
    "descricao": "Salsicha, bacon, frango, tomate, ketchup e maionese",
    "preco": 39,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-b-c",
    "categoria": "cachorro-quente",
    "nome": "B/c",
    "descricao": "Salsicha, bacon, calabresa, tomate, ketchup e maionese",
    "preco": 39,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cachorro-quente-especial",
    "categoria": "cachorro-quente",
    "nome": "Especial",
    "descricao": "Salsicha, calabresa, frango, tomate, mussarela, presunto, ketchup e maionese",
    "preco": 40,
    "adicionaisPermitidos": true,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-suco-valle-frut",
    "categoria": "bebidas",
    "nome": "Suco Valle Frut",
    "descricao": "",
    "preco": 7,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-valle-lata",
    "categoria": "bebidas",
    "nome": "Valle lata",
    "descricao": "",
    "preco": 7,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-monster",
    "categoria": "bebidas",
    "nome": "Monster",
    "descricao": "",
    "preco": 15,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-tubaina",
    "categoria": "bebidas",
    "nome": "Tubaína",
    "descricao": "",
    "preco": 6,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-refrigerante-mini",
    "categoria": "bebidas",
    "nome": "Refrigerante mini",
    "descricao": "",
    "preco": 3,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-refrigerante-290-ml",
    "categoria": "bebidas",
    "nome": "Refrigerante 290 ml",
    "descricao": "",
    "preco": 5,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-refrigerante-lata",
    "categoria": "bebidas",
    "nome": "Refrigerante lata",
    "descricao": "",
    "preco": 6,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-refrigerante-600-ml",
    "categoria": "bebidas",
    "nome": "Refrigerante 600 ml",
    "descricao": "",
    "preco": 8,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-refrigerante-1-litro",
    "categoria": "bebidas",
    "nome": "Refrigerante 1 litro",
    "descricao": "",
    "preco": 9,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-sodinha",
    "categoria": "bebidas",
    "nome": "Sodinha",
    "descricao": "",
    "preco": 3,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-agua-500-ml-com-sem-gas",
    "categoria": "bebidas",
    "nome": "Água 500 ml com/sem gás",
    "descricao": "",
    "preco": 4,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-suco-natu-300-ml",
    "categoria": "bebidas",
    "nome": "Suco Natu 300 ml",
    "descricao": "",
    "preco": 10,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-suco-natu-500-ml",
    "categoria": "bebidas",
    "nome": "Suco Natu 500 ml",
    "descricao": "",
    "preco": 12,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "bebidas-suco-natu-900-ml",
    "categoria": "bebidas",
    "nome": "Suco Natu 900 ml",
    "descricao": "",
    "preco": 18,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "cervejas-brahma-lata",
    "categoria": "cervejas",
    "nome": "Brahma",
    "descricao": "",
    "preco": 6,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Lata"
  },
  {
    "id": "cervejas-skol-lata",
    "categoria": "cervejas",
    "nome": "Skol",
    "descricao": "",
    "preco": 6,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Lata"
  },
  {
    "id": "cervejas-antarctica-boa-lata",
    "categoria": "cervejas",
    "nome": "Antarctica Boa",
    "descricao": "",
    "preco": 6,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Lata"
  },
  {
    "id": "cervejas-amstel-lata",
    "categoria": "cervejas",
    "nome": "Amstel",
    "descricao": "",
    "preco": 6,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Lata"
  },
  {
    "id": "cervejas-original-lata",
    "categoria": "cervejas",
    "nome": "Original",
    "descricao": "",
    "preco": 6,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Lata"
  },
  {
    "id": "cervejas-glacial-lata",
    "categoria": "cervejas",
    "nome": "Glacial",
    "descricao": "",
    "preco": 5,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Lata"
  },
  {
    "id": "cervejas-sol-long-neck",
    "categoria": "cervejas",
    "nome": "Sol",
    "descricao": "",
    "preco": 10,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Long neck"
  },
  {
    "id": "cervejas-heineken-long-neck",
    "categoria": "cervejas",
    "nome": "Heineken",
    "descricao": "",
    "preco": 10,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Long neck"
  },
  {
    "id": "cervejas-heineken-zero-zero",
    "categoria": "cervejas",
    "nome": "Heineken Zero",
    "descricao": "",
    "preco": 12,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Zero"
  },
  {
    "id": "cervejas-brahma-zero-zero",
    "categoria": "cervejas",
    "nome": "Brahma Zero",
    "descricao": "",
    "preco": 7,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true,
    "subcategoria": "Zero"
  }
],
  adicionais: [
  {
    "id": "adicionais-frango",
    "categoria": "adicionais",
    "nome": "Frango",
    "descricao": "",
    "preco": 9,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "adicionais-bacon",
    "categoria": "adicionais",
    "nome": "Bacon",
    "descricao": "",
    "preco": 9,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "adicionais-calabresa",
    "categoria": "adicionais",
    "nome": "Calabresa",
    "descricao": "",
    "preco": 9,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "adicionais-salsicha",
    "categoria": "adicionais",
    "nome": "Salsicha",
    "descricao": "",
    "preco": 2.5,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "adicionais-hamburguer",
    "categoria": "adicionais",
    "nome": "Hambúrguer",
    "descricao": "",
    "preco": 3.5,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  },
  {
    "id": "adicionais-presunto-mussarela",
    "categoria": "adicionais",
    "nome": "Presunto + Mussarela",
    "descricao": "",
    "preco": 8,
    "adicionaisPermitidos": false,
    "imagem": "",
    "ativo": true
  }
]
});
