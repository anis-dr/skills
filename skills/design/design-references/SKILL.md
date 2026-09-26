---
name: design-references
description: Find real-world UI references on Mobbin for the screens, flows or sections being designed, and hand the user a visual catalog to choose from before any design work. Use when starting or reworking a screen, flow or component, when the user asks for references, examples or inspiration, or before a design tool or coding agent builds UI from a brief.
---

# Design references

References come from Mobbin, as patterns shipped by many products, and the user picks them. The build then uses the project's own brand, copy and components. A single product's screen is never the target.

The searches need the Mobbin MCP server. If its tools are not in your tool list, ask the user to connect it, then continue.

## 1. Frame the searches

List the screens, flows and website sections the work needs, one intent per line ("checkout with saved cards", "onboarding that asks for permissions"), and the platform (`web` or `ios`). Confirm the list with the user when it is not obvious from the brief.

Done when every intent is one screen, one flow or one section.

## 2. Search Mobbin

Use the tool that matches the intent: `search_screens` for one screen, `search_flows` for a multi-step flow, `search_sections` for a website section. For each call:

- The query describes one screen or flow in plain words: the elements and how they relate. No negations, no style words, no list of keywords.
- `mode: "deep"` for nuanced intents, `limit` 6 to 10, and the same `task_intent`, `output_destination` and `output_tool` on every call of this task.
- Look at the returned images; judge from what they show, not from the metadata.

Keep 4 to 8 candidates per intent from several different products. Drop near-duplicates.

Done when every intent has candidates from at least three products.

## 3. Build the catalog

Call the Skill tool with "checkbox-picker" and build its picker, with two changes: each item is an image card, and the catalog lives in the scratchpad folder (call the Skill tool with "scratchpad" for where). A card shows the high-resolution image (download it from `image_url` into the catalog's folder, because the URLs expire after 30 days), the product name, one line on what the screen shows, and its `mobbin_url` as a link. Group the cards by intent and pre-check nothing: the user chooses. Each choice can carry a short note ("the filter bar", "the empty state"). Open the catalog for the user.

Done when the user has downloaded their choices.

## 4. Report the choices

Read the choices file. Per intent, list each chosen reference as a markdown link to its `mobbin_url`, and name the pattern to take from it: layout, hierarchy, density, interaction or state. Where several choices agree, say so; that agreement is the strongest evidence.

Name what stays out: logos, brand colours, illustrations, product copy and any screen reproduced as a whole. The design combines patterns from the chosen references and renders them with the project's own design system.

## Reply

The chosen references per intent with their links, the pattern taken from each, and the path to the catalog.
