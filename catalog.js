/* Public catalogue. Payment URLs are intentionally kept separate from report files. */
const paymentLinks = {
  // Paste the verified Razorpay payment-link URL for each product here.
  "the-empty-ward": "",
  "three-per-cent": "",
  "houses-on-paper": "",
  "the-price-with-no-proof": "",
  "smart-on-paper": "",
  "the-last-tiger": "",
  "indias-health-systems": "",
  "india-s-farms": "",
  "india-s-cities": "",
  "india-s-safety-net": "",
  "india-s-power": "",
  "india-s-forests": "",
  "india-s-rural-promise": ""
};

const products = [
  { id: "report:the-empty-ward", kind: "report", title: "The Empty Ward", slug: "the-empty-ward", amount: 699, sector: "Health · Bihar", articleUrl: "https://thepublicledgerforpublic.substack.com/p/the-empty-ward", description: "Rs 21,743 crore of the health budget was unspent; staffing and 24×7 facility availability were weaker still." },
  { id: "report:three-per-cent", kind: "report", title: "Three Per Cent", slug: "three-per-cent", amount: 699, sector: "Mining · Karnataka", description: "Satellite evidence found 39.81 crore tonnes quarried against 1.07 crore assessed, alongside 532 illegal sites." },
  { id: "report:houses-on-paper", kind: "report", title: "Houses on Paper", slug: "houses-on-paper", amount: 699, sector: "Rural development · Bihar", articleUrl: "https://thepublicledgerforpublic.substack.com/p/houses-on-paper", description: "Reported completion did not consistently mean a finished, usable home on the ground." },
  { id: "report:the-price-with-no-proof", kind: "report", title: "The Price With No Proof", slug: "the-price-with-no-proof", amount: 699, sector: "Agriculture · National", articleUrl: "https://thepublicledgerforpublic.substack.com/p/the-price-with-no-proof", description: "What happens after paddy is procured at the support price? The records leave a costly gap." },
  { id: "report:smart-on-paper", kind: "report", title: "Smart on Paper", slug: "smart-on-paper", amount: 699, sector: "Urban · Karnataka", description: "Seven Smart Cities made progress, but delivery, SPV finance and digital integration fell short of the promise." },
  { id: "report:the-last-tiger", kind: "report", title: "The Last Tiger", slug: "the-last-tiger", amount: 699, sector: "Wildlife · Jharkhand", articleUrl: "https://thepublicledgerforpublic.substack.com/p/the-last-tiger", description: "A conservation promise carried by too little staff, too-late planning and unresolved community rights." },
  { id: "bundle:indias-health-systems", kind: "bundle", title: "India's Health Systems", slug: "indias-health-systems", amount: 1999, sector: "Bundle · Health", description: "A collection of evidence-led reports on whether health budgets become staffed, functioning care." },
  { id: "bundle:india-s-farms", kind: "bundle", title: "India's Farms", slug: "india-s-farms", amount: 1999, sector: "Bundle · Agriculture", description: "The agriculture evidence collection: procurement, insurance, income support and delivery." },
  { id: "bundle:india-s-cities", kind: "bundle", title: "India's Cities", slug: "india-s-cities", amount: 1999, sector: "Bundle · Urban", description: "A collection on city finance, projects, service delivery and the institutions behind them." },
  { id: "bundle:india-s-safety-net", kind: "bundle", title: "India's Safety Net", slug: "india-s-safety-net", amount: 1999, sector: "Bundle · Social welfare", description: "Evidence on whether welfare promises reach the people and places they target." },
  { id: "bundle:india-s-power", kind: "bundle", title: "India's Power", slug: "india-s-power", amount: 1999, sector: "Bundle · Power", description: "A cross-report view of electricity delivery, project execution and public value." },
  { id: "bundle:india-s-forests", kind: "bundle", title: "India's Forests", slug: "india-s-forests", amount: 1999, sector: "Bundle · Forests", description: "Evidence on forests, wildlife, conservation capacity and community rights." },
  { id: "bundle:india-s-rural-promise", kind: "bundle", title: "India's Rural Promise", slug: "india-s-rural-promise", amount: 1999, sector: "Bundle · Rural development", description: "A collection on rural housing, public works, funds and the gap between completion and use." }
];

const money = value => `₹${value.toLocaleString("en-IN")}`;
const app = document.querySelector("#app");
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const slug = path.match(/^\/(?:report|bundle)\/([^/]+)$/)?.[1];

function card(product) {
  const prefix = product.kind === "bundle" ? "Bundle" : "Report";
  return `<article class="card"><span class="tag">${prefix}</span><h3>${product.title}</h3><div class="meta">${product.sector} · Version 1.0</div><p>${product.description}</p><div class="card-bottom"><span class="price">${money(product.amount)}</span><a class="button" href="/${product.kind}/${product.slug}">View evidence</a></div></article>`;
}

function home() {
  const reports = products.filter(p => p.kind === "report");
  const bundles = products.filter(p => p.kind === "bundle");
  app.innerHTML = `<div class="wrap"><section class="hero"><div><div class="eyebrow">The Public Ledger</div><h1>Follow the money.<br>Find the gap.</h1><p>Evidence-led reports on public money, public programmes and what reaches people in practice.</p><a class="button" href="#reports">Browse the catalogue</a></div><p class="hero-note">The newsletter opens the investigation. The storefront holds the full evidence file, source notes and report PDF.</p></section><section class="section" id="reports"><div class="section-heading"><h2>Flagship reports</h2><p>Individual reports for readers who want the audited finding, the method and the underlying evidence.</p></div><div class="grid">${reports.map(card).join("")}</div></section><section class="section" id="bundles"><div class="section-heading"><h2>Evidence collections</h2><p>Seven themed bundles for researchers, journalists, institutions and readers who want the wider pattern.</p></div><div class="grid">${bundles.map(card).join("")}</div></section><section class="section methodology" id="methodology"><div class="section-heading"><h2>How we work</h2></div><p>Each product is released only after source, numerical, metadata, privacy, layout and article-consistency checks. Reports carry a version number and publication date. Corrections create a new version and preserve the change record.</p><p>The Public Ledger maintains the evidence trail, editorial judgement and correction record for every published version.</p></section><section class="section" id="corrections"><div class="section-heading"><h2>Questions or corrections?</h2></div><p>Write to <a href="mailto:bhaskar.author@gmail.com">bhaskar.author@gmail.com</a>. Include the product title and report version so the record can be checked quickly.</p></section></div>`;
}

function detail(product) {
  const checkout = paymentLinks[product.slug];
  const paid = Boolean(checkout);
  app.innerHTML = `<div class="wrap"><article class="detail"><a class="back" href="/">← Back to the catalogue</a><div class="eyebrow">${product.kind === "bundle" ? "Evidence collection" : "Flagship report"}</div><h1>${product.title}</h1><p class="lead">${product.description}</p><div class="detail-panel"><dl><dt>Price</dt><dd>${money(product.amount)}</dd><dt>Version</dt><dd>1.0 · QC approved</dd><dt>Delivery</dt><dd>PDF via verified payment and private Drive delivery</dd><dt>Licence</dt><dd>Personal research use; contact us for institutional licensing</dd></dl><a class="button" ${paid ? `href="${checkout}" target="_blank" rel="noopener"` : `href="#checkout" aria-disabled="true"`} >${paid ? `Buy for ${money(product.amount)}` : "Checkout link being verified"}</a>${paid ? "" : `<div class="notice" id="checkout">Payment is not enabled on this page until the corresponding Razorpay link has been verified. The report file is not exposed publicly.</div>`}</div>${product.articleUrl ? `<p><a href="${product.articleUrl}" target="_blank" rel="noopener">Read the free Substack preview →</a></p>` : ""}<p class="notice">The related Substack article is the free editorial preview. This page is the paid evidence destination.</p></article></div>`;
}

function account() {
  app.innerHTML = `<div class="wrap"><div id="account-app"></div></div>`;
}

(path === "/account" ? account() : slug ? detail(products.find(p => p.slug === slug) || products[0]) : home());
