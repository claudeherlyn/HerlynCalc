# HerlynCalc

> **Make sense of orders of magnitude.** A pedagogical web tool for junior engineers, to avoid drawing hasty conclusions from simulation results.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8.svg)

## 🎯 What it does

A simulation always produces a number. The real question is: *is it plausible?*

HerlynCalc takes a value (raw, or computed from physical context) across **8 categories** — stresses, forces, pressures, strains, torques, frequencies, energies, powers — and compares it to known objects and phenomena across **5 domains**: daily life, sport, nature, industry, and extreme scientific.

Each comparison comes with:
- Multi-unit conversions
- A logarithmic visual scale showing where your value sits
- Ranked "closest match" cards with concrete examples
- Engineering tip
- Bilingual UI (FR / EN)
- Native PDF export

## 🚀 Quick start

```bash
# Install dependencies
npm install

# Run dev server (opens at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

### Vercel (recommended — 2 min)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), click **Import Project**
3. Pick this repo → Vercel auto-detects Vite, click **Deploy**
4. Your site is live at `your-project.vercel.app`

### Netlify

1. Push to GitHub
2. On Netlify, **New site from Git** → select repo
3. Build command: `npm run build` · Publish directory: `dist`

### GitHub Pages

Add a workflow in `.github/workflows/deploy.yml` (see template in this repo) and enable Pages on the `gh-pages` branch.

## 🛠 Tech stack

- **React 18** with functional components and hooks
- **Vite 5** for fast dev and optimized build
- **Tailwind CSS 3** for utility-first styling
- **lucide-react** for icons
- Inline SVG for technical schematics
- `window.print()` + `@media print` CSS for PDF export

## 📁 Project structure

```
HerlynCalc/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx          # React entry point
    ├── index.css         # Tailwind directives
    └── HerlynCalc.jsx    # The whole app (~600 lines)
```

## 🤝 Contributing

Suggestions, references to add, translations, and bug reports are welcome. Open an issue or a PR.

## 📜 License

MIT © Herlyn Claude Magaya Mapaga

## 🙏 Acknowledgments

Developed with the assistance of Claude (Anthropic). The pedagogical idea came from observing that junior engineers often lack intuition for orders of magnitude, which is a major source of unnoticed errors in simulation interpretation.
