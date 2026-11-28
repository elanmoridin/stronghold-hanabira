// app/import-article/page.tsx

'use client';

import { useState, FormEvent } from 'react';

const IMPORT_DISABLED_NOTICE =
  'URL import is temporarily disabled while the backend is being rebuilt';

export default function ImportArticlePage() {
  const [url, setUrl] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setContent('');
    // The /api/fetch-content route handler was removed: route handlers are
    // not available in a static export. Show a notice instead of fetching.
    setError(IMPORT_DISABLED_NOTICE);
  };

  return (
    <div>
      <h1>Import Article (Japanese)</h1>
      <p style={{ color: '#a16207' }}>{IMPORT_DISABLED_NOTICE}.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Enter URL:
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />
        </label>
        <button type="submit">Fetch Content</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {content && (
        <div>
          <h2>Article Content</h2>
          <pre>{content}</pre>
        </div>
      )}
    </div>
  );
}
