from pathlib import Path
import argparse
import json
import re

import pymupdf
from playwright.sync_api import sync_playwright


def normalized(value):
    value = re.sub(r"(?<=\w)-\s+(?=\w)", "-", value)
    return re.sub(r"\s+", " ", value).strip()


def main():
    parser = argparse.ArgumentParser(description="Check the website and its matching PDF.")
    parser.add_argument("--url", default="http://127.0.0.1:4173/")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    data = json.loads((root / "content" / "portfolio.json").read_text(encoding="utf-8"))
    pdf = root / data["pdf"]
    assert pdf.stat().st_size < 5_000_000, "The portfolio PDF should be under 5 MB."
    with pymupdf.open(pdf) as document:
        assert len(document) == len(data["projects"]) + 2
        assert document.xref_get_key(document.pdf_catalog(), "StructTreeRoot")[0] == "xref"
        assert document.metadata["author"] == data["name"]
        text = normalized(" ".join(page.get_text() for page in document))
        required = [data["hero"]["intro"], data["about"]["body"], data["about"]["contactText"]]
        for project in data["projects"]:
            required.extend([project["title"], project["summary"], project["note"]["text"]])
            for section in project["sections"]:
                required.extend(section.get("items", [section.get("text", "")]))
        for value in required:
            assert normalized(value) in text, f"Missing PDF content: {value}"
        links = [link.get("uri", "") for page in document for link in page.get_links()]
        assert not any("127.0.0.1" in link or "localhost" in link for link in links)
        assert data["linkedin"] in links
        for project in data["projects"]:
            for link in project["links"]:
                assert link["url"] in links
            for media in project["media"]:
                if media.get("url"):
                    assert media["url"] in links
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="msedge", headless=True)
        try:
            for width, height in [(1440, 1000), (768, 1024), (390, 844), (320, 800)]:
                page = browser.new_page(viewport={"width": width, "height": height})
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                response = page.goto(args.url, wait_until="networkidle")
                assert response.status == 200
                page.evaluate("document.fonts.ready")
                page.locator("img[src]").evaluate_all(
                    "(images) => Promise.all(images.map(i => { i.loading = 'eager'; return i.decode(); }))"
                )
                assert not errors, errors
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
                assert not page.locator(".work-card-image > img").evaluate_all(
                    "(images) => images.some(i => i.clientHeight > i.parentElement.clientHeight)"
                ), "A project thumbnail is being unintentionally clipped."
                assert page.locator("article.project").count() == len(data["projects"])
                zoom = page.locator(".zoom-button").first
                zoom.click()
                assert page.locator("dialog").evaluate("(element) => element.open")
                full_image = page.locator(".dialog-original")
                assert full_image.get_attribute("href") == zoom.get_attribute("href") or \
                    full_image.get_attribute("href").endswith(zoom.get_attribute("href"))
                page.keyboard.press("Escape")
                assert not page.locator("dialog").evaluate("(element) => element.open")
                assert zoom.evaluate("(element) => element === document.activeElement")
                download = page.request.get(args.url.rstrip("/") + "/" + data["pdf"])
                assert download.status == 200 and download.body().startswith(b"%PDF-")
                print(f"Passed: {width}px, images, dialog, focus, PDF download and JS errors.")
                page.close()
            page = browser.new_page(java_script_enabled=False)
            page.goto(args.url, wait_until="networkidle")
            assert page.locator("article.project").count() == len(data["projects"])
            assert page.locator("h1").inner_text() == data["hero"]["greeting"]
            assert page.locator("a.zoom-button[href]").count() == 6
            page.close()
            for width in [1440, 768, 390, 320]:
                page = browser.new_page(viewport={"width": width, "height": 1024})
                page.goto(args.url, wait_until="networkidle")
                page.add_style_tag(content="html { font-size: 200% !important; }")
                page.wait_for_timeout(200)
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), \
                    f"The layout must reflow at 200% text size ({width}px)."
                page.get_by_role("link", name="Say hello", exact=False).click()
                page.wait_for_timeout(650)
                assert page.locator("#contact").bounding_box()["y"] >= \
                    page.locator(".site-header").bounding_box()["height"]
                page.close()
        finally:
            browser.close()
    print(f"Passed: shared PDF content, {len(data['projects']) + 2} tagged pages, links and no-JS access.")


if __name__ == "__main__":
    main()
