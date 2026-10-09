import { WebClipperResult } from '../types/reader';

/**
 * Strips HTML tags, navigation boilerplate, scripts, ads, and cookies
 * to extract clean reading prose for RSVP presentation.
 */
export function extractCleanArticle(rawHtmlOrText: string, fallbackTitle = 'Web Clipped Article'): WebClipperResult {
  if (!rawHtmlOrText || !rawHtmlOrText.trim()) {
    return {
      title: fallbackTitle,
      cleanedText: '',
      wordCount: 0,
    };
  }

  // If input is plain text rather than HTML
  if (!rawHtmlOrText.includes('<') || !rawHtmlOrText.includes('>')) {
    const cleaned = rawHtmlOrText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    return {
      title: fallbackTitle,
      cleanedText: cleaned,
      wordCount: words.length,
    };
  }

  // If in browser DOM environment, parse via DOMParser
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtmlOrText, 'text/html');

      // 1. Extract Title
      let title = doc.querySelector('title')?.innerText || '';
      const h1 = doc.querySelector('h1')?.innerText || '';
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
      title = ogTitle || h1 || title || fallbackTitle;
      title = title.replace(/\s*[-|–—]\s*.*$/, '').trim(); // Remove " | SiteName" suffix

      // 2. Extract Author / Byline
      const byline = 
        doc.querySelector('meta[name="author"]')?.getAttribute('content') ||
        doc.querySelector('[rel="author"]')?.textContent?.trim() ||
        doc.querySelector('.author, .byline')?.textContent?.trim() ||
        undefined;

      // 3. Remove clutter nodes
      const junkSelectors = [
        'script', 'style', 'noscript', 'iframe', 'svg', 'canvas',
        'nav', 'header', 'footer', 'aside',
        '.ad', '.ads', '.advertisement', '#ad',
        '.sidebar', '.menu', '.cookie-banner', '.gdpr',
        '.social-share', '.newsletter', '.comments', '#comments'
      ];

      junkSelectors.forEach((sel) => {
        doc.querySelectorAll(sel).forEach((el) => el.remove());
      });

      // 4. Target main content container if available
      const mainContainer = 
        doc.querySelector('article') ||
        doc.querySelector('main') ||
        doc.querySelector('[role="main"]') ||
        doc.querySelector('.post-content, .article-content, .entry-content, #content') ||
        doc.body;

      // Extract paragraphs and headings
      const blocks: string[] = [];
      const contentNodes = mainContainer.querySelectorAll('h1, h2, h3, h4, p, blockquote, li');

      if (contentNodes.length > 0) {
        contentNodes.forEach((node) => {
          const text = (node.textContent || '').trim();
          if (text.length > 20) { // filter out 1-line noise
            blocks.push(text);
          }
        });
      } else {
        // Fallback to raw text
        const raw = mainContainer.textContent || '';
        blocks.push(raw.trim());
      }

      const cleanedText = blocks.join('\n\n');
      const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

      return {
        title,
        byline,
        cleanedText,
        wordCount,
      };
    } catch (e) {
      console.warn('DOMParser failed in webClipper, using regex fallback:', e);
    }
  }

  // Regex fallback for non-DOM/node environments
  let text = rawHtmlOrText;

  // Extract <article> tag contents if present
  const articleMatch = text.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    text = articleMatch[1];
  } else {
    // Strip head, script, style, nav, header, footer, aside
    text = text.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '');
    text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
    text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
    text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
    text = text.replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');
    text = text.replace(/<div\b[^>]*\b(class|id)=["'][^"']*\b(ad|advertisement|sidebar)\b[^"']*["'][^<]*(?:(?!<\/div>)<[^<]*)*<\/div>/gi, '');
  }

  // Remove script and style blocks
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Replace <p>, <br>, <h1>-<h6> with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean excessive whitespace
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Extract title in regex fallback mode
  const titleMatch = rawHtmlOrText.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ||
                     rawHtmlOrText.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  let parsedTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : fallbackTitle;
  parsedTitle = parsedTitle.replace(/\s*[-|–—]\s*.*$/, '').trim() || fallbackTitle;

  const authorMatch = rawHtmlOrText.match(/meta\s+name=["']author["']\s+content=["']([^"']+)["']/i) ||
                      rawHtmlOrText.match(/class=["'][^"']*author[^"']*["'][^>]*>([\s\S]*?)<\//i);
  const byline = authorMatch ? authorMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;

  return {
    title: parsedTitle,
    byline,
    cleanedText: text,
    wordCount,
  };
}

/**
 * Generates copyable JavaScript bookmarklet code for 1-click web clipping
 */
export function generateSpeedReadBookmarklet(appBaseUrl = 'https://speedread-rsvp.surge.sh'): string {
  // Bookmarklet gets selected text or article text and opens SpeedRead
  const code = `
javascript:(function(){
  try {
    var sel = window.getSelection().toString();
    var text = sel || (document.querySelector('article') ? document.querySelector('article').innerText : document.body.innerText);
    var title = document.title || 'Clipped Article';
    var payload = { title: title, text: text.substring(0, 50000) };
    var storageKey = 'speedread_pending_clip';
    localStorage.setItem(storageKey, JSON.stringify(payload));
    window.open('${appBaseUrl}?clip=1', '_blank');
  } catch(e) {
    alert('SpeedRead Clipper: ' + e.message);
  }
})();
  `.replace(/\s+/g, ' ').trim();

  return code;
}

/**
 * Fetch and parse article content from public URL with CORS proxy support
 */
export async function fetchArticleFromUrl(url: string): Promise<WebClipperResult> {
  const targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    throw new Error('Please enter a valid HTTP or HTTPS URL.');
  }

  // List of public CORS proxies to ensure reliable in-browser fetching
  const proxies = [
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ];

  let rawHtml = '';
  let lastError: Error | null = null;

  for (const proxyFn of proxies) {
    try {
      const proxyUrl = proxyFn(targetUrl);
      const res = await fetch(proxyUrl, { headers: { 'Accept': 'text/html,application/xhtml+xml' } });
      if (res.ok) {
        rawHtml = await res.text();
        if (rawHtml.length > 100) break;
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  if (!rawHtml) {
    throw new Error(lastError?.message || 'Could not fetch web page. You can paste the text directly.');
  }

  const result = extractCleanArticle(rawHtml, new URL(targetUrl).hostname);
  result.sourceUrl = targetUrl;
  return result;
}
