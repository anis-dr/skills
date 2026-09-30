---
name: diagram-rules
description: "Rules for a clear diagram in any tool (Mermaid, D2, PlantUML, ASCII, SVG, a whiteboard): whether to draw at all, which kind of diagram answers the reader's question, what belongs in a node and on an edge, how much fits in one picture, and a check before showing it. Use before drawing or reviewing any diagram, and before choosing a diagram type."
---

# Diagram rules

A diagram is a set of claims drawn instead of written. Every box and arrow makes a claim, so every one has to earn its place, the way a sentence does. The tool comes last: decide what the picture says first, then pick the notation the repository already uses.

Lessons here come from Cathryn Lavery's `diagram-design` and Riekelt's `diagramming-processes` (both MIT).

## 1. Whether to draw at all

Draw only when the reader's question is about **shape**: order, branching, containment, who talks to whom, what depends on what. Otherwise the plainer form wins:

| The content is | Use |
|---|---|
| Items with a few attributes each | A table |
| Steps with no branch | A numbered list |
| One relationship | A sentence |
| A list of things that happen to be related | A list, or a sentence per relation |

If a three-column table says the same thing, use the table. A diagram of a straight line is a list wearing boxes.

## 2. One question, one kind of diagram

Name the reader's question, then pick the kind that answers it. A diagram answers one question; one that answers two answers neither, so split it.

| The reader asks | Draw |
|---|---|
| What happens, in what order, with which decisions | Flowchart or activity diagram |
| Who talks to whom, in what order, with what messages | Sequence diagram |
| Which states can this thing be in, and what moves it | State machine |
| What are the parts and how do they connect | Component or architecture diagram |
| What depends on what (fan-in, cycles) | Dependency graph |
| What contains what | Nested boxes or a tree |
| What exists in this domain and how it relates | Entity or concept diagram |
| Which team or system owns each step of a process | Swimlanes |
| When things happen relative to each other | Timeline |

Tie-breakers:

- Two kinds seem to fit: pick the one whose axis carries the reader's question, and leave the other for a second diagram.
- The diagram would need a legend for symbols you invented: it answers too many questions at once.
- Code-level structure (classes, functions, packages): usually no diagram. The code and the IDE show a fresher picture than a committed one. Draw behaviour instead.

## 3. What goes in a node

- **One distinct idea per node.** Two things that always travel together are one node.
- **A name, not a sentence.** One to four words: the noun the reader already uses for it. Detail goes in a short sublabel (a port, a type, a count) or in the prose beside the diagram, never in the box.
- **Nodes are things at one altitude.** Systems, roles, modules, business objects, states. Do not mix a person with a function with a database table in one picture; pick the altitude and stay there.
- **Names come from the domain**, in the language of the people who use it: `Checkout`, `Payment provider`, `Order confirmed`. Never a file path, a class name, or a method, unless the diagram is explicitly about code.
- **A node that is only there for a line to pass through** should go; the line can go straight.

## 4. What goes on an edge

- **Every line carries information.** If the layout already says it (adjacent boxes in a column, boxes inside a container), remove the line.
- **The label is the event or condition**, in domain words: `payment confirmed`, `retry after 5s`, `if stock = 0`. Not a callback name, not `calls`, not `uses`.
- **Direction means something.** Data flow, control flow, or dependency: choose one meaning for arrows per diagram, and say which in the title or caption when it is not obvious.
- **Draw the failure paths where behaviour differs**, and draw them distinguishably (dashed, or a different word). A happy-path-only picture of a process with real failure branches overstates its claim.
- **Draw the surprising branch.** The state nothing can leave, the step that gets skipped for one input: that is why the diagram earns its place.
- Optional, async, or return edges are dashed; everything else solid.

## 5. Density

One diagram holds about **9 nodes and 12 edges**. Past that, split into an overview plus one detail diagram per zone. The best move for clarity is nearly always deletion, so before adding, try removing:

- Can a node go, and the reader still understand?
- Can two nodes merge?
- Can a line go because the layout already says it?
- Can a label go because the shape or position already says it?

Highlight at most **one or two** elements (the focal path, the thing the reader is asked to look at). If four things want a highlight, the focal point has not been decided yet.

Every node type used appears in a legend, and nothing else does. Identical boxes for every node erase hierarchy; identical highlight on everything erases it too.

## 6. Titles and placement

- **The title names what the diagram shows**, as a noun phrase: `Order lifecycle`, `Request path through the gateway`. Never a plan, a phase, or a ticket.
- **One home per fact.** The prose beside the diagram says why the process exists and what to watch for; the diagram shows the flow. Neither restates the other step by step.
- **Lay out along the reading direction**: time and flow left to right or top to bottom, consistently. A line that runs against the reading direction is a return or a loop, and the label says so.
- **No crossing lines** when a rearrangement avoids them; when a crossing is unavoidable, do not let a line pass behind a box that is not its endpoint.

## 7. Truth

Everything legible in a diagram is a claim, so it is grounded like prose:

- Verify every box, arrow and guard against the code or the process before drawing it.
- Mark inferred flows as inferences in the caption, never as drawn facts.
- A diagram lives with the change that alters its flow: an edit that changes the process updates the diagram in the same change, or deletes it.
- Commit the source text (Mermaid, D2, PlantUML), never only a picture: a picture with no source cannot be diffed, so nobody maintains it.

## Check before showing it

- [ ] Would a table, list or sentence do the same job? Then don't draw.
- [ ] One question, and the kind of diagram that answers it.
- [ ] Every node is one idea, named in one to four domain words, at one altitude.
- [ ] Every line carries information the layout doesn't, and every label is an event or condition.
- [ ] At most 9 nodes, 12 edges, 2 highlights; otherwise split.
- [ ] Failure paths and surprising branches drawn where behaviour differs.
- [ ] Title is a noun phrase for what it shows; the prose beside it doesn't restate it.
- [ ] Every claim verified, inferences marked, source text committed.
