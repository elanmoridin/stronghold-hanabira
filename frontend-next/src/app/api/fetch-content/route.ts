// app/api/fetch-content/route.ts

import { NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { safeFetchText, BlockedUrlError } from '@/lib/safeFetch';

// node:http/https + dns are needed for the SSRF guard
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // was: fetch(url) on anything, incl. localhost / LAN / cloud metadata (SSRF)
    const res = await safeFetchText(url);
    if (!/html|xml|text\/plain/i.test(res.contentType)) {
      return NextResponse.json({ error: 'URL is not an HTML page' }, { status: 415 });
    }

    const dom = new JSDOM(res.body, { url: res.url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const content = article ? article.textContent : 'Unable to extract content';

    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof BlockedUrlError) {
      return NextResponse.json({ error: `URL not allowed: ${error.message}` }, { status: 400 });
    }
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 502 });
  }
}
