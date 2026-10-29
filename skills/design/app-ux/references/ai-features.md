# AI features

For products where the user prompts a model: chat, generation, assistants.

## The prompt input

- When the product is prompt-driven, the input is the first thing on screen, above the fold, with nothing to click through first.
- Make the input a control panel, not a bare text box:
  - previews for attached files and images
  - long pasted text or code collapsed into a compact block
  - mode chips when the use cases are broad (write, analyze, brainstorm)
  - buttons to add context or connect sources
- Advanced options (model, cost estimate) go behind a toggle.

## Waiting

- Never show a blank wait. Stream output as it arrives, or show a skeleton the shape of the result.
- Show the steps the model takes (searching, reading sources, drafting) as they happen, and cite the sources.
- Loading indicators are short and looping (three dots, a pulsing mark).

## After the answer

- Let the user select part of an output and ask for a change to just that part. Add compact actions per block (shorten, fix, retry) instead of forcing a full regenerate.
- Where the system can judge reliability, mark answers with a confidence or verification indicator, and mark low-confidence answers differently.

## History and memory

- Past sessions are a list with a title or first-line preview, search and delete.
- When the product remembers facts about the user, show them in a first-class memory panel where the user can view, add and delete them. Never only inside settings.
