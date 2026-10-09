## Description

Provide a clear and concise description of the changes proposed in this Pull Request.

Fixes # (issue)

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] ⚡ Performance optimization (rendering speed, bundle size reduction)
- [ ] 🎨 UI/UX or Typography enhancement
- [ ] 📝 Documentation update
- [ ] 🧪 Tests / CI improvement

## RSVP Engine Verification Checklist

- [ ] **Zero-Jitter Check:** Verified that words at 500+ WPM maintain a stationary horizontal focal axis without ocular drift.
- [ ] **Unicode Check:** Tested accented / international words (e.g., *café*, *résumé*, *über*) without clipping or malformed focal index.
- [ ] **Audio Safety Check:** Verified audio features do not cause memory leaks or browser audio thread crashes.
- [ ] **Cross-Browser Check:** Tested on Chrome, Firefox, or Safari.

## Quality Assurance

- [ ] `npm run lint` passes with 0 errors (`tsc --noEmit`)
- [ ] `npm test` passes with 100% green tests
- [ ] `npm run build` generates production bundle cleanly
