// To make a new table editable in the admin, add an entry here.
export const CFG: Record<string, any> = {
  site_texts: { title: 'Site texts', table: 'site_texts', pk: 'key', order: 'grp', cols: ['grp', 'label', 'value'], fields: [
    { n: 'key', l: 'Key (used in code)', lockOnEdit: true }, { n: 'grp', l: 'Group' }, { n: 'label', l: 'Label' }, { n: 'value', l: 'Text', t: 'area' }] },
  posts: { title: 'Posts', table: 'posts', pk: 'id', order: 'created_at', asc: false, cols: ['title', 'published', 'featured'], fields: [
    { n: 'title', l: 'Title' }, { n: 'slug', l: 'URL slug (auto if empty)' }, { n: 'image_url', l: 'Poster image URL' },
    { n: 'category_id', l: 'Category', t: 'ref', ref: 'categories' }, { n: 'imdb', l: 'IMDb rating' }, { n: 'director', l: 'Director' },
    { n: 'stars', l: 'Cast' }, { n: 'genres', l: 'Genres' }, { n: 'excerpt', l: 'Short summary', t: 'area' },
    { n: 'content', l: 'Full review (HTML allowed)', t: 'area', rows: 14 },
    { n: 'published', l: 'Published', t: 'bool' }, { n: 'featured', l: 'Featured on home', t: 'bool' }, { n: 'views', l: 'Views', t: 'num' }] },
  categories: { title: 'Categories', table: 'categories', pk: 'id', order: 'sort', cols: ['name', 'slug', 'sort'], fields: [
    { n: 'name', l: 'Name' }, { n: 'slug', l: 'URL slug' }, { n: 'sort', l: 'Order', t: 'num' }] },
  nav_links: { title: 'Menus', table: 'nav_links', pk: 'id', order: 'sort', cols: ['location', 'label', 'url'], fields: [
    { n: 'label', l: 'Label' }, { n: 'url', l: 'URL' }, { n: 'location', l: 'Location (header or footer)' }, { n: 'sort', l: 'Order', t: 'num' }] },
  pages: { title: 'Pages', table: 'pages', pk: 'slug', order: 'slug', cols: ['slug', 'title'], fields: [
    { n: 'slug', l: 'URL slug', lockOnEdit: true }, { n: 'title', l: 'Title' }, { n: 'content', l: 'Content (HTML allowed)', t: 'area', rows: 14 }] },
}
