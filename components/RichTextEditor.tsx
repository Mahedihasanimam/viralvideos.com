'use client'
import React, { useEffect, useRef, useState } from 'react'
import AdminIcon from '@/components/AdminIcon'

interface RichTextEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write review content here…',
  minHeight = 320,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({})

  // Sync value from outside only when editor content differs to prevent cursor jumping
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, isHtmlMode])

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      onChange(html === '<p><br></p>' ? '' : html)
      updateActiveFormats()
    }
  }

  const updateActiveFormats = () => {
    if (typeof document === 'undefined') return
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      })
    } catch {
      // ignore
    }
  }

  const exec = (command: string, arg: string | undefined = undefined) => {
    if (typeof document === 'undefined') return
    editorRef.current?.focus()
    document.execCommand(command, false, arg)
    handleInput()
  }

  const insertLink = () => {
    const url = prompt('Enter link URL (e.g. https://example.com):')
    if (url) {
      exec('createLink', url)
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL (e.g. https://.../photo.jpg):')
    if (url) {
      exec('insertImage', url)
    }
  }

  return (
    <div className="rich-editor-wrapper">
      {/* Editor Toolbar */}
      <div className="rich-editor-toolbar">
        {/* Headings */}
        <div className="rich-toolbar-group">
          <button
            type="button"
            className="rich-btn"
            title="Heading 2 (Section Title)"
            onClick={() => exec('formatBlock', '<h2>')}
          >
            <AdminIcon name="h2" size={16} />
          </button>
          <button
            type="button"
            className="rich-btn"
            title="Heading 3 (Sub-heading)"
            onClick={() => exec('formatBlock', '<h3>')}
          >
            <AdminIcon name="h3" size={16} />
          </button>
          <button
            type="button"
            className="rich-btn"
            title="Normal Paragraph"
            onClick={() => exec('formatBlock', '<p>')}
          >
            ¶
          </button>
        </div>

        <div className="rich-toolbar-divider" />

        {/* Text Styles */}
        <div className="rich-toolbar-group">
          <button
            type="button"
            className={`rich-btn ${activeFormats.bold ? 'on' : ''}`}
            title="Bold (Ctrl+B)"
            onClick={() => exec('bold')}
          >
            <AdminIcon name="bold" size={15} />
          </button>
          <button
            type="button"
            className={`rich-btn ${activeFormats.italic ? 'on' : ''}`}
            title="Italic (Ctrl+I)"
            onClick={() => exec('italic')}
          >
            <AdminIcon name="italic" size={15} />
          </button>
          <button
            type="button"
            className={`rich-btn ${activeFormats.underline ? 'on' : ''}`}
            title="Underline (Ctrl+U)"
            onClick={() => exec('underline')}
          >
            <AdminIcon name="underline" size={15} />
          </button>
        </div>

        <div className="rich-toolbar-divider" />

        {/* Lists */}
        <div className="rich-toolbar-group">
          <button
            type="button"
            className={`rich-btn ${activeFormats.insertUnorderedList ? 'on' : ''}`}
            title="Bullet list"
            onClick={() => exec('insertUnorderedList')}
          >
            <AdminIcon name="list" size={16} />
          </button>
          <button
            type="button"
            className={`rich-btn ${activeFormats.insertOrderedList ? 'on' : ''}`}
            title="Numbered list"
            onClick={() => exec('insertOrderedList')}
          >
            <AdminIcon name="list-ordered" size={16} />
          </button>
        </div>

        <div className="rich-toolbar-divider" />

        {/* Quotes & Media */}
        <div className="rich-toolbar-group">
          <button
            type="button"
            className="rich-btn"
            title="Quote"
            onClick={() => exec('formatBlock', '<blockquote>')}
          >
            <AdminIcon name="quote" size={15} />
          </button>
          <button
            type="button"
            className="rich-btn"
            title="Insert Link"
            onClick={insertLink}
          >
            <AdminIcon name="link" size={15} />
          </button>
          <button
            type="button"
            className="rich-btn"
            title="Insert Image"
            onClick={insertImage}
          >
            <AdminIcon name="image" size={15} />
          </button>
        </div>

        <div className="rich-toolbar-divider" />

        {/* Alignment & History */}
        <div className="rich-toolbar-group">
          <button
            type="button"
            className="rich-btn"
            title="Align Left"
            onClick={() => exec('justifyLeft')}
          >
            <AdminIcon name="align-left" size={15} />
          </button>
          <button
            type="button"
            className="rich-btn"
            title="Align Center"
            onClick={() => exec('justifyCenter')}
          >
            <AdminIcon name="align-center" size={15} />
          </button>
          <button
            type="button"
            className="rich-btn"
            title="Undo (Ctrl+Z)"
            onClick={() => exec('undo')}
          >
            <AdminIcon name="undo" size={15} />
          </button>
          <button
            type="button"
            className="rich-btn"
            title="Redo"
            onClick={() => exec('redo')}
          >
            <AdminIcon name="redo" size={15} />
          </button>
        </div>

        {/* Switch to HTML Mode */}
        <button
          type="button"
          className={`rich-btn rich-btn-html ${isHtmlMode ? 'on' : ''}`}
          style={{ marginLeft: 'auto' }}
          title={isHtmlMode ? 'Switch to Visual Editor' : 'Switch to HTML Code View'}
          onClick={() => setIsHtmlMode(!isHtmlMode)}
        >
          <AdminIcon name="code" size={15} />
          <span>{isHtmlMode ? 'Visual View' : 'HTML View'}</span>
        </button>
      </div>

      {/* Editor Content Area */}
      {isHtmlMode ? (
        <textarea
          className="rich-editor-html"
          style={{ minHeight }}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste or write raw HTML code here…"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          className="rich-editor-content"
          style={{ minHeight }}
          data-placeholder={placeholder}
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
        />
      )}
    </div>
  )
}
