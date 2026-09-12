# Cláudio Lanches — Cardápio Digital

Cardápio estático em HTML, CSS e JavaScript puro, com 53 produtos, 7 adicionais, personalização, carrinho e finalização pelo WhatsApp. Sem login, pagamento online, banco de dados, backend ou bibliotecas externas.

## Estrutura

```text
index.html                 Entrada principal e estrutura da interface
css/style.css              Identidade visual e responsividade
js/produtos.js             Configuração, categorias, produtos e adicionais
js/app.js                  Interface, cálculos, carrinho e WhatsApp
logotopo.png               Logo oficial do cabeçalho (1940 × 811)
favicon.png                Hambúrguer: favicon e Apple Touch Icon (1254 × 1254)
assets/img/                Pasta para futuras fotografias
README.md                  Instruções do projeto
```

## Como abrir localmente

Abra `index.html` no navegador, com duplo clique. Não é necessário instalar Node.js, executar build ou iniciar um servidor. Os scripts são clássicos com `defer`, sem importações ou requisições a arquivos de dados; todos os caminhos dos arquivos são relativos.

O carrinho é salvo no localStorage por até 24 horas desde a última alteração. O navegador pode restringir o armazenamento em arquivos locais ou navegação privada; nesse caso, o pedido funciona durante a sessão e a interface informa a limitação. O armazenamento local e o do domínio publicado são independentes. Dados de identificação não são persistidos.

## Produtos, preços e contatos

Edite `js/produtos.js`. Cada produto tem `id` único, `categoria`, `nome`, `descricao`, `preco` numérico (por exemplo, `20.00`), `adicionaisPermitidos`, `imagem` e `ativo`. Cervejas também têm `subcategoria`. Não altere IDs de produtos existentes sem necessidade.

Os adicionais ficam na lista `adicionais` e são aplicados por unidade do lanche ou cachorro-quente. A categoria Adicionais mostra os preços e encaminha à escolha de um lanche; não vende ingredientes isoladamente. Produtos sem descrição no pedido original usam uma orientação genérica, sem inventar ingredientes. Porções de 100 g e 500 g não foram cadastradas.

Os valores são convertidos em centavos inteiros para os cálculos e formatados por uma função central com `Intl.NumberFormat('pt-BR')`. O carrinho restaura apenas IDs e escolhas válidas, usando sempre os preços atuais do catálogo.

Em `CARDAPIO.config`, altere `whatsapp` (país + DDD + número, somente dígitos), `telefone` e `estabelecimento`. Os contatos visíveis e links são derivados dessa configuração.

## Imagens e identidade

Coloque a fotografia em `assets/img/` e defina, por exemplo, `imagem: 'assets/img/x-salada.webp'`. Prefira WebP/AVIF comprimido. A interface define dimensões, carregamento lazy e texto alternativo; imagens ausentes não impedem a compra. A pasta vazia não é armazenada pelo Git: ela passará a integrar o repositório quando receber uma imagem.

A logo oficial do cabeçalho usa `logotopo.png`, preservando proporção e transparência, com altura máxima de 60 px no desktop e 50 px no celular. `favicon.png` contém somente o hambúrguer e também é referenciado como Apple Touch Icon. Os PNGs originais foram preservados; mantenha ambos na raiz ao publicar. Os metadados Open Graph básicos estão no HTML. Ao definir o domínio e uma imagem oficial de compartilhamento, acrescente `og:url` e `og:image` com os endereços públicos correspondentes.

## Fluxo do pedido

Escolha o produto, quantidade (1 a 99), adicionais e observações (até 300 caracteres). Revise ou edite o carrinho, informe nome, telefone opcional e pagamento (Dinheiro, PIX ou Cartão). Todos os pedidos são para **Retirada no local**, no Cláudio Lanches. O formulário não coleta endereço e o recebimento é fixo na mensagem do WhatsApp. Dinheiro com troco exige valor maior que o total dos produtos; use `100,00` ou `100.00`, sem separador de milhar.

Limpar manualmente o carrinho exige confirmação. Na finalização, após validar o formulário e construir a URL completa com a mensagem codificada por `encodeURIComponent`, o pedido é encerrado: carrinho e sua chave no localStorage são removidos, os formulários são reiniciados e a interface volta para 0 itens e R$ 0,00. Só então o WhatsApp abre na mesma aba usando a URL já pronta, sem envio automático. Ao retornar, o cliente pode começar um novo pedido. Erros de validação preservam o carrinho. A confirmação do pedido depende do estabelecimento. Não há chave PIX cadastrada.

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

Dados e interface estão separados para facilitar uma futura fonte de dados ou painel administrativo. Não foram implementados combos, cupons, PWA ou outras funções futuras.

Para adicionar patrocinadores, crie uma lista própria de dados e uma função de renderização independente, inserindo a seção antes do rodapé apenas quando estiver habilitada e houver conteúdo. Hoje não existe anúncio nem espaço reservado visível.

Uma migração para outro servidor estático exige apenas copiar os arquivos mantendo a estrutura; o frontend não depende de recursos exclusivos da Vercel.

## Verificação de desenvolvimento

`tests/verify.cjs` é uma ferramenta opcional de teste, não carregada pela página. Se houver Node.js e Chrome instalados, execute `node tests/verify.cjs`. Para outro caminho do Chrome, defina `CHROME_PATH`. O script usa um perfil temporário isolado dentro de `tests/`, removido ao concluir e Chrome headless, intercepta a navegação ao WhatsApp sem enviar mensagens e grava `tests/RESULTADOS.md` e capturas em `tests/screenshots/`.

Os testes cobrem cálculos, adicionais, quantidade, edição, carrinho vazio, localStorage, retirada obrigatória, ausência de opção de entrega e campos de endereço, Dinheiro com e sem troco, PIX, Cartão, validação de troco, caracteres especiais e ausência de transbordamento horizontal em 320, 375, 390, 430, 768 e 1280 px. A aplicação não precisa de Node.js para funcionar. A pasta `tests/` é material de desenvolvimento e pode ficar fora dos arquivos enviados para publicação.
