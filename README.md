# The Meharin Edit

Meharin Onty's static marketing portfolio. `content/portfolio.json` is the single source for the website and seven-page PDF, including the Cheeky Panda university project. The original CV, private documents, browser data and source archive are not part of this repository.

## Build and preview

Requires Node.js 20 or later. No npm dependencies are needed.

```powershell
npm run build
npm test
npm run serve
```

The preview is available at `http://127.0.0.1:4173`.

## Export the PDF

With the preview running, use Python 3 and Microsoft Edge:

```powershell
python -m pip install -r requirements-dev.txt
python scripts\export_pdf.py
python scripts\verify.py
```

The export is generated from the same `index.html`, using its print stylesheet. The exporter fails if a page overflows, preserves PDF accessibility tags, adds bookmarks and optimizes large images. The PDF belongs at `downloads\meharin-onty-marketing-portfolio.pdf`.

After changing content or images, rebuild, run the tests, export the PDF and inspect both the mobile website and the PDF. Keep factual claims, image captions and project status accurate.

In the owner's local workspace, keep the delivery copy named `Meharin Onty - Marketing Portfolio.pdf` in the parent `Archive` folder, alongside this repository. It must be byte-identical to the website download. Original CVs and source portfolios are not generated outputs and must not be overwritten.

## GitHub Pages

Publish the `main` branch from the repository root. The site uses relative asset paths and a `.nojekyll` file, so no framework or external build service is required. The canonical address is `https://meharinonty.co.uk/`. Keep the tracked `CNAME` file intact and pull any GitHub-created domain-setting commits before publishing local changes.

## Design and assets

The portfolio uses local fonts and images, no analytics and no third-party embeds. External project links open in a new tab. Image enlargement uses a keyboard-accessible native dialog.

Anzara previews intentionally focus on garments rather than faces. Preserve the original video links, dates, view-count context and contribution attribution when changing these crops. The personal introduction portrait is a separate asset.

DM Sans and DM Serif Display are distributed under the SIL Open Font License; the corresponding licences are in `assets\fonts`. The LinkedIn icon is the official blue `[in]` asset, used only as a link to Meharin's profile. Brand names and supplied project artwork remain the property of their respective owners. Independent concepts are not claims of commissioned work or brand endorsement.

The case-study approach was informed by [Kansas State University's portfolio guidance](https://cdbusiness.ksu.edu/blog/2026/01/29/marketing-portfolio-that-stands-out-tips-and-examples/), [Adobe's case-study guidance](https://www.adobe.com/express/learn/blog/marketing-case-study) and [Framer's portfolio examples](https://www.framer.com/blog/marketing-portfolio-examples/). The layout and implementation are original.
