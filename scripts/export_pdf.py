from pathlib import Path
import argparse
import json

import pymupdf
from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description="Export the shared portfolio page to a tagged PDF.")
    parser.add_argument("--url", default="http://127.0.0.1:4173/")
    parser.add_argument("--output", default="downloads/meharin-onty-marketing-portfolio.pdf")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    content = json.loads((root / "content" / "portfolio.json").read_text(encoding="utf-8"))
    output = root / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="msedge", headless=True)
        try:
            page = browser.new_page(viewport={"width": 1280, "height": 960})
            page.goto(args.url, wait_until="networkidle")
            page.evaluate("document.fonts.ready")
            page.locator("img[src]").evaluate_all(
                "(images) => Promise.all(images.map(img => { img.loading = 'eager'; return img.decode(); }))"
            )
            page.emulate_media(media="print")
            dimensions = page.locator(".folio-page").evaluate_all(
                "(pages) => pages.map(p => ({id: p.id, height: p.clientHeight, content: p.scrollHeight}))"
            )
            overflows = [item for item in dimensions if item["content"] > item["height"] + 2]
            if overflows:
                raise RuntimeError(f"Print content overflows its page: {overflows}")
            page.pdf(
                path=str(output),
                prefer_css_page_size=True,
                print_background=True,
                display_header_footer=False,
                tagged=True,
                outline=True,
            )
        finally:
            browser.close()
    temporary = output.with_suffix(".optimized.pdf")
    with pymupdf.open(output) as document:
        if len(document) != len(content["projects"]) + 2:
            raise RuntimeError(f"Unexpected PDF page count: {len(document)}")
        document.rewrite_images(dpi_threshold=240, dpi_target=180, quality=90, bitonal=False)
        document.set_metadata({
            **document.metadata,
            "title": f"{content['name']} - Marketing Portfolio",
            "author": content["name"],
            "subject": "Selected marketing work and independent creative concepts",
            "keywords": "Graduate marketing, social content, creative concepts, portfolio",
        })
        outline = [[1, "Meet Meharin", 1]]
        outline.extend([1, project["brand"] + " / " + project["category"], index + 2]
                       for index, project in enumerate(content["projects"]))
        outline.append([1, "About me and contact", len(document)])
        document.set_toc(outline)
        document.save(temporary, garbage=4, deflate=True)
    temporary.replace(output)
    print(f"Exported {output}")


if __name__ == "__main__":
    main()
