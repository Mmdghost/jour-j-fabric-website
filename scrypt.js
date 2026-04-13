// Loader with fallback
const hideLoader = () => {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.add("hidden");
};
window.addEventListener("load", () => setTimeout(hideLoader, 2200));
window.addEventListener("DOMContentLoaded", () => setTimeout(hideLoader, 1200));

// Cursor
const cur = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;
if (cur && ring) {
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + "px";
    cur.style.top = my + "px";
  });
  (function anim() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(anim);
  })();
  document
    .querySelectorAll(
      "a,button,.product-card,.cat-item,.feature-item,.process-step,.testimonial-card",
    )
    .forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cur.style.width = "18px";
        cur.style.height = "18px";
        ring.style.width = "56px";
        ring.style.height = "56px";
        ring.style.opacity = ".28";
      });
      el.addEventListener("mouseleave", () => {
        cur.style.width = "10px";
        cur.style.height = "10px";
        ring.style.width = "34px";
        ring.style.height = "34px";
        ring.style.opacity = ".5";
      });
    });
}

// Navbar scroll
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 68);
});

// Mobile menu
function toggleMenu() {
  const m = document.getElementById("mobileMenu");
  if (m) m.classList.toggle("open");
}

// Reveal
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting)
        setTimeout(() => entry.target.classList.add("visible"), i * 72);
    });
  },
  { threshold: 0.08 },
);
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

// Cart state
let cart = [];
let lastOrderSubject = "";
let lastOrderMessage = "";

const OWNER_EMAIL = "albarakshopp@gmail.com";
const OWNER_WHATSAPP = "221771335911";

const CATALOG = [
  {
    name: "Organza Cuivré BF1399",
    cat: "Organza Premium",
    price: 35000,
    ref: "BF1399",
    imgIdx: 0,
  },
  {
    name: "Dentelle Fleurs Bleues",
    cat: "Dentelle Brodée",
    price: 120000,
    ref: "WDC12906",
    imgIdx: 1,
  },
  {
    name: "Broderie Rouge & Vert SN605",
    cat: "Broderie Séquins",
    price: 45000,
    ref: "SN605",
    imgIdx: 2,
  },
  {
    name: "Organza Violet Royal",
    cat: "Soie & Organza",
    price: 90000,
    ref: "",
    imgIdx: 3,
  },
  {
    name: "Dentelle Noire & Or",
    cat: "Dentelle Perles",
    price: 90000,
    ref: "",
    imgIdx: 4,
  },
  {
    name: "Guipure Rouge Roses DCL2843",
    cat: "Broderie Guipure",
    price: 120000,
    ref: "DCL2843",
    imgIdx: 5,
  },
  {
    name: "Dentelle Fleurs Corail DCL2851",
    cat: "Dentelle Colorée",
    price: 90500,
    ref: "DCL2851",
    imgIdx: 6,
  },
  {
    name: "Jacquard Fleurs Roses",
    cat: "Broderie Jacquard",
    price: 110000,
    ref: "",
    imgIdx: 7,
  },
  {
    name: "Voile Damier Gris SVL4797",
    cat: "Voile Damier",
    price: 70500,
    ref: "SVL4797",
    imgIdx: 8,
  },
];

let productImgSrcs = [];
window.addEventListener("DOMContentLoaded", () => {
  productImgSrcs = Array.from(
    document.querySelectorAll(".product-img img"),
  ).map((img) => img.src);
  const navCart = document.querySelector(".nav-cart");
  if (navCart) navCart.addEventListener("click", openCart);
  renderCart();
});

function fmt(n) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function addToCart(btn) {
  const card = btn.closest(".product-card");
  const allCards = Array.from(document.querySelectorAll(".product-card"));
  const idx = allCards.indexOf(card);
  const prod = CATALOG[idx] || CATALOG[0];
  const imgSrc = productImgSrcs[idx] || productImgSrcs[0] || "";
  const key = prod.ref || prod.name;

  const existing = cart.find((i) => (i.ref || i.name) === key);
  if (existing) existing.qty++;
  else cart.push({ ...prod, qty: 1, imgSrc });

  renderCart();
  openCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const emptyEl = document.getElementById("cartEmpty");
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  const badge = document.querySelector(".cart-badge");
  if (!container || !emptyEl || !countEl || !totalEl || !badge) return;

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalAmt = cart.reduce((s, i) => s + i.price * i.qty, 0);
  countEl.textContent = totalQty;
  badge.textContent = totalQty;
  totalEl.textContent = fmt(totalAmt);

  container.querySelectorAll(".cart-item").forEach((el) => el.remove());
  if (cart.length === 0) {
    emptyEl.style.display = "flex";
    return;
  }

  emptyEl.style.display = "none";
  cart.forEach((item, i) => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <img class="cart-item-img" src="${item.imgSrc}" alt="${item.name}"/>
      <div class="cart-item-info">
        <div class="cart-item-cat">${item.cat}</div>
        <div class="cart-item-name">${item.name}</div>
        ${item.ref ? `<div class="cart-item-ref">Réf: ${item.ref}</div>` : ""}
        <div class="cart-item-row">
          <span class="cart-item-price">${fmt(item.price * item.qty)}</span>
          <div style="display:flex;align-items:center;gap:4px">
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
            </div>
            <button class="cart-item-del" onclick="removeItem(${i})" title="Supprimer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
      </div>`;
    container.appendChild(el);
  });
}

function changeQty(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  renderCart();
}

function openCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("drawerOverlay");
  if (!drawer || !overlay) return;
  drawer.classList.add("open");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("drawerOverlay");
  if (!drawer || !overlay) return;
  drawer.classList.remove("open");
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

// Checkout
let promoApplied = false;
const PROMO_CODE = "JJOURJ10";
const PROMO_PCT = 0.1;

function openCheckout() {
  if (cart.length === 0) {
    alert("Votre panier est vide !");
    return;
  }
  closeCart();
  const page = document.getElementById("checkout-page");
  if (!page) return;
  page.classList.add("open");
  document.body.style.overflow = "hidden";
  renderSummary();
}

function closeCheckout() {
  const page = document.getElementById("checkout-page");
  if (page) page.classList.remove("open");
  document.body.style.overflow = "";
  openCart();
}

function renderSummary() {
  const container = document.getElementById("ckSumItems");
  if (!container) return;
  container.innerHTML = "";
  cart.forEach((item) => {
    const el = document.createElement("div");
    el.className = "ck-sum-item";
    el.innerHTML = `
      <img class="ck-sum-img" src="${item.imgSrc}" alt="${item.name}"/>
      <div class="ck-sum-item-info">
        <div class="name">${item.name}</div>
        <div class="qty-price">${item.qty} m × ${fmt(item.price)}</div>
      </div>`;
    container.appendChild(el);
  });
  updateTotals();
}

function updateTotals() {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const disc = promoApplied ? Math.round(sub * PROMO_PCT) : 0;
  const total = sub - disc;
  const subtotalEl = document.getElementById("ck-subtotal");
  const totalEl = document.getElementById("ck-total");
  const promoLine = document.getElementById("ck-promo-line");
  const promoVal = document.getElementById("ck-promo-val");
  const cartTotal = document.getElementById("cartTotal");
  if (subtotalEl) subtotalEl.textContent = fmt(sub);
  if (totalEl) totalEl.textContent = fmt(total);
  if (promoLine) promoLine.style.display = disc > 0 ? "flex" : "none";
  if (promoVal && disc > 0) promoVal.textContent = "−" + fmt(disc);
  if (cartTotal) cartTotal.textContent = fmt(sub);
}

function applyPromo() {
  const input = document.getElementById("promo-input");
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  if (code === PROMO_CODE) {
    promoApplied = true;
    input.value = "✓ " + PROMO_CODE + " (−10%)";
    input.style.color = "var(--rg)";
    updateTotals();
  } else {
    input.value = "";
    input.placeholder = "✗ Code invalide";
  }
}

function showPayFields(type) {
  ["om", "wave", "card", "cash"].forEach((t) => {
    const el = document.getElementById("fields-" + t);
    if (el) el.classList.toggle("visible", t === type);
  });
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 16);
  input.value = v.replace(/(.{4})/g, "$1 ").trim();
}

function buildOrderMessage(orderNum, customer, paymentLabel) {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const disc = promoApplied ? Math.round(sub * PROMO_PCT) : 0;
  const total = sub - disc;
  const lines = cart.map(
    (item, idx) =>
      `${idx + 1}. ${item.name} - ${item.qty}m - ${fmt(item.price * item.qty)}`,
  );
  return [
    `Nouvelle commande ${orderNum}`,
    "",
    "Client:",
    `- Prenom: ${customer.prenom}`,
    `- Nom: ${customer.nom}`,
    `- Telephone: ${customer.tel}`,
    `- Ville: ${customer.ville}`,
    `- Adresse: ${customer.adresse}`,
    `- Paiement: ${paymentLabel}`,
    "",
    "Articles:",
    ...lines,
    "",
    `Sous-total: ${fmt(sub)}`,
    `Remise: ${fmt(disc)}`,
    `Total: ${fmt(total)}`,
  ].join("\n");
}

function sendOrderWhatsapp() {
  const text = encodeURIComponent(lastOrderMessage || "Nouvelle commande");
  window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${text}`, "_blank");
}

function sendOrderEmail() {
  const subject = encodeURIComponent(lastOrderSubject || "Nouvelle commande");
  const body = encodeURIComponent(lastOrderMessage || "Nouvelle commande");
  window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
}

function placeOrder() {
  const prenom = document.getElementById("ck-prenom")?.value.trim() || "";
  const nom = document.getElementById("ck-nom")?.value.trim() || "";
  const tel = document.getElementById("ck-tel")?.value.trim() || "";
  const adresse = document.getElementById("ck-adresse")?.value.trim() || "";
  const ville = document.getElementById("ck-ville")?.value || "";
  const payMethod = document.querySelector('input[name="payment"]:checked');

  if (!prenom || !nom) {
    alert("Veuillez entrer votre prénom et nom.");
    return;
  }
  if (!tel) {
    alert("Veuillez entrer votre numéro de téléphone.");
    return;
  }
  if (!adresse || !ville) {
    alert("Veuillez entrer votre adresse de livraison.");
    return;
  }
  if (!payMethod) {
    alert("Veuillez choisir un mode de paiement.");
    return;
  }

  const num = "JJF-" + Date.now().toString().slice(-6);
  const orderNum = "#" + num;
  document.getElementById("ckFormGrid").style.display = "none";
  document.querySelector(".ck-back").style.display = "none";
  document.querySelector(".ck-header").style.display = "none";
  document.getElementById("orderNum").textContent = orderNum;
  document.getElementById("ckSuccess").classList.add("show");

  const paymentLabel =
    payMethod.closest("label")?.innerText.replace("✓", "").trim() ||
    "Non precise";
  lastOrderSubject = `Commande ${orderNum} - ${prenom} ${nom}`;
  lastOrderMessage = buildOrderMessage(
    orderNum,
    { prenom, nom, tel, ville, adresse },
    paymentLabel,
  );
}

function resetAll() {
  cart = [];
  promoApplied = false;
  renderCart();
  const page = document.getElementById("checkout-page");
  if (page) page.classList.remove("open");
  document.getElementById("ckFormGrid").style.display = "";
  document.querySelector(".ck-back").style.display = "";
  document.querySelector(".ck-header").style.display = "";
  document.getElementById("ckSuccess").classList.remove("show");
  document.body.style.overflow = "";
  const promoInput = document.getElementById("promo-input");
  if (promoInput) {
    promoInput.value = "";
    promoInput.placeholder = "Code promo";
    promoInput.style.color = "";
  }
  const promoLine = document.getElementById("ck-promo-line");
  if (promoLine) promoLine.style.display = "none";
}

// Newsletter
const nlBtn = document.querySelector(".nl-form button");
if (nlBtn) {
  nlBtn.addEventListener("click", () => {
    const inp = document.querySelector(".nl-form input");
    if (inp && inp.value.includes("@")) {
      inp.value = "✓ Bienvenue dans la famille !";
      inp.style.background = "rgba(26,18,18,.2)";
    }
  });
}
