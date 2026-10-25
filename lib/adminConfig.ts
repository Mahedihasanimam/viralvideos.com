// Configuration for each manageable section of the website.
// Formatted for non-technical admins: friendly labels, plain English.
export const CFG: Record<string, any> = {
  posts: {
    title: 'Posts & Reviews',
    singular: 'Post',
    icon: 'film',
    table: 'posts',
    pk: 'id',
    order: 'created_at',
    asc: false,
    cols: ['title', 'category_id', 'published', 'views'],
    fields: [
      { n: 'title', l: 'Movie / Show Title', req: true, placeholder: 'e.g. Jawan (2023)' },
      { n: 'category_id', l: 'Category', t: 'ref', ref: 'categories', placeholder: 'Select category' },
      { n: 'image_url', l: 'Poster Image', t: 'image', hint: 'Upload from your device or paste an image link' },
      { n: 'excerpt', l: 'Short Summary (1-2 sentences)', t: 'area', rows: 3, placeholder: 'Brief summary shown in listings...' },
      { n: 'content', l: 'Full Review & Story (Rich Text Editor)', t: 'richtext', placeholder: 'Write your review here. Use headings, bold, bullet points, links, etc.' },
      { n: 'imdb', l: 'IMDb Rating', placeholder: 'e.g. 8.2' },
      { n: 'director', l: 'Director', placeholder: 'e.g. Atlee' },
      { n: 'stars', l: 'Actors / Cast', placeholder: 'e.g. Shah Rukh Khan, Nayanthara' },
      { n: 'genres', l: 'Genres', placeholder: 'e.g. Action, Thriller' },
      { n: 'language', l: 'Language', placeholder: 'e.g. Bengali, Hindi' },
      { n: 'country', l: 'Country', placeholder: 'e.g. India, Bangladesh' },
      { n: 'platform', l: 'Streaming Platform / Where to Watch', placeholder: 'e.g. Netflix, Prime Video, Theaters' },
      { n: 'download_url', l: 'Watch / Download Link (optional)', t: 'url', placeholder: 'https://...' },
      { n: 'published', l: 'Visible on Website (Published)', t: 'bool', hint: 'Turn ON to show on website, OFF to save as draft' },
      { n: 'featured', l: 'Featured on Homepage', t: 'bool', hint: 'Show in top featured banner' },
      { n: 'views', l: 'Total Views', t: 'num', placeholder: '0' },
      { n: 'slug', l: 'URL Slug (auto-created if empty)', hint: 'Leave empty to automatically create from title' },
    ],
  },

  categories: {
    title: 'Categories',
    singular: 'Category',
    icon: 'tags',
    table: 'categories',
    pk: 'id',
    order: 'sort',
    asc: true,
    cols: ['name', 'slug', 'sort'],
    fields: [
      { n: 'name', l: 'Category Name', req: true, placeholder: 'e.g. Bangla Movies' },
      { n: 'slug', l: 'URL Slug', placeholder: 'e.g. bangla-movies (lowercase, no spaces)' },
      { n: 'sort', l: 'Display Order', t: 'num', placeholder: '1, 2, 3...' },
    ],
  },

  pages: {
    title: 'Pages',
    singular: 'Page',
    icon: 'file-text',
    table: 'pages',
    pk: 'slug',
    order: 'slug',
    asc: true,
    cols: ['title', 'slug'],
    fields: [
      { n: 'title', l: 'Page Title', req: true, placeholder: 'e.g. About Us' },
      { n: 'slug', l: 'Page URL Address (e.g. about)', lockOnEdit: true, placeholder: 'about, contact, privacy-policy' },
      { n: 'content', l: 'Page Content (Rich Text Editor)', t: 'richtext', placeholder: 'Write the page content here...' },
    ],
  },

  nav_links: {
    title: 'Menus',
    singular: 'Menu Link',
    icon: 'menu',
    table: 'nav_links',
    pk: 'id',
    order: 'sort',
    asc: true,
    cols: ['label', 'url', 'location'],
    fields: [
      { n: 'label', l: 'Button / Link Text', req: true, placeholder: 'e.g. Home, About, Contact' },
      { n: 'url', l: 'Where does it link to? (URL)', req: true, placeholder: 'e.g. / or /p/about' },
      { n: 'location', l: 'Menu Location', placeholder: 'header or footer' },
      { n: 'sort', l: 'Display Order', t: 'num', placeholder: '1, 2, 3...' },
    ],
  },

  site_texts: {
    title: 'Website Texts',
    singular: 'Text Item',
    icon: 'type',
    table: 'site_texts',
    pk: 'key',
    order: 'grp',
    asc: true,
    cols: ['label', 'grp', 'value'],
    fields: [
      { n: 'label', l: 'Setting / Item Name', lockOnEdit: true },
      { n: 'value', l: 'Text / Value Shown on Site', t: 'area', rows: 4, placeholder: 'Write your text here...' },
      { n: 'grp', l: 'Website Section', lockOnEdit: true },
      { n: 'key', l: 'System Key (do not change)', lockOnEdit: true },
    ],
  },
}

export const NAV_SECTIONS = [
  { key: '', label: 'Dashboard', icon: 'dashboard' },
  { key: 'posts', label: 'Posts & Reviews', icon: 'film' },
  { key: 'categories', label: 'Categories', icon: 'tags' },
  { key: 'pages', label: 'Pages', icon: 'file-text' },
  { key: 'nav_links', label: 'Menus', icon: 'menu' },
  { key: 'site_texts', label: 'Website Texts', icon: 'type' },
  { key: 'settings', label: 'Help & Database', icon: 'settings' },
]
