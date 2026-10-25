'use client'
import React from 'react'
import {
  LayoutDashboard,
  Film,
  Tags,
  FileText,
  Menu,
  Type,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Save,
  ArrowLeft,
  Search,
  Upload,
  Image as ImageIcon,
  Link2,
  Eye,
  Check,
  AlertTriangle,
  Copy,
  ExternalLink,
  LogOut,
  X,
  Sparkles,
  Layers,
  HelpCircle,
  Database,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  Undo,
  Redo,
} from 'lucide-react'

interface AdminIconProps {
  name: string
  size?: number
  className?: string
}

export default function AdminIcon({ name, size = 18, className = '' }: AdminIconProps) {
  const iconProps = { size, className, strokeWidth: 2 }

  switch (name) {
    case 'dashboard':
    case 'LayoutDashboard':
      return <LayoutDashboard {...iconProps} />
    case 'posts':
    case 'film':
    case 'Film':
    case '🎬':
      return <Film {...iconProps} />
    case 'categories':
    case 'tags':
    case 'Tags':
    case '🏷️':
      return <Tags {...iconProps} />
    case 'pages':
    case 'file-text':
    case 'FileText':
    case '📄':
      return <FileText {...iconProps} />
    case 'nav_links':
    case 'menu':
    case 'Menu':
    case '🔗':
      return <Menu {...iconProps} />
    case 'site_texts':
    case 'type':
    case 'Type':
    case '✏️':
      return <Type {...iconProps} />
    case 'settings':
    case 'Settings':
    case '⚙️':
      return <Settings {...iconProps} />
    case 'database':
      return <Database {...iconProps} />
    case 'plus':
      return <Plus {...iconProps} />
    case 'edit':
    case 'pencil':
      return <Pencil {...iconProps} />
    case 'delete':
    case 'trash':
      return <Trash2 {...iconProps} />
    case 'save':
      return <Save {...iconProps} />
    case 'back':
      return <ArrowLeft {...iconProps} />
    case 'search':
      return <Search {...iconProps} />
    case 'upload':
      return <Upload {...iconProps} />
    case 'image':
      return <ImageIcon {...iconProps} />
    case 'link':
      return <Link2 {...iconProps} />
    case 'eye':
      return <Eye {...iconProps} />
    case 'check':
      return <Check {...iconProps} />
    case 'check-circle':
      return <CheckCircle2 {...iconProps} />
    case 'clock':
      return <Clock {...iconProps} />
    case 'alert':
      return <AlertTriangle {...iconProps} />
    case 'copy':
      return <Copy {...iconProps} />
    case 'external':
      return <ExternalLink {...iconProps} />
    case 'logout':
      return <LogOut {...iconProps} />
    case 'close':
    case 'x':
      return <X {...iconProps} />
    case 'star':
      return <Star {...iconProps} />
    case 'layers':
      return <Layers {...iconProps} />
    case 'calendar':
      return <Calendar {...iconProps} />
    case 'help':
      return <HelpCircle {...iconProps} />
    case 'bold':
      return <Bold {...iconProps} />
    case 'italic':
      return <Italic {...iconProps} />
    case 'underline':
      return <Underline {...iconProps} />
    case 'list':
      return <List {...iconProps} />
    case 'list-ordered':
      return <ListOrdered {...iconProps} />
    case 'h1':
      return <Heading1 {...iconProps} />
    case 'h2':
      return <Heading2 {...iconProps} />
    case 'h3':
      return <Heading3 {...iconProps} />
    case 'quote':
      return <Quote {...iconProps} />
    case 'code':
      return <Code {...iconProps} />
    case 'align-left':
      return <AlignLeft {...iconProps} />
    case 'align-center':
      return <AlignCenter {...iconProps} />
    case 'undo':
      return <Undo {...iconProps} />
    case 'redo':
      return <Redo {...iconProps} />
    default:
      return <Sparkles {...iconProps} />
  }
}
