'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '@/lib/supabase'
import AdminIcon from '@/components/AdminIcon'

interface Stats {
  posts: number
  published: number
  drafts: number
  featured: number
  categories: number
  pages: number
  nav_links: number
  site_texts: number
  views: number
  recentPosts: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [
          { count: posts },
          { count: published },
          { count: drafts },
          { count: featured },
          { count: categories },
          { count: pages },
          { count: nav_links },
          { count: site_texts },
          { data: viewsData },
          { data: recentPosts },
        ] = await Promise.all([
          db().from('posts').select('*', { count: 'exact', head: true }),
          db().from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
          db().from('posts').select('*', { count: 'exact', head: true }).eq('published', false),
          db().from('posts').select('*', { count: 'exact', head: true }).eq('featured', true),
          db().from('categories').select('*', { count: 'exact', head: true }),
          db().from('pages').select('*', { count: 'exact', head: true }),
          db().from('nav_links').select('*', { count: 'exact', head: true }),
          db().from('site_texts').select('*', { count: 'exact', head: true }),
          db().from('posts').select('views'),
          db().from('posts').select('id,title,slug,published,featured,created_at,image_url,views').order('created_at', { ascending: false }).limit(6),
        ])

        const totalViews = (viewsData || []).reduce((s: number, p: any) => s + (p.views || 0), 0)

        setStats({
          posts: posts || 0,
          published: published || 0,
          drafts: drafts || 0,
          featured: featured || 0,
          categories: categories || 0,
          pages: pages || 0,
          nav_links: nav_links || 0,
          site_texts: site_texts || 0,
          views: totalViews,
          recentPosts: recentPosts || [],
        })
      } catch {
        // ignore
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="dash-loading">
      <span className="spinner lg" /> Loading dashboard…
    </div>
  )

  if (!stats) return <p>Could not load stats.</p>

  const statCards = [
    { label: 'Total Posts', value: stats.posts, icon: 'film', color: 'green', href: '/admin/posts' },
    { label: 'Published', value: stats.published, icon: 'check-circle', color: 'blue', href: '/admin/posts' },
    { label: 'Drafts', value: stats.drafts, icon: 'clock', color: 'orange', href: '/admin/posts' },
    { label: 'Featured', value: stats.featured, icon: 'star', color: 'yellow', href: '/admin/posts' },
    { label: 'Total Views', value: stats.views.toLocaleString(), icon: 'eye', color: 'purple', href: '/admin/posts' },
    { label: 'Categories', value: stats.categories, icon: 'tags', color: 'teal', href: '/admin/categories' },
    { label: 'Pages', value: stats.pages, icon: 'file-text', color: 'indigo', href: '/admin/pages' },
    { label: 'Menu Links', value: stats.nav_links, icon: 'menu', color: 'pink', href: '/admin/nav_links' },
  ]

  const quickLinks = [
    { label: 'Write new post', icon: 'plus', href: '/admin/posts', desc: 'Create a new movie review' },
    { label: 'Manage posts', icon: 'film', href: '/admin/posts', desc: `${stats.published} published, ${stats.drafts} drafts` },
    { label: 'Edit categories', icon: 'tags', href: '/admin/categories', desc: `${stats.categories} categories` },
    { label: 'Site settings', icon: 'type', href: '/admin/site_texts', desc: 'Texts, colors & metadata' },
    { label: 'Navigation menus', icon: 'menu', href: '/admin/nav_links', desc: 'Header & footer links' },
    { label: 'Manage pages', icon: 'file-text', href: '/admin/pages', desc: 'About, Contact, Privacy…' },
  ]

  return (
    <div className="dash">
      {/* Heading */}
      <div className="dash-heading">
        <div>
          <p className="admin-page-kicker">Overview</p>
          <h1>Dashboard</h1>
        </div>
        <Link href="/admin/posts" className="btn btn-primary">
          <AdminIcon name="plus" size={15} /> New Post
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats">
        {statCards.map(s => (
          <Link key={s.label} href={s.href} className={`dash-stat dash-stat-${s.color}`}>
            <span className="dash-stat-icon">
              <AdminIcon name={s.icon} size={20} />
            </span>
            <div>
              <strong className="dash-stat-val">{s.value}</strong>
              <span className="dash-stat-label">{s.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="dash-grid">
        {/* Recent Posts */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Recent Posts</h2>
            <Link href="/admin/posts">View all →</Link>
          </div>
          <div className="dash-recent-posts">
            {stats.recentPosts.length === 0 ? (
              <p className="dash-empty">No posts yet. <Link href="/admin/posts">Create your first post</Link>.</p>
            ) : stats.recentPosts.map((p: any) => (
              <div key={p.id} className="dash-recent-post">
                {p.image_url && <img src={p.image_url} alt={p.title} className="dash-recent-thumb" />}
                <div className="dash-recent-info">
                  <span className="dash-recent-title">{p.title}</span>
                  <div className="dash-recent-meta">
                    <span className={`badge ${p.published ? 'badge-green' : 'badge-gray'}`}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                    {p.featured && <span className="badge badge-yellow">Featured</span>}
                    <span className="dash-recent-views">
                      <AdminIcon name="eye" size={12} /> {(p.views || 0).toLocaleString()}
                    </span>
                    <span className="dash-recent-date">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link href="/admin/posts" className="dash-recent-edit">Edit</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="dash-quick-links">
            {quickLinks.map(l => (
              <Link key={l.label} href={l.href} className="dash-quick-link">
                <span className="dash-quick-icon">
                  <AdminIcon name={l.icon} size={18} />
                </span>
                <div>
                  <strong>{l.label}</strong>
                  <span>{l.desc}</span>
                </div>
                <span className="dash-quick-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
