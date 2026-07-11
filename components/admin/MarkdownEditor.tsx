'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import createDOMPurify from 'isomorphic-dompurify';

const DOMPurify = typeof window !== 'undefined' ? createDOMPurify(window) : createDOMPurify();

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

function markdownToHtml(raw: string): string {
  const src = raw;

  const lines = src.split('\n');
  const html: string[] = [];
  let inUl = false;
  let inOl = false;
  let paragraph: string[] = [];

  const closeLists = () => {
    if (inUl) {
      html.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      html.push('</ol>');
      inOl = false;
    }
  };

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${paragraph.join('<br/>')}</p>`);
      paragraph = [];
    }
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeLists();
      const level = heading[1].length;
      html.push(`<h${level}>${heading[2]}</h${level}>`);
      continue;
    }

    const ul = line.match(/^[-*+]\s+(.*)$/);
    if (ul) {
      flushParagraph();
      if (!inUl) {
        html.push('<ul>');
        inUl = true;
      }
      html.push(`<li>${ul[1]}</li>`);
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      flushParagraph();
      if (!inOl) {
        html.push('<ol>');
        inOl = true;
      }
      html.push(`<li>${ol[1]}</li>`);
      continue;
    }

    const blockquote = line.match(/^>\s+(.*)$/);
    if (blockquote) {
      flushParagraph();
      closeLists();
      html.push(`<blockquote>${blockquote[1]}</blockquote>`);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      closeLists();
      continue;
    }

    let inline = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />');

    paragraph.push(inline);
  }

  flushParagraph();
  closeLists();

  const htmlString = html.join('\n');
  return DOMPurify.sanitize(htmlString);
}

export default function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder,
  rows = 16,
  required,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [htmlPreview, setHtmlPreview] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const id = useId();

  const updatePreview = (md: string) => {
    setHtmlPreview(markdownToHtml(md));
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    updatePreview(newValue);
  };

  const sanitizedPreview = DOMPurify.sanitize(htmlPreview);

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'edit'
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            onClick={() => setMode('edit')}
          >
            Edit
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'preview'
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            onClick={() => {
              updatePreview(value);
              setMode('preview');
            }}
          >
            Preview
          </button>
        </div>
        {mode === 'preview' ? (
          <div className="prose prose-sm dark:prose-invert max-w-none min-h-[250px] p-4" dangerouslySetInnerHTML={{ __html: sanitizedPreview }} />
        ) : (
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-none focus:outline-none resize-y min-h-[300px] font-mono"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}