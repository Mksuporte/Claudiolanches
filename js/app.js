'use strict';

(() => {
  const { config: CONFIG, categorias, produtos, adicionais } = CARDAPIO;
  const $ = id => document.getElementById(id);
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const cents = value => Math.round(value * 100);
  const money = value => currency.format(value / 100);
  const findProduct = id => produtos.find(product => product.id === id && product.ativo);
  const findExtra = id => adicionais.find(extra => extra.id === id && extra.ativo);
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const button = (text, className, action) => {
    const element = node('button', text, className);
    element.type = 'button';
    element.addEventListener('click', action);
    return element;
  };
  let cart = [];
  let current = null;
  let editing = -1;
  let quantity = 1;
  let toastTimer;
  let storageWarning = false;

  function notify(text) {
    clearTimeout(toastTimer);
    $('status').textContent = text;
    toastTimer = setTimeout(() => { $('status').textContent = ''; }, 4500);
  }

  // Prices always come from the current catalog, never from localStorage.
  function unitPrice(item) {
    return cents(findProduct(item.productId).preco) + item.extras.reduce((sum, id) => sum + cents(findExtra(id).preco), 0);
  }
  const itemTotal = item => unitPrice(item) * item.quantity;
  const total = () => cart.reduce((sum, item) => sum + itemTotal(item), 0);

  function restoreCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG.storageKey));
      if (!saved) return;
      if (!Number.isFinite(saved.savedAt) || Date.now() - saved.savedAt > CONFIG.validadeHoras * 3600000 || !Array.isArray(saved.items)) {
        localStorage.removeItem(CONFIG.storageKey);
        return;
      }
      cart = saved.items.slice(0, 100).filter(item => item && findProduct(item.productId) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99).map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        extras: findProduct(item.productId).adicionaisPermitidos && Array.isArray(item.extras) ? [...new Set(item.extras.filter(id => findExtra(id)))] : [],
        notes: typeof item.notes === 'string' ? item.notes.slice(0, 300) : ''
      }));
    } catch {
      notify('Não foi possível recuperar o pedido salvo. Você pode montar um novo pedido.');
    }
  }

  function persistCart() {
    try {
      if (cart.length) localStorage.setItem(CONFIG.storageKey, JSON.stringify({ savedAt: Date.now(), items: cart }));
      else localStorage.removeItem(CONFIG.storageKey);
    } catch {
      storageWarning = true;
    }
  }

  function renderProducts(category = 'todos') {
    $('products').replaceChildren();
    const groups = categorias.filter(group => group.id !== 'todos' && (category === 'todos' || group.id === category));
    let count = 0;
    for (const group of groups) {
      const list = (group.id === 'adicionais' ? adicionais : produtos).filter(product => product.ativo && product.categoria === group.id);
      count += list.length;
      const section = node('section');
      const title = node('h3', group.nome, 'group-title');
      section.append(title);
      if (group.id === 'adicionais') section.append(node('p', 'Acrescente estes ingredientes ao personalizar seu lanche ou cachorro-quente.', 'muted'));
      const grid = node('div', undefined, 'product-grid');
      for (const product of list) {
        const card = node('article', undefined, 'product-card');
        if (product.imagem) {
          const img = node('img');
          img.src = product.imagem; img.alt = product.nome; img.loading = 'lazy'; img.width = 320; img.height = 160;
          img.addEventListener('error', () => img.remove());
          card.append(img);
        }
        card.append(node('h3', product.nome));
        const description = product.descricao || (product.subcategoria ? `Cerveja · ${product.subcategoria}` : group.id === 'adicionais' ? 'Adicional por unidade do produto.' : 'Escolha a quantidade e informe sua preferência nas observações.');
        card.append(node('p', description));
        const bottom = node('div', undefined, 'card-bottom');
        bottom.append(node('span', money(cents(product.preco)), 'price'));
        const add = button(group.id === 'adicionais' ? 'Escolher lanche' : '+ Adicionar', 'add-button', () => {
          if (group.id === 'adicionais') {
            selectCategory('lanches');
            $('cardapio').scrollIntoView();
            notify('Escolha um lanche para incluir seus adicionais.');
          } else openProduct(product);
        });
        add.setAttribute('aria-label', group.id === 'adicionais' ? `Escolher lanche para adicionar ${product.nome}` : `Adicionar ${product.nome}${product.subcategoria ? ' · ' + product.subcategoria : ''}`);
        bottom.append(add); card.append(bottom); grid.append(card);
      }
      section.append(grid); $('products').append(section);
    }
    $('product-count').textContent = `${count} opções`;
  }

  function selectCategory(id) {
    for (const element of $('categories').children) element.setAttribute('aria-pressed', String(element.dataset.category === id));
    renderProducts(id);
  }

  function draft() {
    return { productId: current.id, quantity, extras: [...$('extras').querySelectorAll('input:checked')].map(input => input.value), notes: $('notes').value.trim().slice(0, 300) };
  }

  function updateItemSummary() {
    const item = draft();
    $('quantity').textContent = quantity;
    $('less').disabled = quantity <= 1;
    $('more').disabled = quantity >= 99;
    $('item-summary').replaceChildren();
    const extraPrice = unitPrice(item) - cents(current.preco);
    for (const [label, value] of [['Preço base', money(cents(current.preco))], ['+ Adicionais por unidade', money(extraPrice)], ['Valor unitário', money(unitPrice(item))], [`Subtotal · ${quantity} ${quantity === 1 ? 'unidade' : 'unidades'}`, money(itemTotal(item))]]) {
      const row = node('p'); row.append(node('span', label), node('span', value)); $('item-summary').append(row);
    }
  }

  function openProduct(product, index = -1) {
    current = product; editing = index;
    const item = index >= 0 ? cart[index] : null;
    quantity = item ? item.quantity : 1;
    $('product-title').textContent = product.nome;
    $('product-description').textContent = product.descricao || product.subcategoria || '';
    $('product-price').textContent = money(cents(product.preco));
    $('notes').value = item ? item.notes : '';
    $('extras').replaceChildren();
    $('extras-field').hidden = !product.adicionaisPermitidos;
    if (product.adicionaisPermitidos) {
      for (const extra of adicionais.filter(extra => extra.ativo)) {
        const label = node('label', undefined, 'extra-option');
        const input = node('input'); input.type = 'checkbox'; input.value = extra.id; input.checked = Boolean(item && item.extras.includes(extra.id));
        input.addEventListener('change', updateItemSummary);
        label.append(input, node('span', extra.nome), node('span', `+ ${money(cents(extra.preco))}`)); $('extras').append(label);
      }
    }
    $('save-item').textContent = item ? 'Salvar alterações' : 'Adicionar ao pedido';
    updateItemSummary(); $('product-dialog').showModal();
  }

  function renderCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('cart-label').textContent = `Ver pedido · ${count} ${count === 1 ? 'item' : 'itens'}`;
    for (const id of ['cart-total', 'checkout-total', 'final-total']) $(id).textContent = money(total());
    $('cart-items').replaceChildren();
    $('clear-cart').hidden = !cart.length;
    $('checkout-button').disabled = !cart.length;
    if (!cart.length) $('cart-items').append(node('p', 'Seu pedido está vazio. Que tal escolher seu primeiro lanche?', 'empty'));
    cart.forEach((item, index) => {
      const product = findProduct(item.productId);
      const row = node('article', undefined, 'cart-item');
      row.append(node('h3', `${item.quantity}× ${product.nome}${product.subcategoria ? ' · ' + product.subcategoria : ''}`));
      if (item.extras.length) row.append(node('p', `Adicionais por unidade: ${item.extras.map(id => `${findExtra(id).nome} (${money(cents(findExtra(id).preco))})`).join(', ')}`));
      if (item.notes) row.append(node('p', `Observação: ${item.notes}`));
      row.append(node('p', `Valor unitário com adicionais: ${money(unitPrice(item))}`), node('p', `Subtotal: ${money(itemTotal(item))}`, 'item-total'));
      const actions = node('div', undefined, 'item-actions');
      actions.append(button('Editar', 'text-button', () => openProduct(product, index)), button('Remover', 'text-button', () => {
        cart.splice(index, 1); persistCart(); renderCart(); $('cart-title').tabIndex = -1; $('cart-title').focus();
      }));
      row.append(actions); $('cart-items').append(row);
    });
  }

  function toggleCheckoutFields() {
    const delivery = $('receipt').value === 'Entrega';
    $('address-fields').hidden = !delivery; $('address-fields').disabled = !delivery;
    const cash = $('payment').value === 'Dinheiro';
    $('cash-fields').hidden = !cash;
    $('needs-change').disabled = !cash;
    const change = cash && $('needs-change').value === 'Sim';
    $('change-field').hidden = !change; $('change').disabled = !change;
  }

  function parseAmount(value) {
    const cleaned = value.trim();
    if (!/^\d{1,7}([,.]\d{1,2})?$/.test(cleaned)) return NaN;
    return cents(Number(cleaned.replace(',', '.')));
  }

  function validateCheckout() {
    for (const id of ['customer', 'street', 'number', 'neighborhood', 'change']) {
      $(id + '-error').textContent = ''; $(id).removeAttribute('aria-invalid');
    }
    $('checkout-error').textContent = '';
    let firstInvalid;
    const error = (id, message) => {
      $(id + '-error').textContent = message; $(id).setAttribute('aria-invalid', 'true'); firstInvalid ||= $(id);
    };
    if (!cart.length) { $('checkout-error').textContent = 'Adicione pelo menos um produto ao pedido.'; return null; }
    const values = Object.fromEntries(new FormData($('checkout-form')));
    Object.keys(values).forEach(key => { values[key] = values[key].trim(); });
    if (!values.customer) error('customer', 'Informe seu nome para identificar o pedido.');
    if (values.receipt === 'Entrega') {
      for (const [id, text] of [['street', 'Informe a rua da entrega.'], ['number', 'Informe o número ou s/n.'], ['neighborhood', 'Informe o bairro da entrega.']]) if (!values[id]) error(id, text);
    }
    if (values.payment === 'Dinheiro' && values.needsChange === 'Sim') {
      values.changeCents = parseAmount(values.change || '');
      if (!Number.isFinite(values.changeCents) || values.changeCents <= total()) error('change', 'Informe um valor para troco maior que o total dos produtos.');
    }
    if (firstInvalid) { firstInvalid.focus(); return null; }
    return values;
  }

  function buildMessage(values) {
    const lines = [`Olá! Gostaria de fazer um pedido no *${CONFIG.estabelecimento}* 🍔`, '', '*PEDIDO*', ''];
    for (const item of cart) {
      const product = findProduct(item.productId);
      lines.push(`${item.quantity}x ${product.nome}${product.subcategoria ? ' · ' + product.subcategoria : ''}`, `Preço base: ${money(cents(product.preco))} cada`);
      if (item.extras.length) {
        lines.push('Adicionais por unidade:');
        for (const id of item.extras) lines.push(`+ ${findExtra(id).nome} — ${money(cents(findExtra(id).preco))}`);
      }
      lines.push(`Valor unitário com adicionais: ${money(unitPrice(item))}`);
      if (item.notes) lines.push(`Observação: ${item.notes}`);
      lines.push(`Subtotal: ${money(itemTotal(item))}`, '');
    }
    lines.push('-------------------------', `*TOTAL DOS PRODUTOS: ${money(total())}*`, '-------------------------', '', '*CLIENTE*', `Nome: ${values.customer}`);
    if (values.phone) lines.push(`Telefone: ${values.phone}`);
    lines.push('', '*RECEBIMENTO*', values.receipt);
    if (values.receipt === 'Entrega') {
      lines.push('Endereço:', `${values.street}, ${values.number}`, `Bairro: ${values.neighborhood}`);
      if (values.complement) lines.push(`Complemento: ${values.complement}`);
      if (values.reference) lines.push(`Referência: ${values.reference}`);
      lines.push('Taxa de entrega, quando aplicável, será confirmada pelo estabelecimento.');
    }
    lines.push('', '*PAGAMENTO*', values.payment);
    if (values.payment === 'Dinheiro') lines.push(values.needsChange === 'Sim' ? `Troco para: ${money(values.changeCents)}` : 'Não precisa de troco.');
    lines.push('', `Pedido realizado pelo Cardápio Digital ${CONFIG.estabelecimento}.`);
    return lines.join('\n');
  }

  for (const category of categorias) {
    const element = button(category.nome, '', () => { selectCategory(category.id); $('cardapio').scrollIntoView(); });
    element.dataset.category = category.id; element.setAttribute('aria-pressed', String(category.id === 'todos')); $('categories').append(element);
  }
  document.querySelectorAll('[data-close]').forEach(element => element.addEventListener('click', () => $(element.dataset.close).close()));
  const whatsappUrl = `https://wa.me/${CONFIG.whatsapp}`;
  document.querySelectorAll('[data-whatsapp]').forEach(element => { element.href = whatsappUrl; });
  $('footer-whatsapp').href = whatsappUrl;
  $('footer-whatsapp').textContent = CONFIG.whatsapp.slice(2).replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  $('footer-phone').href = `tel:+55${CONFIG.telefone}`;
  $('footer-phone').textContent = CONFIG.telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  $('less').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); updateItemSummary(); });
  $('more').addEventListener('click', () => { quantity = Math.min(99, quantity + 1); updateItemSummary(); });
  $('product-form').addEventListener('submit', event => {
    event.preventDefault();
    if (editing < 0 && cart.length >= 100) { notify('Seu pedido já tem 100 itens diferentes. Edite um item existente.'); return; }
    if (editing >= 0) cart[editing] = draft(); else cart.push(draft());
    persistCart(); renderCart(); $('product-dialog').close();
    notify(storageWarning ? 'Item salvo no pedido. Este navegador não permite guardar o carrinho após atualizar.' : editing >= 0 ? 'Pedido atualizado.' : 'Adicionado ao seu pedido!');
  });
  $('open-cart').addEventListener('click', () => { renderCart(); $('cart-dialog').showModal(); });
  $('clear-cart').addEventListener('click', () => $('clear-dialog').showModal());
  $('confirm-clear').addEventListener('click', () => { cart = []; persistCart(); renderCart(); $('clear-dialog').close(); });
  $('checkout-button').addEventListener('click', () => {
    if (!cart.length) return;
    toggleCheckoutFields(); $('checkout-dialog').showModal();
  });
  for (const id of ['receipt', 'payment', 'needs-change']) $(id).addEventListener('change', toggleCheckoutFields);
  $('checkout-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = validateCheckout();
    if (!values) return;
    // Same-tab navigation avoids popup blocking; the cart is retained when returning.
    window.location.assign(`${whatsappUrl}?text=${encodeURIComponent(buildMessage(values))}`);
  });
  restoreCart(); renderProducts(); renderCart(); toggleCheckoutFields();
})();
