'use client';

import { useId, useRef, useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdownToHtml(raw: string): string {
  const src = escapeHtml(raw);

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

    const ulItem = line.match(/^\s*-\s+(.*)$/);
    if (ulItem) {
      flushParagraph();
      if (!inUl) {
        closeLists();
        html.push('<ul>');
        inUl = true;
      }
      html.push(`<li>${ulItem[1]}</li>`);
      continue;
    }

    const olItem = line.match(/^\s*\d+\.\s+(.*)$/);
    if (olItem) {
      flushParagraph();
      if (!inOl) {
        closeLists();
        html.push('<ol>');
        inOl = true;
      }
      html.push(`<li>${olItem[1]}</li>`);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      closeLists();
      continue;
    }

    closeLists();
    paragraph.push(inline(line));
  }

  flushParagraph();
  closeLists();

  return html.join('\n');
}

function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

interface ToolbarAction {
  key: string;
  title: string;
  icon: React.ReactNode;
  wrap?: [string, string];
  prefix?: string;
  placeholder?: string;
}

const BoldIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
  </svg>
);
const ItalicIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);
const HeadingIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 4v16M18 4v16M6 12h12" />
  </svg>
);
const ListIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const OrderedListIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4M4 10h2M6 18H4l2-3H4" />
  </svg>
);
const LinkIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const CodeIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const ACTIONS: ToolbarAction[] = [
  { key: 'bold', title: 'Chữ đậm', icon: BoldIcon, wrap: ['**', '**'], placeholder: 'chữ đậm' },
  { key: 'italic', title: 'Chữ nghiêng', icon: ItalicIcon, wrap: ['*', '*'], placeholder: 'chữ nghiêng' },
  { key: 'heading', title: 'Tiêu đề', icon: HeadingIcon, prefix: '## ', placeholder: 'Tiêu đề' },
  { key: 'ul', title: 'Danh sách', icon: ListIcon, prefix: '- ', placeholder: 'mục' },
  { key: 'ol', title: 'Danh sách số', icon: OrderedListIcon, prefix: '1. ', placeholder: 'mục' },
  { key: 'link', title: 'Liên kết', icon: LinkIcon, wrap: ['[', '](https://)'], placeholder: 'liên kết' },
  { key: 'code', title: 'Mã', icon: CodeIcon, wrap: ['`', '`'], placeholder: 'mã' },
];

export default function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder,
  rows = 12,
  required = false,
}: MarkdownEditorProps) {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  const applyAction = (action: ToolbarAction) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);

    let next: string;
    let cursorStart: number;
    let cursorEnd: number;

    if (action.wrap) {
      const [open, close] = action.wrap;
      const inner = selected || action.placeholder || '';
      next = value.slice(0, start) + open + inner + close + value.slice(end);
      cursorStart = start + open.length;
      cursorEnd = cursorStart + inner.length;
    } else {
      const prefix = action.prefix || '';
      const inner = selected || action.placeholder || '';
      const needsNewline = start > 0 && value[start - 1] !== '\n';
      const insert = (needsNewline ? '\n' : '') + prefix + inner;
      next = value.slice(0, start) + insert + value.slice(end);
      cursorStart = cursorEnd = start + insert.length;
    }

    onChange(next);

    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const previewHtml = markdownToHtml(value);

  const toolbar = (
    <div className="flex flex-wrap gap-1 mb-2">
      {ACTIONS.map((a) => (
        <button
          key={a.key}
          type="button"
          title={a.title}
          aria-label={a.title}
          onClick={() => applyAction(a)}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary-500"
        >
          {a.icon}
        </button>
      ))}
    </div>
  );

  const textarea = (
    <textarea
      ref={textareaRef}
      id={id}
      value={value}
      required={required}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-y"
    />
  );

  const preview = (
    <div
      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 overflow-auto prose-sm
        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1
        [&_p]:my-2 [&_p]:leading-relaxed text-gray-800 dark:text-gray-100
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1
        [&_a]:text-primary-600 dark:[&_a]:text-primary-400 [&_a]:underline
        [&_code]:bg-gray-100 dark:[&_code]:bg-gray-700 [&_code]:px-1 [&_code]:rounded [&_code]:text-sm"
      style={{ minHeight: rows * 24 }}
      dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-gray-400 dark:text-gray-500">Xem trước…</p>' }}
    />
  );

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      {toolbar}

      <div className="md:grid md:grid-cols-2 md:gap-3">
        <div className={mobileTab === 'edit' ? 'block' : 'hidden md:block'}>{textarea}</div>
        <div className={mobileTab === 'preview' ? 'block' : 'hidden md:block'}>{preview}</div>
      </div>

      <div className="mt-2 md:hidden flex gap-2">
        <button
          type="button"
          onClick={() => setMobileTab('edit')}
          aria-pressed={mobileTab === 'edit'}
          className={`flex-1 min-h-[44px] rounded-md border text-sm font-medium ${
            mobileTab === 'edit'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Soạn
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          aria-pressed={mobileTab === 'preview'}
          className={`flex-1 min-h-[44px] rounded-md border text-sm font-medium ${
            mobileTab === 'preview'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Xem trước
        </button>
      </div>
    </div>
  );
}
