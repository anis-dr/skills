---
name: youtube-video-to-skill
description: "Turn a YouTube tutorial into a SKILL.md with concept-accurate, full-resolution example frames: download, transcribe, map concepts to timestamps, export exact frames, and verify each image against its caption. Use when the user wants a skill, guide or notes built from a video tutorial."
---

# YouTube video to skill with example frames

## 1. Download
- Run `pip install -U yt-dlp` first. An old version fails with 403.
- If you get 403 or 429, run `yt-dlp --cookies-from-browser chrome -f "bv*[height=1080][ext=mp4]" -o video.mp4 URL`.
- Subtitles often return 429 even with cookies. Transcribe locally instead:
  - `ffmpeg -i video.mp4 -ac 1 -ar 16000 audio.wav`
  - `uvx --from mlx-whisper python -c "import mlx_whisper; r=mlx_whisper.transcribe('audio.wav', path_or_hf_repo='mlx-community/whisper-large-v3-turbo')"`
  - Pip is blocked by PEP 668, so use uvx. The first model download takes about 8 minutes, so run it in the background.
  - Write the segments out with `[m:ss]` timestamps.

## 2. Map concepts to timestamps
- Read the transcript and list every concept with the moment its example is on screen. Leave out sponsor segments.
- Do NOT sample on a timer and do NOT ship contact sheets. The user wants the frame of the thing being explained.
- To find candidates, make small xstack grids of frames around each timestamp. `drawtext` may be missing from ffmpeg, so don't rely on it for labels.

## 3. Export frames accurately
- Seek accurately. A fast `-ss` before `-i` on AV1 lands on the wrong frame. Use `ffmpeg -ss (t-5) -i video.mp4 -ss 5 -frames:v 1 -q:v 1 -qmin 1 out.jpg`.
- Keep full 1920x1080. Never downscale; small UI text has to stay readable.
- Demos animate between states such as before and after, zooms, or bars growing. Sample in 0.25 to 0.5 s steps around each moment and pick the frame where the state has finished: no cursor, no tooltip, no zoom, the intended state fully shown.

## 4. Verify
- Put all the images in 2x3 review grids next to their filenames and captions, and check each one against the text that describes it. Pay special attention to before/after pairs: are the cards really dissolved? Is the chart really finished?
- Check that every path SKILL.md references exists.
- Delete the temp video and audio afterwards.

## 5. Location
- If the user asks for a repo-local skill, put it in the repo's existing skills directory (for example `.agents/skills/<name>/`), with `images/` beside SKILL.md and relative paths.
