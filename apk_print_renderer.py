"""
Print-PDF voorbeeld-renderer voor sample-rapporten op recruitmentapk.nl.

Bewust GEEN volledig rapport — een 3-pagina teaser die de belangrijkste
onderwerpen laat zien en visitors triggert om hun eigen assessment in te
vullen. Conversie boven completeness.

Pagina's:
  P1 — Cover + executive (overall_score, samenvatting, 4 categorie-KPIs)
  P2 — Hoogtepunten (sub-topic scores · sterktes/zwaktes · top action items 30d)
  P3 — "Wat zit er nog meer in?" + CTA-back

Pattern: gebaseerd op KT print_renderer (CLAUDE.md WEASYPRINT_FLEX_REGEL).
Brand: BraveBrand cyan (#09aedd) op dark ink (#05080c) met oranje accent (#E8630A).
"""
from __future__ import annotations
from datetime import datetime
import math

# ── Tokens ───────────────────────────────────────────────────────────────────
ACCENT = "#09aedd"        # BraveBrand cyan (primary)
ACCENT_2 = "#E8630A"      # BraveBrand orange (secondary)
INK = "#05080c"           # near-black brand ink
MUTED = "#6B7280"
LIGHT = "#F5F5F5"
BORDER = "#E5E7EB"
GREEN = "#059669"
AMBER = "#E8630A"         # use orange for amber state
RED = "#dc2626"

TOTAL_PAGES = 3

# Tier-mapping consistent with src/components/Rapport.tsx
def _tier_label(percent: int) -> tuple[str, str]:
    """Returns (label, color) per recruitment-maturity tier."""
    if percent >= 85:
        return "Expert", "#b45309"
    if percent >= 65:
        return "Professional", GREEN
    if percent >= 40:
        return "Groeier", ACCENT_2
    return "Starter", RED


def _score_ring_svg(score: int, label: str = "Score") -> str:
    """Donut ring met score (0-100) — kleur op basis van waarde."""
    r = 44
    circ = 2 * math.pi * r
    filled = circ * score / 100
    color = GREEN if score >= 65 else (ACCENT_2 if score >= 40 else RED)
    return (
        f'<svg width="110" height="110" viewBox="0 0 110 110">'
        f'<circle cx="55" cy="55" r="{r}" fill="none" stroke="#E5E7EB" stroke-width="9"/>'
        f'<circle cx="55" cy="55" r="{r}" fill="none" stroke="{color}" stroke-width="9" '
        f'stroke-dasharray="{filled:.1f} {circ:.1f}" stroke-linecap="round" '
        f'transform="rotate(-90 55 55)"/>'
        f'<text x="55" y="50" text-anchor="middle" font-family="Arial" font-size="26" '
        f'fill="{INK}" font-weight="700">{score}</text>'
        f'<text x="55" y="68" text-anchor="middle" font-family="Arial" font-size="10" '
        f'fill="{MUTED}">{label}</text>'
        f'</svg>'
    )


_BASE_CSS = """
@page { size: A4 portrait; margin: 0 }
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

* { box-sizing: border-box }
html, body { margin: 0; padding: 0; background: #fff; font-family: 'Inter', system-ui, sans-serif; font-size: 10pt; line-height: 1.55; color: """ + INK + """; -webkit-print-color-adjust: exact; print-color-adjust: exact }

.page {
  width: 210mm; height: 297mm;
  padding: 16mm 18mm 16mm;
  position: relative;
  overflow: hidden;
  background: #fff;
  page-break-after: always;
  break-after: page;
}
.page:last-child { page-break-after: auto; break-after: auto }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  font-family: 'JetBrains Mono', monospace; font-size: 8pt;
  letter-spacing: 0.12em; text-transform: uppercase; color: """ + MUTED + """;
  border-bottom: 1px solid """ + BORDER + """;
  padding-bottom: 6pt; margin-bottom: 12pt;
}
.page-header .brand { color: """ + INK + """; font-weight: 700 }
.page-header .brand .dot { display: inline-block; width: 6pt; height: 6pt; border-radius: 50%; background: """ + ACCENT + """; margin-right: 5pt; vertical-align: 1pt }

.page-footer {
  position: absolute; bottom: 10mm; left: 18mm; right: 18mm;
  display: flex; justify-content: space-between;
  font-family: 'JetBrains Mono', monospace; font-size: 8pt;
  letter-spacing: 0.12em; text-transform: uppercase; color: """ + MUTED + """;
  border-top: 1px solid """ + BORDER + """; padding-top: 8pt;
}

h1, h2, h3, h4 { margin: 0; font-weight: 800; letter-spacing: -0.02em; color: """ + INK + """ }
p { margin: 0 0 8pt }

.module-label { font-family: 'JetBrains Mono', monospace; font-size: 9pt; font-weight: 700; color: """ + ACCENT + """; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 4pt }

/* KPI grid via TABLE (Chromium-PDF predictabel) */
.kpi-grid { width: 100%; border-collapse: separate; border-spacing: 8pt; table-layout: fixed; margin: 14pt 0 }
.kpi-grid td { background: """ + LIGHT + """; padding: 18pt 8pt; text-align: center; border-radius: 8pt; vertical-align: middle }
.kpi-grid .v { font-size: 22pt; font-weight: 800; color: """ + INK + """; line-height: 1.05 }
.kpi-grid .v.accent { color: """ + ACCENT + """ }
.kpi-grid .v.green { color: """ + GREEN + """ }
.kpi-grid .v.amber { color: """ + AMBER + """ }
.kpi-grid .v.red { color: """ + RED + """ }
.kpi-grid .l { font-size: 8pt; color: """ + MUTED + """; margin-top: 6pt; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600 }

.callout { padding: 12pt 16pt; border-radius: 6pt; margin: 10pt 0; font-size: 10pt; line-height: 1.55 }
.callout--accent { background: rgba(9,174,221,0.08); border-left: 3pt solid """ + ACCENT + """ }
.callout--ink { background: """ + INK + """; color: #fff }
.callout--green { background: #F0FDF4; border-left: 3pt solid """ + GREEN + """ }
.callout--red { background: #FEF2F2; border-left: 3pt solid """ + RED + """ }

/* COVER ─────────────────────────── */
.cover { position: relative; height: 100% }
.cover .brand-strip { background: """ + ACCENT + """; color: """ + INK + """; padding: 7pt 16pt; margin: -16mm -18mm 0; font-family: 'JetBrains Mono', monospace; font-size: 8pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; display: table; width: calc(100% + 36mm) }
.cover .brand-strip > div { display: table-cell; vertical-align: middle }
.cover .brand-strip .right { text-align: right }
.cover .top-strip { display: flex; justify-content: space-between; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 8pt; letter-spacing: 0.15em; text-transform: uppercase; color: """ + MUTED + """; margin-top: 12pt }
.cover .top-strip .brand { color: """ + INK + """; font-weight: 700; font-size: 11pt }
.cover .top-strip .brand .dot { display: inline-block; width: 8pt; height: 8pt; border-radius: 50%; background: """ + ACCENT + """; margin-right: 7pt; vertical-align: 1pt }
.cover .lead-meta { font-family: 'JetBrains Mono', monospace; font-size: 9pt; letter-spacing: 0.18em; text-transform: uppercase; color: """ + ACCENT + """; font-weight: 700; margin: 22pt 0 6pt }
.cover h1 { font-weight: 900; font-size: 60pt; line-height: 0.92; letter-spacing: -0.04em; margin: 0 0 8pt; max-width: 88% }
.cover h1 .accent { color: """ + ACCENT + """ }
.cover .deck { font-size: 12pt; line-height: 1.5; color: """ + MUTED + """; max-width: 88%; margin: 0 0 14pt }
.cover .score-row { display: table; width: 100%; margin: 8pt 0; background: """ + LIGHT + """; border-radius: 8pt; padding: 14pt }
.cover .score-row > div { display: table-cell; vertical-align: middle }
.cover .score-row .ring { width: 130pt; padding-right: 16pt }
.cover .score-row .summary { font-size: 10.5pt; line-height: 1.55 }
.cover .summary strong { color: """ + INK + """ }
.cover .summary .h-label { font-family: 'JetBrains Mono', monospace; font-size: 8pt; font-weight: 700; color: """ + ACCENT + """; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 6pt; display: block }
.cover .tier-pill { display: inline-block; padding: 3pt 10pt; border-radius: 100pt; font-family: 'JetBrains Mono', monospace; font-size: 8pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6pt }

.cover .preview-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 8pt; table-layout: fixed; margin-top: 12pt }
.cover .preview-grid > div { display: table-cell; padding: 10pt 10pt 12pt; border: 1.5pt solid """ + ACCENT + """; border-radius: 8pt; vertical-align: top; background: #fff }
.cover .preview-grid .num { font-family: 'JetBrains Mono', monospace; font-size: 9pt; font-weight: 700; color: """ + ACCENT + """; letter-spacing: 0.15em; text-transform: uppercase }
.cover .preview-grid .v { font-size: 12pt; font-weight: 800; color: """ + INK + """; letter-spacing: -0.015em; line-height: 1.2; margin: 4pt 0 2pt; word-wrap: break-word }
.cover .preview-grid .l { font-size: 8.5pt; color: """ + MUTED + """; line-height: 1.4 }
.cover .preview-label { font-family: 'JetBrains Mono', monospace; font-size: 9pt; font-weight: 700; color: """ + ACCENT + """; letter-spacing: 0.15em; text-transform: uppercase; margin: 14pt 0 0; padding-top: 10pt; border-top: 1px solid """ + BORDER + """ }
.cover .footer-band { position: absolute; left: 0; right: 0; bottom: 0; border-top: 3pt solid """ + ACCENT + """; padding-top: 10pt }
.cover .footer-band .row { display: flex; justify-content: space-between; align-items: baseline; gap: 14pt }
.cover .footer-band .left { font-size: 10pt; color: """ + INK + """; white-space: nowrap }
.cover .footer-band .left strong { color: """ + ACCENT + """; font-weight: 700; letter-spacing: 0.02em }
.cover .footer-band .right { font-family: 'JetBrains Mono', monospace; font-size: 8pt; color: """ + MUTED + """; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap }

/* HIGHLIGHTS PAGE ────────────────── */
.highlight-block { padding: 8pt 12pt; border: 1px solid """ + BORDER + """; border-radius: 7pt; margin-bottom: 6pt; break-inside: avoid; page-break-inside: avoid }
.highlight-block .h-label { font-family: 'JetBrains Mono', monospace; font-size: 7.5pt; font-weight: 700; color: """ + ACCENT + """; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2pt }
.highlight-block .h-title { font-size: 11pt; font-weight: 800; letter-spacing: -0.015em; margin-bottom: 5pt }

/* CTA BACK PAGE ──────────────────── */
.cta-page { display: flex; flex-direction: column; height: 100%; align-items: center; text-align: center; padding-top: 6mm }
.cta-page h2 { font-size: 24pt; line-height: 1.05; max-width: 80%; margin: 6pt 0 8pt; font-weight: 900; letter-spacing: -0.025em }
.cta-page h2 .accent { color: """ + ACCENT + """ }
.cta-page .deck { font-size: 11pt; color: """ + MUTED + """; max-width: 72%; line-height: 1.5; margin-bottom: 12pt }
.locked-modules { width: 84%; margin: 4pt auto 14pt; border-top: 1px solid """ + BORDER + """ }
.locked-modules .row { display: table; width: 100%; padding: 4pt 0; border-bottom: 1px solid """ + BORDER + """ }
.locked-modules .row > div { display: table-cell; vertical-align: middle }
.locked-modules .num { font-family: 'JetBrains Mono', monospace; font-size: 9pt; color: """ + ACCENT + """; font-weight: 700; width: 36pt; letter-spacing: 0.1em }
.locked-modules .name { font-size: 9.5pt; font-weight: 600; text-align: left }
.locked-modules .lock { font-family: 'JetBrains Mono', monospace; font-size: 7.5pt; color: """ + MUTED + """; text-align: right; letter-spacing: 0.1em; text-transform: uppercase; width: 95pt }

.usp-grid { display: table; width: 78%; margin: 6pt auto 14pt; border-spacing: 10pt 0 }
.usp-grid > div { display: table-cell; padding: 12pt 8pt; background: """ + LIGHT + """; border-radius: 6pt; text-align: center; vertical-align: middle }
.usp-grid .v { font-size: 22pt; font-weight: 800; color: """ + ACCENT + """; line-height: 1; letter-spacing: -0.02em }
.usp-grid .l { font-size: 8pt; color: """ + MUTED + """; margin-top: 5pt; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600 }

.cta-button { display: inline-block; background: """ + ACCENT + """; color: """ + INK + """; padding: 13pt 36pt; border-radius: 100pt; font-weight: 800; font-size: 12pt; text-decoration: none; box-shadow: 0 6pt 20pt rgba(9,174,221,0.25); margin-top: 2pt }
.cta-page .url { font-family: 'JetBrains Mono', monospace; font-size: 9pt; color: """ + MUTED + """; letter-spacing: 0.05em; margin-top: 10pt }

/* CATEGORY BAR ────────────────────── */
.cat-row { margin: 1pt 0 }
.cat-row .label-row { display: table; width: 100%; margin-bottom: 1pt }
.cat-row .name { display: table-cell; font-size: 8.5pt; font-weight: 600; color: """ + INK + """; vertical-align: middle }
.cat-row .score { display: table-cell; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 8pt; font-weight: 700; vertical-align: middle }
.cat-row .track { background: #F3F4F6; border-radius: 3pt; height: 4pt; overflow: hidden }
.cat-row .fill { height: 4pt; border-radius: 3pt }

/* ACTION ITEMS ──────────────────── */
.action-list { margin: 0; padding: 0; list-style: none }
.action-list li { display: table; width: 100%; padding: 3pt 0; border-bottom: 1px dashed """ + BORDER + """ }
.action-list li:last-child { border-bottom: 0 }
.action-list .n { display: table-cell; width: 22pt; font-family: 'JetBrains Mono', monospace; font-size: 9pt; font-weight: 700; color: """ + ACCENT + """; vertical-align: top; padding-top: 1pt }
.action-list .t { display: table-cell; font-size: 8.5pt; line-height: 1.4; color: """ + INK + """; vertical-align: top }

/* ACTION-LIST locked-teaser */
.action-list li.locked { background: rgba(9,174,221,0.04) }
.action-list li.locked .t { color: """ + MUTED + """; font-style: italic; opacity: 0.7 }
.action-list li.locked .n { color: """ + ACCENT + """; opacity: 0.6 }
.action-list li.locked .lock-tag { display: table-cell; vertical-align: middle; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 7pt; font-weight: 700; color: """ + ACCENT + """; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; padding-left: 8pt; width: 88pt }

/* TWO-COL STRENGTH/WEAKNESS ──────── */
.sw-grid { display: table; width: 100%; border-spacing: 6pt 0 }
.sw-grid > div { display: table-cell; vertical-align: top; width: 50%; padding: 7pt 9pt; border-radius: 6pt }
.sw-grid .strengths { background: #ECFDF5; border-left: 3pt solid """ + GREEN + """ }
.sw-grid .weaknesses { background: #FEF2F2; border-left: 3pt solid """ + RED + """ }
.sw-grid .h-label { font-family: 'JetBrains Mono', monospace; font-size: 7pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4pt }
.sw-grid .strengths .h-label { color: """ + GREEN + """ }
.sw-grid .weaknesses .h-label { color: """ + RED + """ }
.sw-grid .item { font-size: 8.5pt; line-height: 1.4; padding: 1pt 0 1pt 11pt; position: relative }
.sw-grid .item:before { content: ''; position: absolute; left: 0; top: 6pt; width: 4pt; height: 4pt; border-radius: 50%; background: """ + INK + """ }
.sw-grid .strengths .item:before { background: """ + GREEN + """ }
.sw-grid .weaknesses .item:before { background: """ + RED + """ }

/* OPPORTUNITY HOOK CALLOUT ───────── */
.opp-hook { padding: 8pt 12pt; background: """ + INK + """; color: #fff; border-radius: 7pt; margin: 6pt 0; font-size: 9pt; line-height: 1.45; border-left: 3pt solid """ + ACCENT + """ }
.opp-hook .label { font-family: 'JetBrains Mono', monospace; font-size: 7pt; font-weight: 700; color: """ + ACCENT + """; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 3pt }

/* Print color forcing */
.kpi-grid td, .callout, .usp-grid > div, .cta-button, .highlight-block, .cat-row .fill, .sw-grid > div, .opp-hook { -webkit-print-color-adjust: exact; print-color-adjust: exact }
"""


# ── Helpers ──────────────────────────────────────────────────────────────────
def _kpi_grid(items: list[tuple[str, str, str]]) -> str:
    """items: list of (value, label, color_class)"""
    cells = "".join(
        f'<td><div class="v {c}">{v}</div><div class="l">{l}</div></td>'
        for v, l, c in items
    )
    return f'<table class="kpi-grid"><tr>{cells}</tr></table>'


def _page_footer(page_num: int) -> str:
    return (
        f'<div class="page-footer">'
        f'<span>Voorbeeld &middot; Recruitin B.V.</span>'
        f'<span>{page_num:02d} / {TOTAL_PAGES:02d}</span>'
        f'</div>'
    )


def _page_header(label: str = "") -> str:
    return (
        f'<div class="page-header">'
        f'<span class="brand"><span class="dot"></span>recruitmentapk.nl</span>'
        f'<span>{label}</span>'
        f'</div>'
    )


def _status_color_for_percent(percent: int) -> str:
    if percent >= 65:
        return GREEN
    if percent >= 40:
        return AMBER
    return RED


# ── Page 01 — Cover + executive samenvatting ─────────────────────────────────
def _page_cover(lead: dict, analysis: dict) -> str:
    bedrijf = lead.get("bedrijf", "Voorbeeld B.V.")
    sector = (lead.get("sector", "—") or "—").replace("-", " ").title()
    teamgrootte = lead.get("teamgrootte", "—")
    regio = (lead.get("regio", "—") or "—").replace("-", " ").title()

    score = int(analysis.get("score", analysis.get("overall_score", 60)) or 0)
    score_percent = int(analysis.get("scorePercent", score) or score)
    samenvatting = analysis.get("ai_analysis", {}).get("executive_summary") or analysis.get("samenvatting", "") or ""
    if len(samenvatting) > 320:
        samenvatting = samenvatting[:320].rsplit(" ", 1)[0] + "…"

    categories = analysis.get("categories", []) or []

    # Tier
    tier_label, tier_color = _tier_label(score_percent)

    # Preview-3 inzichten ────────────────────────────────────────
    weakest = min(categories, key=lambda c: c.get("percent", 100), default=None)
    strongest = max(categories, key=lambda c: c.get("percent", 0), default=None)
    ai = analysis.get("ai_analysis", {}) or {}
    biggest_opp = ai.get("biggest_opportunity", "—")
    roi = ai.get("roi_estimate", "—")

    today = datetime.now().strftime("%-d %B %Y")
    ring = _score_ring_svg(score, "Score")

    return f"""<section class="page cover">
  <div class="brand-strip">
    <div>Voorbeeldrapport &middot; Recruitment Maturity</div>
    <div class="right">{today}</div>
  </div>
  <div class="top-strip">
    <span class="brand"><span class="dot"></span>recruitmentapk.nl</span>
    <span>01 / {TOTAL_PAGES:02d}</span>
  </div>
  <div class="lead-meta">{sector} &middot; {teamgrootte} &middot; {regio}</div>
  <h1>Recruitment<br><span class="accent">APK.</span></h1>
  <p class="deck">Hoe volwassen is jullie wervingsproces? 29 vragen &middot; 4 categorieën &middot; vandaag in 3 pagina's. Volledig rapport: <strong>diepgaande analyse + 30/60/90 actieplan</strong>.</p>
  <div class="score-row">
    <div class="ring">{ring}</div>
    <div class="summary">
      <span class="h-label">Maturity Niveau</span>
      <span class="tier-pill" style="background:{tier_color};color:#fff">{tier_label} &middot; {score_percent}/100</span>
      <div>{samenvatting}</div>
    </div>
  </div>
  {_kpi_grid([
      (f"{categories[0].get('score', '—')}/25" if len(categories) > 0 else "—", categories[0].get("name", "Processen") if len(categories) > 0 else "Processen", _category_kpi_class(categories[0]) if len(categories) > 0 else "amber"),
      (f"{categories[1].get('score', '—')}/25" if len(categories) > 1 else "—", categories[1].get("name", "Technologie") if len(categories) > 1 else "Technologie", _category_kpi_class(categories[1]) if len(categories) > 1 else "amber"),
      (f"{categories[2].get('score', '—')}/25" if len(categories) > 2 else "—", categories[2].get("name", "Talent") if len(categories) > 2 else "Talent", _category_kpi_class(categories[2]) if len(categories) > 2 else "amber"),
      (f"{categories[3].get('score', '—')}/25" if len(categories) > 3 else "—", categories[3].get("name", "Data") if len(categories) > 3 else "Data", _category_kpi_class(categories[3]) if len(categories) > 3 else "amber"),
  ])}
  <div class="preview-label">Hoogtepunten op pagina 02 &rarr;</div>
  <table class="preview-grid"><tr>
    <td>
      <div class="num">01 &middot; Sterkste punt</div>
      <div class="v">{(strongest or {}).get("name", "—")}</div>
      <div class="l">{(strongest or {}).get("percent", "—")}% &middot; behoud dit</div>
    </td>
    <td>
      <div class="num">02 &middot; Grootste kans</div>
      <div class="v">{biggest_opp}</div>
      <div class="l">{(weakest or {}).get("percent", "—")}% &middot; eerste prioriteit</div>
    </td>
    <td>
      <div class="num">03 &middot; ROI-potentie</div>
      <div class="v">{roi}</div>
      <div class="l">verwachte besparing /jaar</div>
    </td>
  </tr></table>
  <div class="footer-band">
    <div class="row">
      <div class="left"><strong>{bedrijf}</strong> &middot; voorbeeld &middot; recruitin.nl</div>
      <div class="right">Volledig rapport &rarr; pag. 03</div>
    </div>
  </div>
</section>"""


def _category_kpi_class(cat: dict) -> str:
    p = cat.get("percent", 0)
    if p >= 65:
        return "green"
    if p >= 40:
        return "amber"
    return "red"


# ── Page 02 — Hoogtepunten (categorie-bars · sterktes/zwaktes · top 3 30d) ───
def _page_highlights(analysis: dict) -> str:
    # Categorie-scores (4 hoofd-categorieën met percent-bars) ─────────
    categories = analysis.get("categories", []) or []
    cat_rows = ""
    for cat in categories[:4]:
        name = cat.get("name", "—")
        percent = int(cat.get("percent", 0) or 0)
        score = cat.get("score", 0)
        max_score = cat.get("maxScore", 25)
        color = _status_color_for_percent(percent)
        pct = max(2, min(100, percent))
        cat_rows += f"""
        <div class="cat-row">
          <div class="label-row">
            <div class="name">{name} <span style="color:{MUTED};font-weight:500">&middot; {score}/{max_score}</span></div>
            <div class="score" style="color:{color}">{percent}%</div>
          </div>
          <div class="track"><div class="fill" style="width:{pct}%;background:{color}"></div></div>
        </div>"""

    cat_html = f"""
    <div class="highlight-block">
      <div class="h-label">01 &middot; Score per categorie</div>
      <div class="h-title">4 dimensies van recruitment maturity</div>
      {cat_rows}
    </div>"""

    # Sterktes & zwaktes (uit AI-analyse) ────────────────────────────
    def _trim(text: str, limit: int = 95) -> str:
        text = (text or "").strip()
        if len(text) <= limit:
            return text
        return text[:limit].rsplit(" ", 1)[0] + "…"

    ai = analysis.get("ai_analysis", {}) or {}
    top_strengths = (ai.get("top_strengths") or [])[:3]
    weakest_points = (ai.get("weakest_points") or [])[:3]
    s_html = "".join(f'<div class="item">{_trim(s)}</div>' for s in top_strengths)
    w_html = "".join(f'<div class="item">{_trim(w)}</div>' for w in weakest_points)

    sw_html = f"""
    <div class="highlight-block">
      <div class="h-label">02 &middot; Sterkste &middot; zwakste</div>
      <div class="h-title">Wat werkt — wat verdient aandacht</div>
      <div class="sw-grid">
        <div class="strengths">
          <div class="h-label">Sterke punten</div>
          {s_html or '<div class="item" style="color:' + MUTED + '">—</div>'}
        </div>
        <div class="weaknesses">
          <div class="h-label">Verbeterpunten</div>
          {w_html or '<div class="item" style="color:' + MUTED + '">—</div>'}
        </div>
      </div>
    </div>"""

    # Opportunity hook (compact teaser) ──────────────────────────────
    opp_hook = _trim(ai.get("opportunity_hook", ""), 200)
    opp_html = f"""
    <div class="opp-hook">
      <div class="label">Concrete impact</div>
      {opp_hook}
    </div>""" if opp_hook else ""

    # Top 3 acties (eerste 30 dagen) — truncated voor teaser ─────────
    def _short(text: str, limit: int = 140) -> str:
        text = text.strip()
        if len(text) <= limit:
            return text
        return text[:limit].rsplit(" ", 1)[0] + "…"

    actions_30 = (ai.get("action_plan_30") or [])[:3]
    actions_60 = (ai.get("action_plan_60") or [])[:1]  # 1 locked teaser uit fase 60-dagen
    actions_html = "".join(
        f'<li><div class="n">{i+1:02d}</div><div class="t">{_short(item)}</div></li>'
        for i, item in enumerate(actions_30)
    )
    actions_html += "".join(
        f'<li class="locked"><div class="n">{i+4:02d}</div><div class="t">{_short(item, 110)}</div><div class="lock-tag">🔒 in volledig rapport</div></li>'
        for i, item in enumerate(actions_60)
    )
    actions_block = f"""
    <div class="highlight-block">
      <div class="h-label">03 &middot; Quick wins &middot; 30/60 dagen</div>
      <div class="h-title">Wat doe je als eerste</div>
      <ul class="action-list">{actions_html}</ul>
    </div>""" if actions_30 else ""

    return f"""<section class="page">
  {_page_header()}
  <div class="module-label" style="margin-bottom:2pt">Hoogtepunten</div>
  <h2 style="font-size:18pt;margin-bottom:3pt;letter-spacing:-0.025em">Drie inzichten — visueel</h2>
  <p style="font-size:9pt;color:{MUTED};margin-bottom:8pt">Categorie-scores, sterktes &amp; zwaktes, en eerste acties. Het volledige rapport gaat veel dieper.</p>
  {cat_html}
  {sw_html}
  {opp_html}
  {actions_block}
  {_page_footer(2)}
</section>"""


# ── Page 03 — CTA-back: wat zit er nog meer in + form ────────────────────────
def _page_cta_back(lead: dict, analysis: dict) -> str:
    ai = analysis.get("ai_analysis", {}) or {}
    n_actions = len((ai.get("action_plan_30") or []) + (ai.get("action_plan_60") or []) + (ai.get("action_plan_90") or []))
    locked_modules = [
        ("01", "Volledige score per 29 sub-vragen — exact welke processen scoren laag"),
        ("02", "AI-analyse per categorie — sterktes, verbeterpunten + verwachte impact"),
        ("03", "Sector-benchmark — hoe scoor je vs. concurrenten in jouw branche"),
        ("04", "30/60/90-dagen actieplan — concreet, met tools en KPI's"),
        ("05", "Strategische ROI-analyse — verwachte tijdwinst + besparing per jaar"),
        ("06", "Personalised opportunity hook — wat is jouw #1 prioriteit"),
        ("07", f"{n_actions or 8} concrete acties met tools, frameworks en deadlines"),
        ("08", "Optioneel verbeterplan: 60-dagen begeleiding (€249) of strategiesessie"),
    ]
    locked_html = "".join(
        f'<div class="row">'
        f'<div class="num">{num}</div>'
        f'<div class="name">{name}</div>'
        f'<div class="lock">— in volledig rapport</div>'
        f'</div>'
        for num, name in locked_modules
    )

    return f"""<section class="page">
  {_page_header()}
  <div class="cta-page">
    <div class="module-label">Voor jouw eigen organisatie</div>
    <h2>Wat krijg je in het<br><span class="accent">volledige rapport?</span></h2>
    <p class="deck">Dit voorbeeld toont 3 hoogtepunten. Het volledige rapport heeft <strong>diepgaande analyse + 30/60/90 actieplan</strong> — hieronder de complete inhoud:</p>
    <div class="locked-modules">
      {locked_html}
    </div>
    <div class="usp-grid">
      <div><div class="v">29</div><div class="l">Vragen</div></div>
      <div><div class="v">5min</div><div class="l">Doorlooptijd</div></div>
      <div><div class="v">€0</div><div class="l">Gratis assessment</div></div>
    </div>
    <a class="cta-button" href="https://recruitmentapk.nl/?utm_source=sample-pdf&amp;utm_medium=pdf&amp;utm_campaign=cta_back">Start jouw assessment &rarr;</a>
    <div style="font-size:10pt;color:{MUTED};margin-top:14pt">29 vragen &middot; 5 minuten &middot; rapport in je mailbox direct na voltooiing</div>
  </div>
  <div style="position:absolute;bottom:8mm;left:18mm;right:18mm;border-top:2pt solid {ACCENT};padding-top:8pt;display:flex;justify-content:space-between;align-items:baseline;font-size:9pt">
    <div style="color:{INK}"><strong style="color:{ACCENT};font-weight:700">Recruitin B.V.</strong> &middot; warts@recruitin.nl &middot; 06 14 31 45 93 &middot; recruitmentapk.nl</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:8pt;color:{MUTED};letter-spacing:0.1em;text-transform:uppercase">03 / {TOTAL_PAGES:02d}</div>
  </div>
</section>"""


# ── Document assembly ────────────────────────────────────────────────────────
def render_print_html(lead: dict, analysis: dict) -> str:
    pages = [
        _page_cover(lead, analysis),
        _page_highlights(analysis),
        _page_cta_back(lead, analysis),
    ]
    body = "\n".join(pages)
    return (
        '<!doctype html><html lang="nl"><head>'
        '<meta charset="utf-8">'
        '<title>Recruitment APK — Voorbeeld</title>'
        f'<style>{_BASE_CSS}</style>'
        '</head><body>'
        f'{body}'
        '</body></html>'
    )
