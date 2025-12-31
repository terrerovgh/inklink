-- Create products table for monetization strategy
create type product_type as enum ('affiliate', 'dropshipping');

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  type product_type not null,
  name text not null,
  description text,
  price numeric,
  image_url text, -- optimized image url
  
  -- Affiliate specific
  affiliate_url text,
  
  -- Dropshipping specific
  supplier_id text,
  stock_status text default 'in_stock', -- 'in_stock', 'out_of_stock', 'pre_order'
  
  commission_rate numeric, -- e.g., 0.05 for 5%
  is_recommended boolean default false,
  tags text[], -- e.g., ['tattoo_machine', 'ink', 'aftercare']
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table products enable row level security;

-- Policies (Public read, Admin write)
create policy "Allow public read access"
  on products for select
  using (true);

create policy "Allow admin full access"
  on products for all
  using (
    -- Updated to use correct enum value 'ADMIN' (uppercase) and cast to user_role
    auth.uid() in (
      select id from profiles where role = 'ADMIN'::user_role
    )
  );

-- Indexes for performance
create index products_tags_idx on products using gin (tags);
create index products_type_idx on products (type);
