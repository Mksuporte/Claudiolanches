// Optional development check. Node and Chrome are not application dependencies.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const proc = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-pipe', '--user-data-dir=' + path.join(require('node:os').tmpdir(), 'claudio-check-' + Date.now())], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'], windowsHide: true });
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
  ok('53 produtos e 6 adicionais renderizados em arquivo local', await evaluate(`document.querySelectorAll('.product-card').length===59`));
  ok('HTML: IDs únicos, labels e referências locais válidas', await evaluate(`(() => { const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return new Set(ids).size===ids.length && [...document.querySelectorAll('label[for]')].every(l=>document.getElementById(l.htmlFor)) && document.compatMode==='CSS1Compat';})()`));
  await click('open-cart');
  ok('Carrinho vazio bloqueia finalização', await evaluate(`document.getElementById('checkout-button').disabled`));
  await evaluate(`document.getElementById('cart-dialog').close()`);
  fs.mkdirSync(path.join(root, 'tests', 'screenshots'), { recursive: true });
  for (const width of [320, 375, 390, 430, 768, 1280]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    ok('Sem rolagem horizontal em ' + width + 'px', await evaluate(`document.documentElement.scrollWidth <= innerWidth`));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(root, 'tests', 'screenshots', 'menu-' + width + '.png'), Buffer.from(shot.data, 'base64'));
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
  await fill('notes', 'sem tomate & pão <especial> �x�');
  await click('save-item');
  await evaluate(`document.querySelector('[aria-label="Adicionar Refrigerante lata"]').click()`);
  ok('Bebida não permite adicionais', await evaluate(`document.getElementById('extras-field').hidden && document.querySelectorAll('#extras input').length===0`));
  await click('more'); await click('save-item');
  ok('Total do exemplo = R$ 44,50', (await text('cart-total')).includes('44,50'));
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
  await fill('customer', 'João & Cláudia');
  await fill('receipt', 'Entrega'); await change('receipt');
  await evaluate(`document.getElementById('checkout-form').requestSubmit()`);
  ok('Entrega exige rua, número e bairro', (await text('street-error')).length > 0 && (await text('number-error')).length > 0 && (await text('neighborhood-error')).length > 0);
  await fill('street', 'Rua São José'); await fill('number', '123'); await fill('neighborhood', 'Centro');
  await fill('payment', 'Dinheiro'); await change('payment'); await fill('needs-change', 'Sim'); await change('needs-change');
  for (const value of ['', 'abc', '44,50', '40']) {
    await fill('change', value); await evaluate(`document.getElementById('checkout-form').requestSubmit()`);
    ok('Troco inválido rejeitado: ' + JSON.stringify(value), (await text('change-error')).length > 0);
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
  ok('WhatsApp: total, adicionais, acentos, símbolos, entrega e troco', message.includes('44,50') && message.includes('100,00') && message.includes('João & Cláudia') && message.includes('<especial> �x�') && message.includes('Rua São José, 123') && message.includes('Hambúrguer'));
  await send('Page.navigate', { url: pathToFileURL(path.join(root, 'index.html')).href }); await ready();
  await click('open-cart'); await click('checkout-button'); await fill('customer', 'Maria');
  ok('Retirada oculta e desabilita endereço', await evaluate(`document.getElementById('address-fields').hidden && document.getElementById('address-fields').disabled`));
  captured = null; await evaluate(`document.getElementById('checkout-form').requestSubmit()`);
  for (let i=0; !captured && i<40; i++) await new Promise(resolve=>setTimeout(resolve,50));
  const pickup = new URL(captured).searchParams.get('text');
  ok('Retirada + PIX sem endereço ou troco na mensagem', pickup.includes('Retirada') && pickup.includes('PIX') && !pickup.includes('Endereço:') && !pickup.includes('Troco para:'));
  await send('Page.navigate', { url: pathToFileURL(path.join(root, 'index.html')).href }); await ready(); await click('open-cart');
  await evaluate(`document.querySelector('#cart-items .item-actions button:last-child').click()`);
  ok('Remover item recalcula total', (await text('cart-total')).includes('12,00'));
  await click('clear-cart'); ok('Limpar exige confirmação', await evaluate(`document.getElementById('clear-dialog').open`) && (await text('cart-total')).includes('12,00'));
  await click('confirm-clear'); ok('Limpar remove carrinho e persistência', await evaluate(`document.getElementById('checkout-button').disabled && localStorage.getItem(CARDAPIO.config.storageKey)===null`));
  await evaluate(`localStorage.setItem(CARDAPIO.config.storageKey,'invalid json')`); await send('Page.reload'); await ready();
  ok('Storage corrompido não interrompe aplicação', (await text('cart-total')).includes('0,00'));
  fs.writeFileSync(path.join(root, 'tests', 'RESULTADOS.md'), '# Verificação local\n\nChrome headless, arquivo local, ' + new Date().toISOString() + '.\nNenhuma mensagem enviada e nenhum deploy executado.\n\n' + checks.map(name => '- PASS: ' + name).join('\n') + '\n\nA validação estrutural de HTML não substitui um validador de conformidade W3C.\n');
})().catch(error => { console.error(error); process.exitCode=1; }).finally(async () => {
  try { await send('Browser.close', {}, null); } catch {}
  proc.kill();
});

