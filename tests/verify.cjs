// Optional development check. Node and Chrome are not application dependencies.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = path.join(__dirname, '.browser-profile-' + Date.now());
const proc = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-pipe', '--user-data-dir=' + profile], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'], windowsHide: true });
let sequence = 0, buffer = '', session;
const pending = new Map();
proc.stdio[4].on('data', chunk => {
  buffer += chunk;
  let end;
  while ((end = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
    if (pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id); clearTimeout(timer); pending.delete(message.id);
      message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
    }
  }
});
function send(method, params = {}, target = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => reject(new Error('Timeout: ' + method)), 15000);
    pending.set(id, { resolve, reject, timer });
    proc.stdio[3].write(JSON.stringify({ id, method, params, ...(target ? { sessionId: target } : {}) }) + '\0');
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const click = id => evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
const fill = (id, value) => evaluate(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)}`);
const text = id => evaluate(`document.getElementById(${JSON.stringify(id)}).textContent`);
const change = id => evaluate(`document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('change',{bubbles:true}))`);
const checks = [];
function ok(name, condition) { assert.ok(condition, name); checks.push(name); console.log('PASS ' + name); }
async function ready() {
  for (let i = 0; i < 60; i++) {
    if (await evaluate(`!!document.getElementById('products')?.children.length`)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Page did not render');
}
(async () => {
  const target = await send('Target.createTarget', { url: 'about:blank' }, null);
  session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null)).sessionId;
  await send('Page.enable');
  const root = path.resolve(__dirname, '..');
  await send('Page.navigate', { url: pathToFileURL(path.join(root, 'index.html')).href });
  await ready();
  await evaluate(`document.querySelector('.brand-logo').decode()`);
  ok('Logo oficial única no cabeçalho, com alt e link de início', await evaluate(`(() => { const brand = document.querySelector('.topbar .brand'); return brand.children.length === 1 && brand.firstElementChild.matches('img.brand-logo') && brand.firstElementChild.getAttribute('src') === 'logonova.png' && !document.querySelector('img[src="logotopo.png"]') && brand.textContent.trim() === '' && brand.getAttribute('href') === 'index.html' && brand.firstElementChild.alt === 'Cláudio Lanches' && !document.querySelector('.brand-mark'); })()`));
  ok('Favicon e Apple Touch Icon usam o hambúrguer', await evaluate(`document.querySelector('link[rel="icon"]').getAttribute('href') === 'favicon.png' && document.querySelector('link[rel="icon"]').type === 'image/png' && document.querySelector('link[rel="apple-touch-icon"]').getAttribute('href') === 'favicon.png'`));
  ok('53 produtos e 6 adicionais renderizados em arquivo local', await evaluate(`document.querySelectorAll('.product-card').length===59`));
  ok('HTML: IDs únicos, labels e referências locais válidas', await evaluate(`(() => { const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return new Set(ids).size===ids.length && [...document.querySelectorAll('label[for]')].every(l=>document.getElementById(l.htmlFor)) && document.compatMode==='CSS1Compat';})()`));
  await click('open-cart');
  ok('Carrinho vazio bloqueia finalização', await evaluate(`document.getElementById('checkout-button').disabled`));
  await evaluate(`document.getElementById('cart-dialog').close()`);
  fs.mkdirSync(path.join(root, 'tests', 'screenshots'), { recursive: true });
  await evaluate(`document.querySelector('.footer-protechcore-logo').decode()`);
  ok('Footer copyright and official logo without duplicate text or link', await evaluate(`(() => { const f=document.querySelector('footer'); const s=f.querySelector('.footer-signature'); const i=s.querySelector('img'); return f.querySelector('.footer-copyright').textContent === '\u00a9 2026 Cl\u00e1udio Lanches. Todos os direitos reservados.' && s.textContent.trim() === 'Tecnologia e desenvolvimento por' && i.alt === 'ProtechCore' && i.getAttribute('src') === 'logoprotechcore.png' && s.querySelectorAll('img').length === 1 && !s.querySelector('a') && !f.querySelector('.developer-name') && f.querySelectorAll('a').length === 2; })()`));
  for (const width of [320, 375, 390, 430, 768, 1280]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    ok('Sem rolagem horizontal em ' + width + 'px', await evaluate(`document.documentElement.scrollWidth <= innerWidth`));
    ok('Logo proporcional, inteira e sem conflito com WhatsApp em ' + width + 'px', await evaluate(`(() => { const image = document.querySelector('.brand-logo'); const rect = image.getBoundingClientRect(); const link = document.querySelector('.topbar [data-whatsapp]').getBoundingClientRect(); return image.naturalWidth === 1536 && image.naturalHeight === 1024 && Math.abs(rect.width / rect.height - 1536 / 1024) < 0.02 && getComputedStyle(image).objectFit === 'contain' && Math.abs(rect.height - (innerWidth <= 600 ? 58 : 80)) < 0.1 && rect.left >= 0 && rect.right < link.left && link.right <= innerWidth; })()`));
    if ([390, 1280].includes(width)) {
      const headerShot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height: 100, scale: 1 } });
      fs.writeFileSync(path.join(root, 'tests', 'screenshots', 'cabecalho-' + width + '.png'), Buffer.from(headerShot.data, 'base64'));
    }
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(root, 'tests', 'screenshots', 'menu-' + width + '.png'), Buffer.from(shot.data, 'base64'));
    ok('Rodapé centralizado e sem transbordamento em ' + width + 'px', await evaluate(`(() => { const footer = document.querySelector('footer'); return getComputedStyle(footer).textAlign === 'center' && footer.scrollWidth <= footer.clientWidth && [...footer.children].every(e => e.getBoundingClientRect().right <= innerWidth); })()`));
    ok('ProtechCore logo proportional and centered at ' + width + 'px', await evaluate(`(() => { const i=document.querySelector('.footer-protechcore-logo'); const r=i.getBoundingClientRect(); const f=document.querySelector('footer').getBoundingClientRect(); const c=getComputedStyle(i); return i.naturalWidth===1318 && i.naturalHeight===1193 && Math.abs(r.width-(innerWidth<=600?80:100))<1 && Math.abs(r.width/r.height-1318/1193)<0.01 && Math.abs((r.left+r.right)-(f.left+f.right))<2 && c.objectFit==='contain'; })()`));
    if ([390, 1280].includes(width)) {
      const footerBounds = await evaluate(`(() => { const r = document.querySelector('footer').getBoundingClientRect(); return {x:0, y:r.top + scrollY, width:innerWidth, height:r.height, scale:1}; })()`);
      const footerShot = await send('Page.captureScreenshot', { format:'png', captureBeyondViewport:true, clip:footerBounds });
      fs.writeFileSync(path.join(root, 'tests', 'screenshots', 'rodape-' + width + '.png'), Buffer.from(footerShot.data, 'base64'));
    }
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await evaluate(`document.querySelector('[aria-label="Adicionar X-salada"]').click()`);
  await evaluate(`for(const input of document.querySelectorAll('#extras input'))if(['adicionais-bacon','adicionais-hamburguer'].includes(input.value)){input.checked=true;input.dispatchEvent(new Event('change'));}`);
  ok('X-salada + bacon + hambúrguer = R$ 32,50', (await text('item-summary')).includes('32,50'));
  await click('more');
  ok('Quantidade multiplica adicionais: R$ 65,00', (await text('item-summary')).includes('65,00'));
  await click('less');
  ok('Quantidade mínima é 1', await evaluate(`document.getElementById('less').disabled`));
  const modalShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(root, 'tests', 'screenshots', 'personalizacao-390.png'), Buffer.from(modalShot.data, 'base64'));
  await fill('notes', 'sem tomate & pão <especial> 🍔');
  await click('save-item');
  await evaluate(`document.querySelector('[aria-label="Adicionar Refrigerante lata"]').click()`);
  ok('Bebida não permite adicionais', await evaluate(`document.getElementById('extras-field').hidden && document.querySelectorAll('#extras input').length===0`));
  await click('more'); await click('save-item');
  ok('Total do exemplo = R$ 44,50', (await text('cart-total')).includes('44,50'));
  const savedOrder = await evaluate(`localStorage.getItem(CARDAPIO.config.storageKey)`);
  ok('Pedido em montagem está persistido', JSON.parse(savedOrder).items.length === 2);
  await send('Page.reload'); await ready();
  ok('localStorage restaura itens e valores após atualizar', (await text('cart-total')).includes('44,50'));
  await click('open-cart');
  ok('Observação especial permanece texto', await evaluate(`document.getElementById('cart-items').textContent.includes('<especial>') && !document.querySelector('#cart-items especial')`));
  await evaluate(`document.querySelector('#cart-items .text-button').click()`); await click('more'); await click('save-item');
  ok('Editar recalcula total = R$ 77,00', (await text('cart-total')).includes('77,00'));
  await evaluate(`document.querySelector('#cart-items .text-button').click()`); await click('less'); await click('save-item');
  await click('checkout-button');
  await evaluate(`document.getElementById('checkout-form').requestSubmit()`);
  ok('Nome obrigatório com erro próximo ao campo', (await text('customer-error')).length > 0);
  ok('Erro no nome preserva carrinho e localStorage', (await text('cart-total')).includes('44,50') && await evaluate(`JSON.parse(localStorage.getItem(CARDAPIO.config.storageKey)).items.length === 2`));
  await fill('customer', 'João & Cláudia');
  ok('Recebimento fixo visível na finalização', (await text('checkout-title')) === 'Retirada no local');
  ok('Sem seletor de recebimento ou campos de endereço no DOM', await evaluate(`!document.querySelector('#receipt, #address-fields, #street, #number, #neighborhood, #complement, #reference, [autocomplete^="address-"]')`));
  ok('Sem opção Entrega ou aviso de taxa na interface', await evaluate(`![...document.querySelectorAll('option')].some(option => option.textContent === 'Entrega') && !document.body.textContent.includes('Taxa de entrega')`));
  ok('Formulário só contém identificação e pagamento', await evaluate(`[...document.getElementById('checkout-form').elements].filter(e => e.name).every(e => ['customer', 'phone', 'payment', 'needsChange', 'change'].includes(e.name))`));
  await fill('payment', 'Dinheiro'); await change('payment'); await fill('needs-change', 'Sim'); await change('needs-change');
  for (const value of ['', 'abc', '44,50', '40']) {
    await fill('change', value); await evaluate(`document.getElementById('checkout-form').requestSubmit()`);
    ok('Troco inválido rejeitado: ' + JSON.stringify(value), (await text('change-error')).length > 0);
    ok('Troco inválido preserva pedido: ' + JSON.stringify(value), (await text('cart-total')).includes('44,50') && await evaluate(`JSON.parse(localStorage.getItem(CARDAPIO.config.storageKey)).items.length === 2`));
  }
  await fill('change', '100,00');
  // Capture generated navigation without contacting WhatsApp or sending a message.
  await send('Page.setWebLifecycleState', { state: 'active' });
  await send('Fetch.enable', { patterns: [{ urlPattern: 'https://wa.me/*', requestStage: 'Request' }] });
  let captured;
  const intercept = chunk => {
    // Events may span chunks; use an independent parser for this observer.
    intercept.buffer = (intercept.buffer || '') + chunk;
    let end;
    while ((end = intercept.buffer.indexOf('\0')) >= 0) {
      const message = JSON.parse(intercept.buffer.slice(0, end)); intercept.buffer = intercept.buffer.slice(end + 1);
      if (message.method === 'Fetch.requestPaused') {
        captured = message.params.request.url;
        send('Fetch.failRequest', { requestId: message.params.requestId, errorReason: 'Aborted' }).catch(() => {});
      }
    }
  };
  proc.stdio[4].on('data', intercept);
  await evaluate(`document.getElementById('checkout-form').requestSubmit()`);
  for (let i=0; !captured && i<40; i++) await new Promise(resolve=>setTimeout(resolve,50));
  const message = new URL(captured).searchParams.get('text');
  async function checkReset() {
    ok('Finalização remove apenas a chave do carrinho', await evaluate(`localStorage.getItem(CARDAPIO.config.storageKey) === null`));
    ok('Interface volta a zero antes de sair do site', await evaluate(`document.getElementById('cart-label').textContent === 'Ver pedido · 0 itens' && ['cart-total','checkout-total','final-total'].every(id => document.getElementById(id).textContent.includes('0,00')) && document.getElementById('checkout-button').disabled && !document.querySelector('#cart-items .cart-item')`));
    ok('Formulários voltam ao estado inicial', await evaluate(`['customer','phone','change','notes'].every(id => document.getElementById(id).value === '') && document.getElementById('payment').value === 'PIX' && document.getElementById('needs-change').value === 'Não' && document.getElementById('cash-fields').hidden && document.getElementById('change').disabled && !document.querySelector('dialog[open]')`));
  }
  await checkReset();
  ok('Mensagem preserva todos os itens e subtotais após limpeza', message.includes('1x X-salada') && message.includes('2x Refrigerante lata') && message.includes('32,50') && message.includes('12,00') && message.includes('44,50'));
  ok('WhatsApp: dinheiro, troco, total, adicionais, observação e caracteres especiais', message.includes('*PAGAMENTO*\nDinheiro') && message.includes('44,50') && message.includes('100,00') && message.includes('João & Cláudia') && message.includes('<especial> 🍔') && message.includes('Hambúrguer'));
  function checkPickup(message, payment) {
    ok(payment + ': mensagem sempre contém Retirada no local', message.includes('*RECEBIMENTO*\nRetirada no local'));
    ok(payment + ': mensagem sem dados de entrega', !/endereço|rua|número|bairro|complemento|referência|taxa de entrega|entrega/i.test(message));
  }
  checkPickup(message, 'Dinheiro com troco');
  for (const payment of ['PIX', 'Cartão', 'Dinheiro']) {
    await send('Page.navigate', { url: pathToFileURL(path.join(root, 'index.html')).href }); await ready();
    ok(payment + ': retorno encontra pedido vazio', (await text('cart-label')) === 'Ver pedido · 0 itens');
    await evaluate(`document.querySelector('[aria-label="Adicionar X-salada"]').click()`);
    await click('save-item');
    ok(payment + ': novo pedido pode ser iniciado e persistido', (await text('cart-total')).includes('20,00') && await evaluate(`JSON.parse(localStorage.getItem(CARDAPIO.config.storageKey)).items.length === 1`));
    await click('open-cart'); await click('checkout-button'); await fill('customer', 'Maria');
    await fill('payment', payment); await change('payment');
    if (payment === 'Dinheiro') { await fill('needs-change', 'Não'); await change('needs-change'); }
    ok(payment + ': troco não solicitado fica desabilitado', await evaluate(`document.getElementById('change').disabled`));
    captured = null; await evaluate(`document.getElementById('checkout-form').requestSubmit()`);
    for (let i=0; !captured && i<40; i++) await new Promise(resolve=>setTimeout(resolve,50));
    const pickup = new URL(captured).searchParams.get('text');
    await checkReset();
    ok(payment + ': finalização sem troco', pickup.includes('*PAGAMENTO*\n' + payment) && !pickup.includes('Troco para:') && (payment !== 'Dinheiro' || pickup.includes('Não precisa de troco.')));
    checkPickup(pickup, payment);
  }
  await send('Page.navigate', { url: pathToFileURL(path.join(root, 'index.html')).href }); await ready();
  // Rebuild a separate order to retain the manual removal/clear regression checks.
  await evaluate(`localStorage.setItem(CARDAPIO.config.storageKey, ${JSON.stringify(savedOrder)})`);
  await send('Page.reload'); await ready(); await click('open-cart');
  await evaluate(`document.querySelector('#cart-items .item-actions button:last-child').click()`);
  ok('Remover item recalcula total', (await text('cart-total')).includes('12,00'));
  await click('clear-cart'); ok('Limpar exige confirmação', await evaluate(`document.getElementById('clear-dialog').open`) && (await text('cart-total')).includes('12,00'));
  await click('confirm-clear'); ok('Limpar remove carrinho e persistência', await evaluate(`document.getElementById('checkout-button').disabled && localStorage.getItem(CARDAPIO.config.storageKey)===null`));
  await evaluate(`localStorage.setItem(CARDAPIO.config.storageKey,'invalid json')`); await send('Page.reload'); await ready();
  ok('Storage corrompido não interrompe aplicação', (await text('cart-total')).includes('0,00'));
  fs.writeFileSync(path.join(root, 'tests', 'RESULTADOS.md'), '# Verificação local\n\nChrome headless, arquivo local, ' + new Date().toISOString() + '.\nNenhuma mensagem enviada e nenhum deploy executado.\n\n' + 'Executados: ' + checks.length + ' | Passaram: ' + checks.length + ' | Falharam: 0\n\n' + checks.map(name => '- PASS: ' + name).join('\n') + '\n\nA validação estrutural de HTML não substitui um validador de conformidade W3C.\n');
})().catch(error => { console.error(error); process.exitCode=1; }).finally(async () => {
  try { await send('Browser.close', {}, null); } catch {}
  proc.kill();
  // Only remove the isolated profile created inside this project's tests directory.
  if (path.dirname(path.resolve(profile)) === path.resolve(__dirname) && path.basename(profile).startsWith('.browser-profile-')) {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});

