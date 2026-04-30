"""
Pre-render 4 voorbeeld-rapporten als HTML + PDF voor instant-download op de
recruitmentapk.nl landing.

Run lokaal:
    cd ~/projects/Recruitment-APK
    python3 scripts/prerender_samples.py

Output: samples/<slug>.{html,pdf}

Gebruikt canned analyses uit samples/.cache/<slug>.json — geen Claude API spend.
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from apk_print_renderer import render_print_html

OUT_DIR = REPO_ROOT / "samples"
CACHE_DIR = REPO_ROOT / "samples" / ".cache"
OUT_DIR.mkdir(exist_ok=True)

SAMPLES = [
    {
        "slug": "bouwbedrijf-mkb-50-150-fte",
        "sector": "bouw-installatie",
        "teamgrootte": "50-150 FTE",
        "regio": "nederland",
        "bedrijf": "Voorbeeld Bouwbedrijf B.V.",
    },
    {
        "slug": "tech-scaleup-20-80-fte",
        "sector": "tech-saas",
        "teamgrootte": "20-80 FTE",
        "regio": "amsterdam",
        "bedrijf": "Voorbeeld Tech-Scaleup B.V.",
    },
    {
        "slug": "industrie-maakbedrijf-200-plus-fte",
        "sector": "industrie-maakbedrijf",
        "teamgrootte": "200+ FTE",
        "regio": "oost-nederland",
        "bedrijf": "Voorbeeld Industrie B.V.",
    },
    {
        "slug": "zorginstelling-500-plus-fte",
        "sector": "zorg-welzijn",
        "teamgrootte": "500+ FTE",
        "regio": "midden-nederland",
        "bedrijf": "Voorbeeld Zorginstelling",
    },
]


def render_sample(spec: dict) -> tuple[Path, Path | None]:
    slug = spec["slug"]
    print(f"\n=== {slug} ===")

    cache_path = CACHE_DIR / f"{slug}.json"
    if not cache_path.exists():
        print(f"  MISSING canned analysis: {cache_path}")
        return None, None

    analysis = json.loads(cache_path.read_text(encoding="utf-8"))
    score = analysis.get("score", analysis.get("overall_score", "?"))
    print(f"  cache hit: {cache_path.name} (score {score}/100)")

    lead = {
        "bedrijf": spec["bedrijf"],
        "sector": spec["sector"],
        "teamgrootte": spec["teamgrootte"],
        "regio": spec["regio"],
        "_is_sample": True,
    }

    html = render_print_html(lead, analysis)
    print(f"  html: {len(html):,} bytes (print-renderer, 3 pagina's)")

    html_path = OUT_DIR / f"{slug}.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"  saved: {html_path.name}")

    try:
        from weasyprint import HTML
    except ImportError:
        print("  WeasyPrint niet beschikbaar — sla PDF over")
        return html_path, None

    pdf_path = OUT_DIR / f"{slug}.pdf"
    t0 = time.time()
    HTML(string=html, base_url=str(REPO_ROOT)).write_pdf(str(pdf_path))
    print(f"  pdf: {time.time()-t0:.1f}s — {pdf_path.stat().st_size/1024:.0f}kb")
    return html_path, pdf_path


def main():
    results = []
    for spec in SAMPLES:
        try:
            results.append((spec["slug"], *render_sample(spec)))
        except Exception as e:
            print(f"  FOUT: {e}")
            import traceback
            traceback.print_exc()
            results.append((spec["slug"], None, None))

    print("\n=== summary ===")
    for slug, html_p, pdf_p in results:
        status = "OK" if pdf_p else ("html only" if html_p else "FAIL")
        print(f"  {status:10} {slug}")


if __name__ == "__main__":
    main()
