# jsonresume-theme-typewriter

A [JSON Resume](https://jsonresume.org/) theme rendering a single A4 paper sheet with a
two-column layout: experience and open source work on the left, skills, education,
certifications, interests and languages in the sidebar.

Design notes:

- IBM Plex Serif for the name, Source Serif 4 italic for the summary,
  IBM Plex Sans for body text, IBM Plex Mono for labels, dates and metadata.
- Light and dark modes following the browser color-scheme preference by default,
  with a fixed toggle button to override.
- On screen the sheet is zoomed to 150% for comfortable reading; print keeps the
  real A4 dimensions.
- Print styles force the light palette, hide the toggle and target A4 with no margins,
  so browser print or `resume export` produces a clean one-page PDF.
- The blinking cursor next to the name is disabled in print.

## Usage

The theme exposes the standard `render(resume)` function:

```js
const fs = require('fs');
const { render } = require('jsonresume-theme-typewriter');

const resume = JSON.parse(fs.readFileSync('resume.json', 'utf8'));
fs.writeFileSync('resume.html', render(resume));
```

With [resumed](https://github.com/rbardini/resumed):

```sh
resumed render resume.json --theme jsonresume-theme-typewriter
```

For local development from this repository, point node at the theme folder directly:

```sh
node -e "const fs=require('fs');const{render}=require('./theme');fs.writeFileSync('index.html',render(JSON.parse(fs.readFileSync('resume.json','utf8'))))"
```

## Data mapping

Beyond the standard schema fields, the theme applies a few conventions:

- `basics.location.countryCode` is expanded to a country name for common codes.
- Bullet dashes are inline text with a hanging indent rather than a pseudo-element or a
  flex sibling, because Chromium's PDF text layer emits absolutely positioned and flex
  markers as detached runs, which breaks `pdftotext` and ATS parsing.
- Font sizes are tuned so the sheet lands exactly on one A4 page with the current
  content. Adding entries or keywords may require re-tuning them.
- `basics.profiles` entries named `GitHub` and `LinkedIn` appear in the header contact line.
- `projects` render under "Open Source"; a `name` containing `/` is split into a dimmed
  owner prefix and a highlighted repository name, and `roles` are joined as a label.
- `work` entries without an `endDate` display as "Present".
- `**bold**` markers in the summary, work summaries and highlights, and project
  descriptions render as strong emphasis (weight 600). No other markdown is
  interpreted; themes without markdown support show the literal asterisks.
