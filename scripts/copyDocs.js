import fs from 'node:fs';

if (fs.existsSync('dist')) {
  // Ensure .nojekyll, 200.html, and 404.html in dist
  fs.writeFileSync('dist/.nojekyll', '');
  if (fs.existsSync('dist/index.html')) {
    fs.copyFileSync('dist/index.html', 'dist/200.html');
    fs.copyFileSync('dist/index.html', 'dist/404.html');
  }

  // Clean docs/ to prevent orphaned hashed bundles
  if (fs.existsSync('docs')) {
    fs.rmSync('docs', { recursive: true, force: true });
  }

  // Mirror clean dist/ to docs/
  fs.cpSync('dist', 'docs', { recursive: true });
  console.log('✓ Synced clean build output with .nojekyll and 404.html to docs/ for GitHub Pages');
}
