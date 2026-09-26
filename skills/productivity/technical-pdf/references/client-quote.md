# Client quote: a report whose prices compute themselves

Use when the PDF is a quote, estimate or commercial proposal, or when an existing one must be repriced. Everything in SKILL.md still applies (style, hyphenation off, visual inspection); this branch adds a pricing model where no number is typed by hand. Change the day rate once and the whole document reprices.

## Three files

- `data.typ` holds every input: `day-rate`, currency and FX rate, VAT rate, the module list as `(name, days, phase)`, project-management overhead in percent, recurring costs, warranty and maintenance terms, team and dates. Derived values sit at the bottom: `dev-days = modules.map(m => m.days).sum()`, per-phase filters, subtotals, VAT and totals.
- `template.typ` holds the report style from SKILL.md plus the money formatter and the callout helper.
- `quote.typ` is the document. It imports both and renders every pricing table from the module list.

## Snippets

Thousands separator (Typst has none built in):

```typst
#let money(n) = {
  let s = str(calc.round(n)); let out = ""; let l = s.len()
  for (i, c) in s.clusters().enumerate() {
    out += c
    let rest = l - i - 1
    if rest > 0 and calc.rem(rest, 3) == 0 { out += " " }
  }
  out
}
```

A phase table generated from the data:

```typst
#let phase-table(p) = {
  let rows = modules.filter(m => m.phase == p)
  table(columns: (1fr, auto, auto),
    table.header[Module][Days][Amount excl. VAT],
    ..rows.map(m => ([#m.name], align(right)[#m.days], align(right)[#money(m.days * day-rate)])).flatten(),
  )
}
```

Write the labels in the client's language; the data model stays the same.

## Gotchas

- Named arguments to a helper that takes trailing content blocks go before the blocks: `callout(color: blue)[title][body]`. Written as `callout[a][b], color: blue` inside a `grid(...)`, `color` binds to the grid and fails with "duplicate argument".
- Typst Universe has no quote or commercial-proposal template, only single-page invoices and academic proposals. A custom template of about 100 lines is less work than bending a report template.
- Check every total by hand once against the data file: a wrong filter in a phase table silently drops modules from the sum.

## Content checklist

1. Summary with computed KPI cards (total days, total price, duration).
2. Technical choices, each with its reason.
3. Pricing tables per phase.
4. Financial recap: amounts excluding VAT, VAT, including VAT, payment milestones.
5. Recurring costs.
6. Warranty, maintenance and change-request rates.
7. Ownership of the code and reversibility.
8. An answer to every mandatory question of the request for proposal.
9. Conditions: what the client provides, and who is responsible for regulatory content.
