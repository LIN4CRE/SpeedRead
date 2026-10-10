import { describe, it, expect } from 'vitest';
import { extractCleanArticle, generateSpeedReadBookmarklet } from '../src/utils/webClipper';

describe('Web Clipper & Readability Engine', () => {
  it('extracts clean text from plain text input', () => {
    const raw = 'This is an article headline.\n\nHere is paragraph one with interesting facts.';
    const result = extractCleanArticle(raw, 'Manual Article');
    expect(result.title).toBe('Manual Article');
    expect(result.cleanedText).toContain('paragraph one with interesting facts');
    expect(result.wordCount).toBeGreaterThan(5);
  });

  it('strips HTML boilerplate, script tags, and navigations', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cognitive Science of Speed Reading | TechDaily</title>
          <meta name="author" content="Dr. Jane Smith" />
        </head>
        <body>
          <nav><a>Home</a><a>About</a></nav>
          <header>Site Header Banner</header>
          <script>console.log("analytics");</script>
          <div class="ad">Advertisement Here</div>
          <article>
            <h1>Cognitive Science of Speed Reading</h1>
            <p>Rapid serial visual presentation enables the human visual cortex to absorb words at extreme velocities.</p>
            <p>By keeping the eye completely stationary at the optimal recognition point, saccadic movements are eliminated.</p>
          </article>
          <footer>Copyright 2026</footer>
        </body>
      </html>
    `;

    const result = extractCleanArticle(html);
    expect(result.title).toContain('Cognitive Science of Speed Reading');
    expect(result.cleanedText).toContain('visual cortex');
    expect(result.cleanedText).toContain('saccadic movements are eliminated');
    expect(result.cleanedText).not.toContain('Advertisement Here');
    expect(result.cleanedText).not.toContain('Site Header Banner');
    expect(result.cleanedText).not.toContain('analytics');
    expect(result.wordCount).toBeGreaterThan(15);
  });

  it('generates a valid javascript bookmarklet string', () => {
    const defaultBookmarklet = generateSpeedReadBookmarklet();
    expect(defaultBookmarklet.startsWith('javascript:(function()')).toBe(true);
    expect(defaultBookmarklet).toContain('lin4cre.github.io/SpeedRead');
    expect(defaultBookmarklet).toContain('getSelection');

    const customBookmarklet = generateSpeedReadBookmarklet('https://lin4cre.github.io/SpeedRead/');
    expect(customBookmarklet).toContain('lin4cre.github.io/SpeedRead');
  });
});
