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

Use first-person project narration and the full name **Nasima's Childcare**. Its case study distinguishes launching the first social presence from updating an existing website, and reports views, combined reach and search impressions without implying enquiry conversions. Keep small performance counts and budget figures out of the public copy and results artwork; dates, page numbers and qualification grades are separate from that presentation rule. Flora and Boden are original independent concepts, not commissioned campaigns.

The Nasima's Childcare `testimonial` is a short, verbatim excerpt from the supplied manager recommendation. Keep the named attribution and LinkedIn source link, use the same quote in both formats, and omit the recommendation date. The single-line desktop/print treatment wraps naturally on mobile, without adding a section or PDF page. This follows [portfolio guidance published by Tulane](https://careerengagement.tulane.edu/blog/2023/08/07/beyond-the-resume-using-a-portfolio-to-showcase-your-skills-and-experience/) on genuine supervisor testimonials and brevity.

`about.learning.courses` holds each completed Google course's title, CV-recorded grade, public Coursera verification link and local certificate image. The certificates verify course completion; they do not display the grades or establish completion of the full professional certificate. Preserve each title-to-certificate pairing and show the grade beside, not on, the original certificate artwork.

In the owner's local workspace, keep the delivery copy named `Meharin Onty - Marketing Portfolio.pdf` in the parent `Archive` folder, alongside this repository. It must be byte-identical to the website download. Original CVs and source portfolios are not generated outputs and must not be overwritten.

## GitHub Pages

Publish the `main` branch from the repository root. The site uses relative asset paths and a `.nojekyll` file, so no framework or external build service is required. The canonical address is `https://meharinonty.co.uk/`. Keep the tracked `CNAME` file intact and pull any GitHub-created domain-setting commits before publishing local changes.

## Design and assets

The portfolio uses local fonts and images, no analytics and no third-party embeds. External project links open in a new tab. Image enlargement uses a keyboard-accessible native dialog.

Reusable source derivatives and evidence files belong in the gitignored `.portfolio-assets\` directory. They remain local-only and must not be published or committed.

Course certificate previews are cropped only to remove the surrounding blank margins from the owner's public Coursera certificate images. The unchanged downloads and source details stay in `.portfolio-assets\Coursera certificates\`; the site serves local WebP derivatives, not third-party embeds. The paid-social summary is generated from the retained Meta evidence by `.portfolio-assets\Nasimas paid results\render-summary.py` with the preview running.

Anzara previews intentionally focus on garments rather than faces. Preserve the original video links, dates, view-count context and contribution attribution when changing these crops. The personal introduction portrait is a separate asset.

DM Sans and DM Serif Display are distributed under the SIL Open Font License; the corresponding licences are in `assets\fonts`. The LinkedIn icon is the official blue `[in]` asset, used only as a link to Meharin's profile. Brand names and supplied project artwork remain the property of their respective owners. Independent concepts are not claims of commissioned work or brand endorsement.

The case-study approach was informed by [Kansas State University's portfolio guidance](https://cdbusiness.ksu.edu/blog/2026/01/29/marketing-portfolio-that-stands-out-tips-and-examples/), [Adobe's case-study guidance](https://www.adobe.com/express/learn/blog/marketing-case-study) and [Framer's portfolio examples](https://www.framer.com/blog/marketing-portfolio-examples/). The layout and implementation are original.

The first-person voice also follows [DESK's portfolio-writing discussion](https://vanschneider.com/blog/portfolio-tips/portfolios-third-person/): personal portfolio copy can be warmer and more direct than a third-person press bio.
