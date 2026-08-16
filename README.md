# The Public Ledger storefront

This is a static, Vercel-ready catalogue. It contains public landing pages for
all 13 QC-approved pilot products, but never exposes the private PDFs or Drive
links. Razorpay payment-link URLs are kept in `catalog.js`; paste only verified
checkout URLs into `paymentLinks` before going live.

The payment webhook remains the delivery authority: after a verified payment,
the server sends the buyer the matching private Drive file. The website should
not embed or reveal those Drive URLs.

## Local preview

```bash
cd "/Users/bhaskar_pandey/Documents/Instamojo Automation/site"
python3 -m http.server 4173
```

Open `http://localhost:4173`. Product routes include:

- `/report/the-empty-ward`
- `/report/smart-on-paper`
- `/bundle/india-s-farms`

Before launch, verify each Razorpay link, replace the empty values in
`catalog.js`, and test one payment through the webhook and Drive-delivery
path.

## Vercel preview

The preview deploy requires a Vercel login on this machine:

```bash
npx --yes -p vercel@59.1.3 vercel login
npx --yes -p vercel@59.1.3 vercel deploy . -y
```
