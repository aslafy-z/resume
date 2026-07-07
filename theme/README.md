# jsonresume-theme-typewriter

A [JSON Resume](https://jsonresume.org/) theme rendering a single A4 paper sheet with a
two-column layout: experience and open source work on the left, skills, education,
certifications, interests and languages in the sidebar.

Design notes:

- IBM Plex Serif for the name, Source Serif 4 italic for the summary,
  IBM Plex Sans for body text, IBM Plex Mono for labels, dates and metadata.
- Dark mode by default, with a fixed toggle button switching to light mode.
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
- `basics.profiles` entries named `GitHub` and `LinkedIn` appear in the header contact line.
- `projects` render under "Open Source"; a `name` containing `/` is split into a dimmed
  owner prefix and a highlighted repository name, and `roles` are joined as a label.
- `work` entries without an `endDate` display as "Present".
