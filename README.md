# Cláudio Lanches — Cardápio Digital

Cardápio estático em HTML, CSS e JavaScript puro, com 53 produtos, 6 adicionais, personalização, carrinho e finalização pelo WhatsApp. Sem login, pagamento online, banco de dados, backend ou bibliotecas externas.

## Estrutura

```text
index.html                 Entrada principal e estrutura da interface
css/style.css              Identidade visual e responsividade
js/produtos.js             Configuração, categorias, produtos e adicionais
js/app.js                  Interface, cálculos, carrinho e WhatsApp
assets/icons/favicon.svg   Favicon provisório CL
assets/img/                Pasta para futuras fotografias
README.md                  Instruções do projeto
```

## Como abrir localmente

Abra `index.html` no navegador, com duplo clique. Não é necessário instalar Node.js, executar build ou iniciar um servidor. Os scripts são clássicos com `defer`, sem importações ou requisições a arquivos de dados; todos os caminhos dos arquivos são relativos.

O carrinho é salvo no localStorage por até 24 horas desde a última alteração. O navegador pode restringir o armazenamento em arquivos locais ou navegação privada; nesse caso, o pedido funciona durante a sessão e a interface informa a limitação. O armazenamento local e o do domínio publicado são independentes. Dados de identificação e endereço não são persistidos.

## Produtos, preços e contatos

Edite `js/produtos.js`. Cada produto tem `id` único, `categoria`, `nome`, `descricao`, `preco` numérico (por exemplo, `20.00`), `adicionaisPermitidos`, `imagem` e `ativo`. Cervejas também têm `subcategoria`. Não altere IDs de produtos existentes sem necessidade.

Os adicionais ficam na lista `adicionais` e são aplicados por unidade do lanche ou cachorro-quente. A categoria Adicionais mostra os preços e encaminha à escolha de um lanche; não vende ingredientes isoladamente. Produtos sem descrição no pedido original usam uma orientação genérica, sem inventar ingredientes. Porções de 100 g e 500 g não foram cadastradas.

Os valores são convertidos em centavos inteiros para os cálculos e formatados por uma função central com `Intl.NumberFormat('pt-BR')`. O carrinho restaura apenas IDs e escolhas válidas, usando sempre os preços atuais do catálogo.

Em `CARDAPIO.config`, altere `whatsapp` (país + DDD + número, somente dígitos), `telefone` e `estabelecimento`. Os contatos visíveis e links são derivados dessa configuração.

## Imagens e identidade

Coloque a fotografia em `assets/img/` e defina, por exemplo, `imagem: 'assets/img/x-salada.webp'`. Prefira WebP/AVIF comprimido. A interface define dimensões, carregamento lazy e texto alternativo; imagens ausentes não impedem a compra. A pasta vazia não é armazenada pelo Git: ela passará a integrar o repositório quando receber uma imagem.

A marca tipográfica e `assets/icons/favicon.svg` são provisórios. Substitua-os quando houver uma identidade oficial. Os metadados Open Graph básicos estão no HTML. Ao definir o domínio e uma imagem oficial de compartilhamento, acrescente `og:url` e `og:image` com os endereços públicos correspondentes.

## Fluxo do pedido

Escolha o produto, quantidade (1 a 99), adicionais e observações (até 300 caracteres). Revise ou edite o carrinho, informe nome, retirada/entrega e pagamento. Entrega exige rua, número (aceita s/n) e bairro. Dinheiro com troco exige valor maior que o total dos produtos; use `100,00` ou `100.00`, sem separador de milhar.

Limpar o carrinho exige confirmação. O WhatsApp abre na mesma aba com mensagem codificada por `encodeURIComponent`, sem envio automático. O carrinho é mantido ao retornar. Taxa de entrega e confirmação do pedido dependem do estabelecimento. Não há chave PIX cadastrada.

## Deploy na Vercel

Este projeto é estático. Não precisa de comando de build, Node.js, PHP, Apache, `.htaccess` ou `vercel.json`.

1. Crie um repositório exclusivo para este projeto no GitHub, GitLab ou Bitbucket. Envie `index.html`, `css/`, `js/`, `assets/` e `README.md`, preservando a estrutura. Você pode usar o upload de arquivos do provedor ou um cliente Git. Com Git, inicialize o repositório nesta pasta, selecione os arquivos, faça o commit, associe o remoto e faça o push **somente quando autorizar essas operações**. Nenhuma delas foi executada durante a implementação.
2. Na Vercel, escolha **Add New → Project**, conecte o provedor Git e importe esse repositório.
3. Use **Framework Preset: Other** e **Root Directory** na raiz que contém `index.html`.
4. Ative o override de **Build Command** e deixe o comando vazio. Não é necessário comando de instalação.
5. O **Output Directory** é a própria raiz, `.`. Como não existe pasta `public`, o preset Other já usa a raiz; se precisar informar manualmente, use `.`. Não use `dist` ou `build`.
6. Clique em **Deploy**. Abra o endereço fornecido e confira o cardápio, carrinho e finalização no celular.

Para novas versões, altere os arquivos, revise e teste. Depois, faça commit e push para a branch de produção conectada à Vercel: a integração Git publica uma nova versão automaticamente. Nenhuma publicação foi realizada nesta etapa.

Referência: [Configuração de build e sites sem build — documentação da Vercel](https://vercel.com/docs/builds/configure-a-build).

## Evolução futura

Dados e interface estão separados para facilitar uma futura fonte de dados ou painel administrativo. Não foram implementados combos, cupons, taxas por bairro, PWA ou outras funções futuras.

Para adicionar patrocinadores, crie uma lista própria de dados e uma função de renderização independente, inserindo a seção antes do rodapé apenas quando estiver habilitada e houver conteúdo. Hoje não existe anúncio nem espaço reservado visível.

Uma migração para outro servidor estático exige apenas copiar os arquivos mantendo a estrutura; o frontend não depende de recursos exclusivos da Vercel.

## Verificação de desenvolvimento

`tests/verify.cjs` é uma ferramenta opcional de teste, não carregada pela página. Se houver Node.js e Chrome instalados, execute `node tests/verify.cjs`. Para outro caminho do Chrome, defina `CHROME_PATH`. O script usa um perfil temporário isolado e Chrome headless, intercepta a navegação ao WhatsApp sem enviar mensagens e grava `tests/RESULTADOS.md` e capturas em `tests/screenshots/`.

Os testes cobrem cálculos, adicionais, quantidade, edição, carrinho vazio, localStorage, entrega, retirada, validação de troco, caracteres especiais e ausência de transbordamento horizontal em 320, 375, 390, 430, 768 e 1280 px. A aplicação não precisa de Node.js para funcionar. A pasta `tests/` é material de desenvolvimento e pode ficar fora dos arquivos enviados para publicação.
