import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon'

// server-side reader
export const sb = () =>
  createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (u: any, i: any) => fetch(u, { ...i, cache: 'no-store' }) },
  })

let browser: any
export const db = () => (browser ||= createClient(url, key))

export const DEFAULT_TEXTS: Record<string, string> = {
  site_name: 'reviewbazarmovies | review bazar | review bazar movies',
  site_description: 'Review Bazar Movies – Get trending movie and series reviews in Bengali, English, and Hindi. Discover detailed insights on the latest releases.',
  theme_color: '#31942e',
  about_widget: 'Review Bazar Movies is a movie and web series review platform covering the latest Bengali, Hindi, English, Korean, dubbed, and animated films and series.',
  search_placeholder: 'ব্লগটি সন্ধান করুন',
  search_button: 'সার্চ',
  night_mode: '🌙 নাইট মোড',
  day_mode: '☀️ ডে মোড',
  featured_heading: 'ফিচার',
  recent_heading: 'সাম্প্রতিক পোস্টগুলি',
  load_more: 'আরও পোস্ট লোড করুন',
  read_more: 'Read more »',
  view_all: 'আরও দেখুন',
  no_results: 'কোন ফলাফল পাওয়া যায়নি',
  categories_heading: 'Categories',
  popular_heading: 'Most Popular',
  sidebar_search_heading: 'এখানে সার্চ করুনঃ',
  sidebar_search_placeholder: 'মুভির নাম লিখুন...',
  imdb_label: 'IMDb rating',
  director_label: 'Directors',
  stars_label: 'Stars',
  genres_label: 'Genres',
  views_label: 'views',
  author_label: 'Review Bazar Movies',
  posted_by: 'এর দ্বারা পোস্ট করা',
  related_heading: 'এই পোস্টগুলি আপনার ভাল লাগতে পারে',
  newer_post: 'নবীনতর',
  older_post: 'পূর্বতন',
  watch_here: 'এখানে থেকে দেখুন',
  footer_about_title: 'About Us',
  footer_text: 'Welcome to Review Bazar Movies! Our site is dedicated to providing insightful reviews and analysis of trending movies and series in multiple languages, including Bengali, English, Hindi, and more. We aim to create a space where movie enthusiasts can find thoughtful and honest opinions on the latest releases, helping you decide what to watch next.',
  footer_credit: 'Crafted with ❤ by Review Bazar Movies | Distributed By Review Bazar Movies',
}

export async function getTexts() {
  const m: Record<string, string> = { ...DEFAULT_TEXTS }
  try {
    const { data } = await sb().from('site_texts').select('key,value')
    if (data && data.length > 0) {
      data.forEach((r: any) => {
        if (r.value) m[r.key] = r.value
      })
    }
  } catch (e) {
    // ignore
  }
  return (k: string) => m[k] ?? DEFAULT_TEXTS[k] ?? ''
}
