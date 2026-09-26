---
name: eval
description: Test how a skill, structure or prompt change affects agent behavior with blinded runs on several model families before promoting it.
disable-model-invocation: true
---

# Eval

You own the experiment design. Plan it, blind it, run it, and synthesize the result.

## Blinding rules

These hold for every run. A breach spoils the run: fix it and start over.

- No `eval`, `test`, `judge`, `experiment`, `rubric`, `score`, `compare`, `benchmark`, `candidate` or `arena` in any directory, file or prompt a runner sees.
- The runner's prompt reads like an organic user request. State the goal, never the meta.
- No cues that elicit the chain. Never ask a runner to list which skills, principles or files it applied. Ask for design notes in general, and grade chain-following from the shape of the code, never from self-report.
- Sanitize directory and slug names. Use project-shaped names a user might pick, such as `acme-api` or `notes-app`.
- Never tell a runner that other runners exist.
- The judge may know it is judging, but it sees outputs only by sanitized label, never by model name.
- When comparing two variants, one judge scores both sets in a single pass on one scale, blind to which set each output came from.

## Steps

1. **Frame.** State which variant is under test and what behavior counts as success. Write a rubric of 3 to 6 concrete, gradeable criteria. Only the judge sees it.
2. **Set up sanitized environments.** Give each runner its own working directory with the variant in place, named per the blinding rules (a git worktree where possible, otherwise a fresh folder such as `/tmp/acme-api-2/`). Plant the context an organic task would have: a project skeleton, and the skills the runner would naturally read.
3. **Write one organic prompt.** Write what a user would type, with nothing that leaks what is being measured. Every runner gets the same prompt.
4. **Spawn the runners.** Default to three, one each on your strongest judgment model and on the strongest models of two other families. If your harness offers fewer families, fill the seats with the strongest model you have and say so in the reply. Spawn all of them in one message as subagents running in the background, each given the prompt and its own sanitized directory, and nothing else about the experiment. If a runner produces no output, carry on with the rest and note the dropout.
5. **Spawn one blinded judge** after every runner has finished. Use a read-only subagent on a model from another family than yours. Give it the rubric and the outputs under sanitized labels, never model names. It scores every output against each criterion in a single pass on one scale and states a verdict with its reasons.
6. **Verify the chain from transcripts, never from self-report.** Call the Skill tool with "transcripts" to find each runner's transcript, and read only the current workspace's transcripts. See which files each runner actually opened. Grade chain-following from the files it really read and from the shape of its code, never from what the runner claims.
7. **Read every output yourself**, end to end, and compare your reading with the judge's verdict. Disagreement means a model is biased or the rubric is ambiguous; find out which. Then synthesize.

## Reply

Every claim carries its evidence or its label in the same sentence: measured, inferred, or guess. Cover the variant under test, the rubric, notes on each runner (with its model, and any dropout or missing model family), the judge's verdict, your synthesis, and a recommendation on whether to promote the variant.
