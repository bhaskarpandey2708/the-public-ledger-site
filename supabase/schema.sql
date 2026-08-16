-- The Public Ledger commerce schema.
-- Run this once in the Supabase SQL editor. The service-role key is never used
-- in the browser; it is only used by the Razorpay webhook function.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  title text not null,
  kind text not null check (kind in ('report', 'bundle')),
  amount_inr integer not null check (amount_inr > 0),
  version text not null default '1.0',
  active boolean not null default false,
  delivery_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'razorpay',
  provider_payment_id text not null unique,
  product_id text not null references public.products(id),
  buyer_email text not null,
  amount_inr integer not null check (amount_inr > 0),
  status text not null check (status in ('paid', 'paid_delivery_pending', 'refunded', 'cancelled')),
  delivery_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "public can view active products" on public.products;
create policy "public can view active products"
  on public.products for select
  using (active = true);

drop policy if exists "buyers can view their own orders" on public.orders;
create policy "buyers can view their own orders"
  on public.orders for select to authenticated
  using (lower(buyer_email) = lower(auth.jwt() ->> 'email'));

-- The webhook uses the service role and therefore bypasses these policies.
-- No anonymous client may insert, update, or delete products or orders.

insert into public.products (id, title, kind, amount_inr, active)
values
  ('report:the-empty-ward', 'The Empty Ward', 'report', 699, false),
  ('report:three-per-cent', 'Three Per Cent', 'report', 699, false),
  ('report:houses-on-paper', 'Houses on Paper', 'report', 699, false),
  ('report:the-price-with-no-proof', 'The Price With No Proof', 'report', 699, false),
  ('report:smart-on-paper', 'Smart on Paper', 'report', 699, false),
  ('report:the-last-tiger', 'The Last Tiger', 'report', 699, false),
  ('bundle:indias-health-systems', 'India''s Health Systems', 'bundle', 1999, false),
  ('bundle:india-s-farms', 'India''s Farms', 'bundle', 1999, false),
  ('bundle:india-s-cities', 'India''s Cities', 'bundle', 1999, false),
  ('bundle:india-s-safety-net', 'India''s Safety Net', 'bundle', 1999, false),
  ('bundle:india-s-power', 'India''s Power', 'bundle', 1999, false),
  ('bundle:india-s-forests', 'India''s Forests', 'bundle', 1999, false),
  ('bundle:india-s-rural-promise', 'India''s Rural Promise', 'bundle', 1999, false)
on conflict (id) do update set
  title = excluded.title,
  kind = excluded.kind,
  amount_inr = excluded.amount_inr,
  updated_at = now();
