"use client";

// components/MarkdownContent.tsx
// Static export: markdown files are served from /public and fetched at
// runtime in the browser instead of being read from disk server-side.

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

//tailwind markdown pkg documentation
//https://www.npmjs.com/package/@tailwindcss/typography

interface MarkdownContentProps {
  lang: string;
  slug: string;
}

function MarkdownContent({ lang, slug }: MarkdownContentProps) {
  const decodedSlug = decodeURIComponent(slug);

  // Sanitize and process the slug
  //const sanitizedSlug = decodedSlug.replace(/\s+/g, '_');
  // Sanitize and process the slug   Korean grammar has hundreds of slashes so we replace / by -, because that is our file structure naming
  const sanitizedSlug = decodedSlug.replace(/\s+/g, '_').replace(/\//g, '-');

  const fileName = `${sanitizedSlug}.md`;

  // Determine the content directory based on the language
  // (directories live under /public and are served statically)
  let contentDirectory;
  if (lang === 'jap') {
    contentDirectory = 'markdown_grammar_japanese';
  } else if (lang === 'kor') {
    contentDirectory = 'markdown_grammar_korean';
  } else if (lang === 'mandarin') {
    // No public/markdown_grammar_mandarin exists: the fetch 404s and the
    // component renders the same "Markdown file not found." UI as before.
    contentDirectory = 'markdown_grammar_mandarin';
  } else {
    contentDirectory = ''; // default path if needed
  }

  const [content, setContent] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setContent(null);

    fetch(`/${contentDirectory ? contentDirectory + '/' : ''}${fileName}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Markdown file not found.');
        }
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        // Convert Markdown to HTML and sanitize it in the browser
        const rawContent = marked.parse(text, { async: false });
        setContent(DOMPurify.sanitize(rawContent));
      })
      .catch(() => {
        if (cancelled) return;
        setNotFound(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName, contentDirectory]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (notFound || content === null) {
    return <div>Markdown file not found.</div>;
  }

  return (
    <article className="prose prose-slate mx-auto p-4 max-w-full">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}

export default MarkdownContent;
