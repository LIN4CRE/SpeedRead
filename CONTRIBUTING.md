# Contributing to SpeedRead

Thank you for your interest in contributing to **SpeedRead (Kinetic RSVP Speed Reader)**! We welcome contributions of all kinds, including bug fixes, performance enhancements, feature proposals, typography improvements, and documentation.

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later (v20+ or v22+ recommended)
- **npm**: v9.0.0 or later

### Local Development Setup

1. **Fork & Clone** the repository:
   ```bash
   git clone https://github.com/LIN4CRE/SpeedRead.git
   cd SpeedRead
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

## Testing & Quality Assurance

Before submitting any Pull Request, ensure that all checks pass:

```bash
# 1. Type Check (TypeScript strict compilation)
npm run lint

# 2. Run Automated Test Suite
npm test

# 3. Verify Production Build
npm run build
```

### Critical Architecture Rules

When modifying the RSVP rendering engine or reader components, you must adhere to the following strict guidelines:

1. **Zero-Jitter Focal Axis Guarantee:**
   - In [`ReticleDisplay.tsx`](src/components/ReticleDisplay.tsx), the Optimal Recognition Point (ORP) focal letter must remain horizontally static at all times.
   - Never use variable-width flex child containers or unanchored letter spans that shift based on character width differences.
2. **Unicode & Diacritics Preservation:**
   - Text parsing in [`orp.ts`](src/utils/orp.ts) must use Unicode property escapes (`\p{L}`, `\p{N}`) with the `/u` flag. Never use ASCII-only `\w` or `[a-zA-Z]`.
3. **Public Domain Compliance:**
   - Never commit copyrighted or proprietary text samples. All bundled texts must be verified public domain (e.g. Project Gutenberg) or original content.

---

## Pull Request Guidelines

1. **Create a topic branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Write meaningful commit messages** following the Conventional Commits specification:
   - `feat: add dyslexia font ligature toggle`
   - `fix: prevent audio pacer double-trigger on paused state`
   - `docs: update keyboard shortcuts table`
3. **Add automated tests** in `tests/` for any new utility, tokenizer logic, or parser enhancements.
4. **Submit your Pull Request** targeting the `main` branch, filling out the PR template completely.

---

## Questions and Discussions

If you have questions or want to discuss a large architectural refactoring before coding, feel free to open a [GitHub Discussion](https://github.com/LIN4CRE/SpeedRead/discussions) or submit an [Issue](https://github.com/LIN4CRE/SpeedRead/issues).
