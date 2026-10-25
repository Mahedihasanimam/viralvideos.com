-- Run this whole file in Supabase > SQL Editor.
create table if not exists site_texts (key text primary key, value text not null default '', label text, grp text default 'General');
create table if not exists categories (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, sort int default 0);
create table if not exists posts (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, excerpt text,
  content text, image_url text, imdb text, director text, stars text, genres text,
  language text, country text, platform text, download_url text,
  category_id uuid references categories(id) on delete set null,
  published boolean default true, featured boolean default false, views int default 0, created_at timestamptz default now()
);
alter table posts add column if not exists language text;
alter table posts add column if not exists country text;
alter table posts add column if not exists platform text;
alter table posts add column if not exists download_url text;
create table if not exists pages (slug text primary key, title text not null, content text default '');
create table if not exists nav_links (id uuid primary key default gen_random_uuid(), label text not null, url text not null, location text default 'header', sort int default 0);
create table if not exists ad_settings (
  id uuid primary key default gen_random_uuid(),
  slot text unique not null,
  label text not null default '',
  ad_type text not null default 'banner' check (ad_type in ('banner', 'native', 'smartlink')),
  key_value text not null default '',
  script_url text not null default '',
  target_url text not null default '',
  width int not null default 0,
  height int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists admins (user_id uuid primary key references auth.users on delete cascade);
grant select on admins to authenticated;

-- Explicit table permissions for authenticated (admin) and anon (visitors)
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant all on all routines in schema public to authenticated;

grant select on all tables in schema public to anon;
grant select on all sequences in schema public to anon;
grant execute on all routines in schema public to anon;

alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant all on sequences to authenticated;
alter default privileges in schema public grant select on sequences to anon;

create or replace function is_admin() returns boolean language sql security definer stable
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;
grant execute on function is_admin() to anon, authenticated;

create or replace function increment_views(p_slug text) returns void language sql security definer
as $$ update posts set views = views + 1 where slug = p_slug $$;

do $$ declare t text; begin
  foreach t in array array['site_texts','categories','posts','pages','nav_links','ad_settings'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "read" on %I', t);
    execute format('drop policy if exists "admin" on %I', t);
    execute format('create policy "read" on %I for select using (true)', t);
    execute format('create policy "admin" on %I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
drop policy if exists "read" on posts;
create policy "read" on posts for select using (published or is_admin());
alter table admins enable row level security;
drop policy if exists "self" on admins;
create policy "self" on admins for select using (user_id = auth.uid());

-- Automatically make any existing auth user an admin so they are never locked out
insert into admins (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- Every visible string on the site lives here. Add more rows any time.
insert into site_texts (key, grp, label, value) values
('site_name','Brand','Site name','Movie Review Hub'),
('site_description','Brand','Meta description','Reviews of the latest Bengali, Hindi, English and Korean movies and series.'),
('theme_color','Brand','Accent color (hex)','#d9480f'),
('about_widget','Sidebar','About box text','Honest, concise reviews: story, cast, ratings and where to watch.'),
('search_placeholder','Header','Search placeholder','Search movies and series'),
('search_button','Header','Search button','Search'),
('night_mode','Header','Night mode label','Night mode'),
('day_mode','Header','Day mode label','Day mode'),
('featured_heading','Home','Featured heading','Featured review'),
('recent_heading','Home','Recent heading','Latest reviews'),
('load_more','Home','Load more button','Show more'),
('read_more','Home','Read more link','Read review'),
('no_results','Home','Empty state','Nothing found. Try a different search.'),
('categories_heading','Sidebar','Categories heading','Categories'),
('popular_heading','Sidebar','Popular heading','Popular reviews'),
('imdb_label','Post','IMDb label','IMDb rating'),
('director_label','Post','Director label','Director'),
('stars_label','Post','Stars label','Cast'),
('genres_label','Post','Genres label','Genres'),
('views_label','Post','Views label','views'),
('footer_text','Footer','Footer text','Independent movie and series reviews.'),
('footer_credit','Footer','Footer credit','Built by the editorial team')
on conflict (key) do nothing;

insert into categories (slug,name,sort) values ('bangla','Bangla',1),('hindi','Hindi',2),('english','English',3),('korean','Korean',4),('horror','Horror',5),('animation','Animation',6) on conflict do nothing;
insert into pages (slug,title,content) values
('about','About','<p>Write about your site here.</p>'),('contact','Contact','<p>How readers can reach you.</p>'),
('privacy-policy','Privacy Policy','<p>Your privacy policy.</p>'),('disclaimer','Disclaimer','<p>Your disclaimer.</p>'),('dmca','DMCA','<p>Your DMCA / takedown policy.</p>') on conflict do nothing;
insert into nav_links (label,url,location,sort) values
('Home','/','header',1),('About','/p/about','header',2),('Contact','/p/contact','header',3),
('Home','/','footer',1),('Privacy Policy','/p/privacy-policy','footer',2),('Disclaimer','/p/disclaimer','footer',3),('DMCA','/p/dmca','footer',4) on conflict do nothing;

insert into ad_settings (slot, label, ad_type, key_value, script_url, target_url, width, height) values
('native_sidebar', 'Sidebar native ad', 'native', '6fb853f324c105cabb940b068bf675d0', 'https://bancadeltempoidea.org/21/6fb853f324c105cabb940b068bf675d0', '', 0, 0),
('banner_300x250', 'Sidebar 300x250 banner', 'banner', '6aee385fd7d8587b55e2df7c7f10bc8d', 'https://bancadeltempoidea.org/22/6aee385fd7d8587b55e2df7c7f10bc8d', '', 300, 250),
('banner_468x60', 'Inline 468x60 banner', 'banner', 'a76fd710f7a27301e5c4e5a6a10ed59d', 'https://bancadeltempoidea.org/22/a76fd710f7a27301e5c4e5a6a10ed59d', '', 468, 60),
('banner_160x300', 'Sidebar 160x300 banner', 'banner', '92d17c94bab006dd97e6cb8ae3e5d36c', 'https://bancadeltempoidea.org/22/92d17c94bab006dd97e6cb8ae3e5d36c', '', 160, 300),
('banner_320x50', 'Mobile top 320x50 banner', 'banner', '439ae85f24a41e503f4433dcf29bfdb3', 'https://bancadeltempoidea.org/22/439ae85f24a41e503f4433dcf29bfdb3', '', 320, 50),
('banner_728x90', 'Desktop top 728x90 banner', 'banner', '92befdeb1f92f13a75cdd637578617e7', 'https://bancadeltempoidea.org/22/92befdeb1f92f13a75cdd637578617e7', '', 728, 90),
('smartlink_global', 'Global smartlink', 'smartlink', '', '', 'https://directyp.org/4/d74988ed07d2e9cf1ebf1e68fcddcb89', 0, 0),
('popunder_global', 'Global popunder script', 'native', '', 'https://aarems.org/1/f023ee03cd0e81f8ac94c7462316d8ba', '', 0, 0),
('socialbar_global', 'Global social bar script', 'native', '', 'https://bancadeltempoidea.org/14/7ca7d3009b54e2e6eb42f9b429b26800', '', 0, 0)
on conflict (slot) do nothing;

-- After creating your user in Authentication > Users, make them admin:
-- insert into admins (user_id) select id from auth.users where email = 'you@example.com';
