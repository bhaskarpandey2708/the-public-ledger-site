const accountRoot = document.querySelector("#account-app");

if (accountRoot) {
  let config = window.PUBLIC_CONFIG || {};

  const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

  const renderSetupNotice = () => {
    accountRoot.innerHTML = `<div class="detail"><div class="eyebrow">Buyer access</div><h1>Your purchases</h1><p class="lead">Passwordless buyer access is being connected. Payments and delivery remain handled by the verified Razorpay workflow.</p><div class="notice">Account access requires the publication’s Supabase project settings. No password, card number or bank credential is collected by this website.</div></div>`;
  };

  const renderLoggedOut = (supabase) => {
    accountRoot.innerHTML = `<div class="detail"><div class="eyebrow">Buyer access</div><h1>Your purchases</h1><p class="lead">Use the same email address used at checkout. We will send a one-time sign-in link—there is no password to remember.</p><form id="magic-link-form" class="detail-panel"><label for="buyer-email">Email address</label><input id="buyer-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"><button class="button" type="submit">Email me a sign-in link</button><p id="login-status" class="meta" role="status"></p></form></div>`;
    document.querySelector("#magic-link-form").addEventListener("submit", async event => {
      event.preventDefault();
      const email = new FormData(event.currentTarget).get("email");
      const status = document.querySelector("#login-status");
      status.textContent = "Sending…";
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/account` } });
      status.textContent = error ? error.message : "Check your email for the sign-in link.";
    });
  };

  const renderLoggedIn = async (supabase, user) => {
    accountRoot.innerHTML = `<div class="detail"><div class="eyebrow">Buyer access</div><h1>Your purchases</h1><p class="lead">Signed in as ${escapeHtml(user.email)}.</p><div id="orders" class="detail-panel">Loading your orders…</div><button id="sign-out" class="button" type="button">Sign out</button></div>`;
    document.querySelector("#sign-out").addEventListener("click", () => supabase.auth.signOut());
    const { data, error } = await supabase.from("orders").select("product_id,amount_inr,status,delivery_url,created_at").order("created_at", { ascending: false });
    const orders = document.querySelector("#orders");
    if (error) {
      orders.textContent = "We could not load your purchases. Please contact support.";
      return;
    }
    if (!data?.length) {
      orders.textContent = "No completed purchases are linked to this email yet.";
      return;
    }
    orders.innerHTML = data.map(order => {
      const delivery = /^https:\/\/(drive\.google\.com|docs\.google\.com)\//i.test(order.delivery_url || "") ? `<a href="${escapeHtml(order.delivery_url)}" target="_blank" rel="noopener">Download file</a>` : "";
      return `<p><strong>${escapeHtml(order.product_id)}</strong><br><span class="meta">₹${Number(order.amount_inr).toLocaleString("en-IN")} · ${escapeHtml(order.status)}</span>${delivery ? ` · ${delivery}` : " · Delivery is being prepared"}</p>`;
    }).join("");
  };

  (async () => {
    if (!config.supabaseUrl || !(config.supabasePublishableKey || config.supabaseAnonKey)) {
      try {
        const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
        if (response.ok) config = { ...config, ...(await response.json()) };
      } catch (_) { /* setup notice below */ }
    }
    const browserKey = config.supabasePublishableKey || config.supabaseAnonKey;
    if (!config.supabaseUrl || !browserKey) {
      renderSetupNotice();
      return;
    }
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(config.supabaseUrl, browserKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data: { session } } = await supabase.auth.getSession();
    session ? renderLoggedIn(supabase, session.user) : renderLoggedOut(supabase);
    supabase.auth.onAuthStateChange((_event, nextSession) => nextSession ? renderLoggedIn(supabase, nextSession.user) : renderLoggedOut(supabase));
  })();
}
