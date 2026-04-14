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
    price: 45000,
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
    name: "Dentelle Noire & Or",
    cat: "Dentelle Perles",
    price: 90000,
    ref: "DC4521",
    imgIdx: 3,
  },
  {
    name: "Guipure Rouge Roses",
    cat: "Broderie Guipure",
    price: 120000,
    ref: "GR2045",
    imgIdx: 4,
  },
  {
    name: "Dentelle Corail",
    cat: "Dentelle Colorée",
    price: 90500,
    ref: "DC5632",
    imgIdx: 5,
  },
  {
    name: "Jacquard Roses",
    cat: "Broderie Jacquard",
    price: 110000,
    ref: "JR3847",
    imgIdx: 6,
  },
  {
    name: "Voile Damier",
    cat: "Voile Damier",
    price: 70000,
    ref: "VD4156",
    imgIdx: 7,
  },
  {
    name: "Velours Doré Luxe",
    cat: "Velours Premium",
    price: 110000,
    ref: "VLP2401",
    imgIdx: 8,
  },
  {
    name: "Satin Brillant Émeraude",
    cat: "Satin Lisse",
    price: 90000,
    ref: "STN1103",
    imgIdx: 9,
  },
  {
    name: "Damassé Pivoine Bordeaux",
    cat: "Damassé Floral",
    price: 95000,
    ref: "DMF3215",
    imgIdx: 10,
  },
  {
    name: "Mousseline Dorée Iridée",
    cat: "Mousseline Fine",
    price: 150000,
    ref: "MSL4782",
    imgIdx: 11,
  },
  {
    name: "Ankara Wax Geometric 2026",
    cat: "Ankara Cosmopolite",
    price: 250000,
    ref: "AKA5021",
    imgIdx: 12,
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

function placeOrder(event) {
  event.preventDefault(); // Empêcher la soumission par défaut

  const prenom = document.getElementById("ck-prenom")?.value.trim() || "";
  const nom = document.getElementById("ck-nom")?.value.trim() || "";
  const email = document.getElementById("ck-email")?.value.trim() || "";
  const tel = document.getElementById("ck-tel")?.value.trim() || "";
  const adresse = document.getElementById("ck-adresse")?.value.trim() || "";
  const ville = document.getElementById("ck-ville")?.value || "";
  const payMethod = document.querySelector('input[name="payment"]:checked');

  if (!prenom || !nom) {
    alert("Veuillez entrer votre prénom et nom.");
    return false;
  }
  if (!email || !email.includes("@")) {
    alert("Veuillez entrer une adresse email valide.");
    return false;
  }
  if (!tel) {
    alert("Veuillez entrer votre numéro de téléphone.");
    return false;
  }
  if (!adresse || !ville) {
    alert("Veuillez entrer votre adresse de livraison.");
    return false;
  }
  if (!payMethod) {
    alert("Veuillez choisir un mode de paiement.");
    return false;
  }

  const num = "JJF-" + Date.now().toString().slice(-6);
  const orderNum = "#" + num;

  const paymentLabel =
    payMethod.closest("label")?.innerText.replace("✓", "").trim() ||
    "Non precise";

  // Préparer les détails des articles
  const cartDetails = cart
    .map(
      (item) => `${item.name} (x${item.qty}) - ${item.price * item.qty} FCFA`,
    )
    .join(" | ");

  // Remplir les champs cachés
  document.getElementById("hidden-ordernum").value = orderNum;
  document.getElementById("hidden-articles").value = cartDetails;
  document.getElementById("hidden-total").value = getTotalPrice() + " FCFA";
  document.getElementById("hidden-payment").value = paymentLabel;

  // Afficher le message de confirmation avant soumission
  document.getElementById("ckFormGrid").style.display = "none";
  document.querySelector(".ck-back").style.display = "none";
  document.querySelector(".ck-header").style.display = "none";
  document.getElementById("orderNum").textContent = orderNum;
  document.getElementById("ckSuccess").classList.add("show");

  const successMsg = document.querySelector(".ck-success p");
  if (successMsg) {
    successMsg.innerHTML = `
      ✅ Votre commande a été enregistrée avec succès!<br>
      <strong>Numéro: ${orderNum}</strong><br>
      Vous recevrez bientôt une confirmation par email et WhatsApp.
    `;
  }

  // Soumettre le formulaire après un court délai
  setTimeout(() => {
    document.getElementById("checkoutForm").submit();
  }, 1000);

  return false; // Empêcher la soumission jusqu'au submit() explicite
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

// Product Media Tabs (Image & Video)
document.addEventListener("DOMContentLoaded", () => {
  // Media tab switching
  document.querySelectorAll(".media-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const tabType = e.target.dataset.tab;
      const cardMedia = e.target.closest(".product-media");

      // Remove active from all tabs in this media
      cardMedia
        .querySelectorAll(".media-tab")
        .forEach((t) => t.classList.remove("active"));
      // Add active to clicked tab
      e.target.classList.add("active");

      // Hide all content
      cardMedia.querySelectorAll(".media-content").forEach((content) => {
        content.classList.remove("active");
      });
      // Show selected content
      cardMedia
        .querySelector(`[data-content="${tabType}"]`)
        .classList.add("active");
    });
  });

  // Video URL input and button
  document.querySelectorAll(".btn-set-video").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn
        .closest(".video-placeholder")
        .querySelector(".video-url-input");
      const videoUrl = input.value.trim();

      if (!videoUrl) {
        alert("Veuillez entrer une URL vidéo");
        return;
      }

      const videoContainer = btn.closest(".product-video");
      const videoPlayer = videoContainer.querySelector(".video-player");
      const placeholder = videoContainer.querySelector(".video-placeholder");

      // Handle YouTube URLs
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        let videoId = "";
        if (videoUrl.includes("youtube.com")) {
          videoId = videoUrl.split("v=")[1]?.split("&")[0];
        } else if (videoUrl.includes("youtu.be")) {
          videoId = videoUrl.split("youtu.be/")[1];
        }

        if (videoId) {
          const iframeSrc = `https://www.youtube.com/embed/${videoId}`;
          videoPlayer.outerHTML = `<iframe width="100%" height="100%" src="${iframeSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
          placeholder.style.display = "none";
        }
      } else {
        // Handle direct video files (MP4, WebM, etc)
        const sourceTag = videoPlayer.querySelector("source");
        sourceTag.src = videoUrl;
        sourceTag.type = "video/mp4";
        videoPlayer.style.display = "block";
        placeholder.style.display = "none";
        videoPlayer.load();
        videoPlayer.play().catch(() => {
          // Si autoplay échoue, c'est OK, l'utilisateur peut cliquer
          console.log("Autoplay prevented or video load failed");
        });
      }
    });
  });

  // Check if any video source already has a URL on page load
  document.querySelectorAll(".video-player").forEach((videoPlayer) => {
    const sourceTag = videoPlayer.querySelector("source");
    if (sourceTag && sourceTag.src && sourceTag.src.trim() !== "") {
      videoPlayer.style.display = "block";
      const placeholder = videoPlayer
        .closest(".product-video")
        .querySelector(".video-placeholder");
      if (placeholder) {
        placeholder.style.display = "none";
      }
      videoPlayer.load();
    }
  });
});
