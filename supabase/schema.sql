-- Run this whole file in Supabase > SQL Editor.
create table if not exists site_texts (key text primary key, value text not null default '', label text, grp text default 'General');
create table if not exists categories (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, sort int default 0);
create table if not exists posts (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, excerpt text,
  content text, image_url text, imdb text, director text, stars text, genres text,
  category_id uuid references categories(id) on delete set null,
  published boolean default true, featured boolean default false, views int default 0, created_at timestamptz default now()
);
create table if not exists pages (slug text primary key, title text not null, content text default '');
create table if not exists nav_links (id uuid primary key default gen_random_uuid(), label text not null, url text not null, location text default 'header', sort int default 0);
create table if not exists admins (user_id uuid primary key references auth.users on delete cascade);

create or replace function is_admin() returns boolean language sql security definer stable
as $$ select exists (select 1 from admins where user_id = auth.uid()) $$;

create or replace function increment_views(p_slug text) returns void language sql security definer
as $$ update posts set views = views + 1 where slug = p_slug $$;

do $$ declare t text; begin
  foreach t in array array['site_texts','categories','posts','pages','nav_links'] loop
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

-- After creating your user in Authentication > Users, make them admin:
-- insert into admins (user_id) select id from auth.users where email = 'you@example.com';
