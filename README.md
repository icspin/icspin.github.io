# icspin.github.io

The front door for a set of interactive tools built for arguing about the shape
of the Earth over Discord screenshare. Live at https://icspin.github.io/.

## How it works

- `index.html` is a static page, no build step, no framework.
- `apps.json` is the single source of truth for what tools exist. The page
  renders entirely from it. To add a tool, add one entry, no code changes.
- `tools-link.js` is the shared snippet each tool embeds so it can link to the
  others. It fetches `apps.json`, filters out the tool it is running inside,
  and fails completely silently if anything goes wrong.
- `previews/` holds the screenshot used by each tool card and by link unfurls.

## Run locally

Any static server from the repo root, for example:

    python -m http.server 8000

then open http://localhost:8000/.
