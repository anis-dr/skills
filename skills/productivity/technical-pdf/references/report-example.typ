#import "@preview/metropole-report:0.1.0": *
#import "@preview/lovelace:0.3.1" as lovelace
#import "@preview/zebraw:0.6.3" as zebra

#show: metropole.with(
  title: "Delivery review",
  subtitle: "An illustrative report layout, not production findings",
  author: "Engineering",
  date: datetime(year: 2026, month: 1, day: 1),
  language: "en",
  cover-page: true,
  accent-color: metro-blue,
  body-font: "Source Serif Pro",
  heading-font: "Source Sans Pro",
  raw-font: "JetBrains Mono",
)

#show regex("[\\p{L}\\p{N}]+(?:[-‐][\\p{L}\\p{N}]+)+"): it => box(it)
#show heading: set block(sticky: true)
#set table.cell(breakable: false)
#show table: set par(justify: false)
#show figure.caption: set par(justify: false)
#show bibliography: set par(justify: false)
#show ref: it => text(fill: metro-blue, weight: "semibold", it)

#outline(depth: 2)
#pagebreak()

= Executive conclusion

#quote[
  Keep the delivery record separate from the provider request. A successful
  response and a durably recorded outcome answer different questions.
]

This neutral example demonstrates the visual treatment for a technical report.
Its scenario is illustrative. Replace it with sourced evidence, explicit
unknowns and the actual next action when writing a report.

Use serif text for the explanation and table bodies. Let the template supply
heading hierarchy, spacing, margins and page furniture. Do not shrink the body
to turn a report into a compact dashboard.

#[
  #set par(justify: false)
  #table(
    columns: (8em, 1fr, 1.3fr),
    table.header([*Question*], [*Meaning*], [*Next action*]),
    [Was the request accepted?], [Transport result], [Record the response.],
    [Was the result retained?], [Durable state], [Verify the stored outcome.],
    [Can the request be retried?], [Recovery policy], [Handle uncertainty explicitly.],
  )
]

= Explain the flow

A diagram shows ownership and order. Nearby prose carries qualifications that
would otherwise crowd its labels.

#figure(
  image("example-flow.pdf", width: 100%),
  caption: [Illustrative delivery flow. This is a visual reference, not a claim about a deployed system.],
)

#pagebreak()
= Keep technical text native

A call tree is text, not an architecture drawing:

#zebra.zebraw(
  numbering: false,
  ```text
  submitDelivery
    authorizeRecipient
    recordAttempt
    callProvider
    recordOutcome
  ```,
)

An algorithm uses procedural notation:

#block(breakable: false)[
  #lovelace.pseudocode-list[
    + load the delivery record
    + *if* its outcome is already known *then*
      + return the recorded outcome
    + *else*
      + apply the approved recovery policy
    + *end*
  ]
]

= Finish with a specific action

A real report names the responsible role, the change, the expected result and
important uncertainty. It cites claims near their evidence and includes a
bibliography when citations are used. This example has no source evidence and
must not be presented as a completed investigation.
