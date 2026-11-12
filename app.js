(() => {
  'use strict';
  // API PHP (utilisée seulement si un serveur PHP + MySQL est disponible)
  const API_PRODUCTS = 'php/products.php';
  const API_ORDER = 'php/order.php';

  // Données de secours : le site fonctionne seul sur GitHub Pages
  const FALLBACK = [
    {id:1,category:'Raquettes',name:'Elite Gold',price:289,image:'images/racket.jpg'},
    {id:2,category:'Balles',name:'Premium Balls',price:25,image:'images/balls.jpg'},
    {id:3,category:'Sacs',name:'Black Edition',price:119,image:'images/bag.jpg'},
    {id:4,category:'Chaussures',name:'Court Pro',price:199,image:'images/shoes.jpg'}
  ];

  let products = FALLBACK;
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('pa_cart')) || {}; } catch (e) { cart = {}; }

  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => Number(n) + ' DT';
  const save = () => { try { localStorage.setItem('pa_cart', JSON.stringify(cart)); } catch (e) {} };
  const find = id => products.find(p => p.id === id);

  async function loadProducts() {
    try {
      const r = await fetch(API_PRODUCTS, {headers:{Accept:'application/json'}});
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      if (Array.isArray(data) && data.length) {
        products = data.map(p => ({id:+p.id, category:p.category, name:p.name, price:+p.price, image:p.image}));
      }
    } catch (e) { /* GitHub Pages : on garde les données locales */ }
    renderProducts(); renderCart();
  }

  function renderProducts() {
    $('#products').innerHTML = products.map(p => `
      <article class="card">
        <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
        <span class="cat">${esc(p.category)}</span>
        <h3>${esc(p.name)}</h3>
        <div class="price">${money(p.price)}</div>
        <button class="btn" data-add="${p.id}">Ajouter au panier</button>
      </article>`).join('');
  }

  function renderCart() {
    const ids = Object.keys(cart).map(Number).filter(id => find(id));
    const count = ids.reduce((s, id) => s + cart[id], 0);
    $('#cart-count').textContent = count;
    const box = $('#cart'), form = $('#order-form');
    if (!ids.length) { box.innerHTML = '<p class="empty">Votre panier est vide.</p>'; form.hidden = true; return; }
    let total = 0;
    const rows = ids.map(id => {
      const p = find(id), line = p.price * cart[id]; total += line;
      return `<tr>
        <td><img src="${esc(p.image)}" alt=""></td>
        <td>${esc(p.name)}<br><small class="muted">${esc(p.category)}</small></td>
        <td class="hide-m">${money(p.price)}</td>
        <td class="qty"><button data-dec="${id}">−</button><span>${cart[id]}</span><button data-inc="${id}">+</button></td>
        <td>${money(line)}</td>
        <td><button class="rm" data-rm="${id}" aria-label="Supprimer">×</button></td></tr>`;
    }).join('');
    box.innerHTML = `<table><thead><tr><th></th><th>Produit</th><th class="hide-m">Prix</th><th>Qté</th><th>Total</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      <p class="total">Total : <strong class="gold">${money(total)}</strong></p>`;
    form.hidden = false;
  }

  document.addEventListener('click', e => {
    const t = e.target;
    const add = t.dataset.add, inc = t.dataset.inc, dec = t.dataset.dec, rm = t.dataset.rm;
    if (add) { cart[add] = (cart[add] || 0) + 1; $('#order-msg').textContent = ''; }
    else if (inc) cart[inc]++;
    else if (dec) { cart[dec]--; if (cart[dec] <= 0) delete cart[dec]; }
    else if (rm) delete cart[rm];
    else return;
    save(); renderCart();
  });

  $('#burger').addEventListener('click', () => $('#menu').classList.toggle('open'));
  $('#menu').addEventListener('click', () => $('#menu').classList.remove('open'));

  $('#order-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('#order-msg');
    const f = new FormData(e.target);
    const payload = {
      customer:{name:f.get('name').trim(), phone:f.get('phone').trim(), address:f.get('address').trim()},
      items:Object.keys(cart).map(id => ({id:+id, qty:cart[id]}))
    };
    try {
      const r = await fetch(API_ORDER, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.error || 'Erreur');
      msg.textContent = `Merci ! Commande n°${data.order_id} enregistrée. Total : ${money(data.total)}.`;
    } catch (err) {
      // Mode démonstration (pas de serveur PHP, ex. GitHub Pages)
      try {
        const orders = JSON.parse(localStorage.getItem('pa_orders') || '[]');
        orders.push({...payload, date:new Date().toISOString()});
        localStorage.setItem('pa_orders', JSON.stringify(orders));
      } catch (e2) {}
      msg.textContent = 'Merci ! Commande enregistrée en mode démonstration (projet fictif).';
    }
    cart = {}; save(); e.target.reset(); renderCart();
  });

  renderProducts(); renderCart(); loadProducts();
})();
