---
name: typst-living-devis
description: "Build a client quote (devis) in Typst as a living document where the day rate and per-module day counts are variables and every price is computed. Use when the user wants a quote, estimate or commercial proposal in Typst, or wants to reprice an existing one."
---

# Typst living devis

A devis whose numbers recompute from variables beats a static template. Change the day rate once and the whole document reprices.

## Structure (3 files)

- `data.typ` holds every knob: `taux-jour`, FX rate, TVA, module list `(nom, jours, phase)`, PM overhead %, recurring costs, warranty/maintenance terms, team, dates. Derived values sit at the bottom: `jours-dev = modules.map(m => m.jours).sum()`, phase filters, totals.
- `template.typ` holds brand colors, cover page, table styling, money formatter, callout helper.
- `devis.typ` is the document. It imports both and renders phase tables from the module list.

## Key snippets

Thousands separator (Typst has none built in):
```typst
#let fmt(n) = {
  let s = str(calc.round(n)); let out = ""; let l = s.len()
  for (i, c) in s.clusters().enumerate() {
    out += c
    let rest = l - i - 1
    if rest > 0 and calc.rem(rest, 3) == 0 { out += " " }
  }
  out
}
```

Phase table generated from data:
```typst
#let phase-table(p) = {
  let rows = modules.filter(m => m.phase == p)
  table(columns: (1fr, auto, auto),
    table.header[Module][Jours][Montant HT],
    ..rows.map(m => ([#m.nom], align(right)[#m.jours], align(right)[#money(m.jours * taux-jour)])).flatten(),
  )
}
```

## Gotchas

- Named args to a helper with trailing content blocks go BEFORE the blocks: `encadre(couleur: bleu)[titre][corps]`. Writing `encadre[a][b], couleur: bleu` inside a `grid(...)` binds `couleur` to the grid and fails with "duplicate argument".
- Disable hyphenation for client docs with `set text(hyphenate: false)`. Otherwise justified French text splits words like "TECH-NIQUE" on covers.
- Typst Universe has no devis or commercial-proposal template, only single-page invoices (classy-german-invoice, tiefletter, invoice-maker) and academic proposals. A custom template (about 100 lines) is less work than bending biz-report.
- Verify with a PNG render (`typst compile doc.typ 'p-{p}.png' -f png --pages 1-2`), and after an unslop pass sweep the prose with `pdftotext doc.pdf - | grep '—'` to catch em dashes.
- French client prose: call the Skill tool with "unslop" and apply it. No em dashes, colons only before lists, bold only on key figures, active voice, name mechanisms rather than feelings.

## Quote content checklist (from past RFP responses)

1. Synthèse with computed KPI cards.
2. Tech table with a justification per layer.
3. Phased module pricing tables.
4. Financial recap (HT/TVA/TTC, payment milestones).
5. Recurring costs.
6. Warranty, maintenance and evolution rates.
7. Ownership and reversibility.
8. Answers to every mandatory RFP question.
9. Conditions (client-provided prerequisites, responsibility for regulatory content).
