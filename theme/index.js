const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COUNTRIES = { FR: 'France', GB: 'United Kingdom', US: 'United States', DE: 'Germany', ES: 'Spain' };

const CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  @keyframes cvblink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
  .cv-cursor { animation: cvblink 1.15s step-end infinite; }
  /* Hanging indent via text-indent keeps the dash inline in the text flow, so PDF
     extraction and clipboard copy yield "– text" rather than a detached marker. */
  .cv-bullets { margin: 4px 0 0; padding: 0; list-style: none; }
  .cv-bullets li { font-size: var(--f10); line-height: 1.38; color: var(--sec); padding-left: 13px; text-indent: -13px; margin-bottom: 1px; }
  .cv-dash { color: var(--faint); }
  #cv strong { font-weight: 600; color: var(--em); }
  #cv {
    --bg: #e9e9e7; --sheet: #ffffff; --ink: #191919; --sec: #484848;
    --faint: #7a7a7a; --rule: #d8d8d5; --hair: #ebebe8; --em: #191919;
    --shadow: 0 1px 2px rgba(0,0,0,.05), 0 18px 50px rgba(0,0,0,.10);
    --f36:35.28px; --f135:13.23px; --f12:11.76px; --f11:10.78px; --f10:9.8px; --f95:9.31px; --f9:8.82px; --f85:8.33px;
  }
  /* The sidebar is the taller column, so it alone sets page height. The main column has
     spare vertical room; these shadow the inherited sizes to spend it on legibility.
     5% is the ceiling: beyond it a bullet wraps and the sheet exceeds one A4 page.
     --f95 stays inherited so section labels match across both columns. */
  .cv-main { --f12:12.35px; --f11:11.32px; --f10:10.29px; --f9:9.26px; --f85:8.75px; }
  #cv[data-theme="dark"] {
    --bg: #0b0b0c; --sheet: #161617; --ink: #d6d6d6; --sec: #a8a8a8;
    --faint: #6b6b6c; --rule: #2c2c2d; --hair: #242425; --em: #d6d6d6;
    --shadow: 0 0 0 1px #242425, 0 30px 70px rgba(0,0,0,.65);
  }
  @media (prefers-color-scheme: dark) {
    #cv:not([data-theme]) {
      --bg: #0b0b0c; --sheet: #161617; --ink: #d6d6d6; --sec: #a8a8a8;
      --faint: #6b6b6c; --rule: #2c2c2d; --hair: #242425; --em: #d6d6d6;
      --shadow: 0 0 0 1px #242425, 0 30px 70px rgba(0,0,0,.65);
    }
  }
  @media screen and (max-width: 720px) {
    .cv-grid { grid-template-columns: 1fr !important; }
    .cv-main { padding-right: 0 !important; }
    .cv-aside { border-left: none !important; padding-left: 0 !important; border-top: 1px solid var(--rule); padding-top: 14px; margin-top: 8px; }
    .cv-sheet { min-height: 0 !important; }
  }
  @media (max-width: 560px) {
    #cv { --f36:29px; --f135:15.5px; --f12:14px; --f11:13.5px; --f10:13px; --f95:12px; --f9:11px; --f85:11px; padding: 0 !important; }
    /* Single-column on mobile: no spare height to reclaim, so drop the main-column bump.
       Custom properties shadow by element, not specificity, so this must restate them. */
    .cv-main { --f12:14px; --f11:13.5px; --f10:13px; --f9:11px; --f85:11px; }
    .cv-sheet { padding: 56px 22px 28px !important; }
  }
  @media screen and (min-width: 1280px) {
    .cv-sheet { zoom: 1.5; }
  }
  @media print {
    @page { size: A4; margin: 0; }
    /* The cursor and hairline rules are drawn with CSS backgrounds; browsers skip
       backgrounds when printing unless forced, which made print diverge from the
       headless-Chrome PDF. print-color-adjust inherits, so #cv covers everything. */
    #cv { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    #cv { --bg:#fff !important; --sheet:#fff !important; --ink:#141414 !important; --sec:#484848 !important;
      --faint:#7a7a7a !important; --rule:#ccccca !important; --hair:#e3e3e0 !important; --em:#141414 !important; --shadow:none !important;
      padding:0 !important; min-height:0 !important; }
    .cv-sheet { box-shadow:none !important; margin:0 auto !important; }
    .cv-noprint { display:none !important; }
    .cv-cursor { animation:none !important; opacity:1 !important; }
  }
`;

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rich(value) {
  return esc(value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function ym(s) {
  if (!s) return '';
  const p = String(s).split('-');
  const m = parseInt(p[1], 10);
  return ((MONTHS[m - 1] || '') + ' ' + p[0]).trim();
}

function buildModel(resume) {
  const r = resume || {};
  const b = r.basics || {};
  const loc = b.location || {};

  const project = p => {
    const name = p.name || '';
    const isRepo = !!(p.url && p.url.includes('github.com'));
    let owner = '';
    let repo = name;
    if (name.includes('/')) {
      const i = name.indexOf('/');
      owner = name.slice(0, i + 1);
      repo = name.slice(i + 1);
    } else if (isRepo && p.entity) {
      owner = String(p.entity).toLowerCase() + '/';
    }
    return {
      owner,
      repo,
      role: (p.roles || []).join(' · '),
      description: p.description || (p.highlights || [])[0] || '',
    };
  };

  return {
    name: b.name || '',
    titleMain: b.label || '',
    location: [loc.city, COUNTRIES[loc.countryCode] || loc.countryCode].filter(Boolean).join(', '),
    remote: b.remote || '',
    email: b.email || '',
    emailHref: 'mailto:' + (b.email || ''),
    phone: b.phone || '',
    telHref: 'tel:' + String(b.phone || '').replace(/\s/g, ''),
    // Rendered as network/username, not a full URL: the contact row is width-bound
    // and the domains cost more space than they convey.
    profiles: (b.profiles || [])
      .filter(p => p.network && p.username)
      .map(p => ({ url: p.url || '#', display: p.network.toLowerCase() + '/' + p.username })),
    summary: b.summary || '',
    experience: (r.work || []).map(w => ({
      role: w.position || '',
      org: w.name || '',
      period: ym(w.startDate) + ' — ' + (w.endDate ? ym(w.endDate) : 'Present'),
      blurb: w.summary || '',
      bullets: w.highlights || [],
    })),
    projects: (r.projects || []).map(project),
    skills: (r.skills || []).map(s => ({ name: s.name || '', line: (s.keywords || []).join('  ·  ') })),
    education: (r.education || []).map(e => ({
      school: e.institution || '',
      degree: [e.studyType, e.area].filter(Boolean).join(', '),
      period: ym(e.startDate) + ' — ' + ym(e.endDate),
    })),
    certs: (r.certificates || []).map(c => ({ name: c.name || '', url: c.url || '', meta: [c.issuer, ym(c.date)].filter(Boolean).join(' · ') })),
    interests: (r.interests || []).map(i => ({ name: i.name || '', line: (i.keywords || []).join('  ·  ') })),
    languages: (r.languages || []).map(l => ({ language: l.language || '', fluency: l.fluency || '' })),
  };
}

const SECTION_LABEL = "font-family:'IBM Plex Mono',monospace; font-size:var(--f95); font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink);";

const EXT_ARROW = '<span style="color:var(--faint); font-weight:400; font-size:0.85em;">&#8239;↗</span>';

function mainSectionHeader(title, marginBottom) {
  return `<div style="display:flex; align-items:baseline; gap:11px; margin-bottom:${marginBottom}px;">
    <span style="${SECTION_LABEL}">${esc(title)}</span>
    <span style="flex:1; height:1px; background:var(--hair);"></span>
  </div>`;
}

function contactRow(m) {
  const parts = [];
  if (m.location) parts.push(`<span style="color:var(--faint);">${esc(m.location)}</span>`);
  if (m.remote) parts.push(`<span style="color:var(--faint);">${esc(m.remote)}</span>`);
  if (m.email) parts.push(`<a href="${esc(m.emailHref)}" style="color:var(--sec); text-decoration:none;">${esc(m.email)}</a>`);
  if (m.phone) parts.push(`<a href="${esc(m.telHref)}" style="color:var(--sec); text-decoration:none;">${esc(m.phone)}</a>`);
  m.profiles.forEach(p => parts.push(`<a href="${esc(p.url)}" target="_blank" rel="noopener" style="color:var(--sec); text-decoration:none;">${esc(p.display)}${EXT_ARROW}</a>`));
  return parts.join('\n        <span style="color:var(--rule);">·</span>\n        ');
}

function bulletList(bullets) {
  if (!bullets.length) return '';
  return `<ul class="cv-bullets">
              ${bullets.map(b => `<li><span class="cv-dash">–</span> ${rich(b)}</li>`).join('\n              ')}
            </ul>`;
}

function experienceSection(jobs) {
  if (!jobs.length) return '';
  const items = jobs.map(job => `<div style="margin-bottom:6px; break-inside:avoid;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; gap:14px;">
              <div style="font-size:var(--f12); line-height:1.3;"><span style="font-weight:600; color:var(--ink);">${esc(job.role)}</span><span style="color:var(--faint);"> · </span><span style="color:var(--sec);">${esc(job.org)}</span></div>
              <div style="font-family:'IBM Plex Mono',monospace; font-size:var(--f9); color:var(--faint); white-space:nowrap;">${esc(job.period)}</div>
            </div>
            <div style="font-size:var(--f10); color:var(--faint); margin-top:1px; line-height:1.35;">${rich(job.blurb)}</div>
            ${bulletList(job.bullets)}
          </div>`).join('\n          ');
  return `<section style="margin-bottom:9px;">
          ${mainSectionHeader('Experience', 8)}
          ${items}
        </section>`;
}

function projectsSection(projects) {
  if (!projects.length) return '';
  const items = projects.map(p => `<div style="margin-bottom:5px; break-inside:avoid;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; gap:14px;">
              <div style="font-family:'IBM Plex Mono',monospace; font-size:var(--f11); line-height:1.3;"><span style="color:var(--faint);">${esc(p.owner)}</span><span style="font-weight:500; color:var(--ink);">${esc(p.repo)}</span></div>
              <div style="font-family:'IBM Plex Mono',monospace; font-size:var(--f85); letter-spacing:0.08em; text-transform:uppercase; color:var(--faint); white-space:nowrap;">${esc(p.role)}</div>
            </div>
            <div style="font-size:var(--f10); color:var(--sec); margin-top:1px; line-height:1.4;">${rich(p.description)}</div>
          </div>`).join('\n          ');
  return `<section style="break-inside:avoid;">
          ${mainSectionHeader('Open Source', 8)}
          ${items}
        </section>`;
}

function sidebarSection(title, marginBottom, itemsHtml) {
  if (!itemsHtml) return '';
  return `<section>
          <div style="${SECTION_LABEL} margin-bottom:${marginBottom}px;">${esc(title)}</div>
          ${itemsHtml}
        </section>`;
}

function skillsItems(skills) {
  return skills.map(g => `<div style="margin-bottom:5px;">
            <div style="font-size:var(--f95); font-weight:600; color:var(--ink); margin-bottom:1px;">${esc(g.name)}</div>
            <div style="font-size:var(--f95); color:var(--sec); line-height:1.45;">${esc(g.line)}</div>
          </div>`).join('\n          ');
}

function educationItems(education) {
  return education.map(e => `<div style="margin-bottom:5px;">
            <div style="font-size:var(--f10); font-weight:600; color:var(--ink); line-height:1.3;">${esc(e.school)}</div>
            <div style="font-size:var(--f95); color:var(--sec); margin-top:1px; line-height:1.35;">${esc(e.degree)}</div>
            <div style="font-family:'IBM Plex Mono',monospace; font-size:var(--f85); color:var(--faint); margin-top:1px;">${esc(e.period)}</div>
          </div>`).join('\n          ');
}

function certItems(certs) {
  return certs.map(c => {
    const name = c.url
      ? `<a href="${esc(c.url)}" target="_blank" rel="noopener" style="color:var(--ink); text-decoration:none;">${esc(c.name)}${EXT_ARROW}</a>`
      : esc(c.name);
    return `<div style="margin-bottom:5px;">
            <div style="font-size:var(--f10); font-weight:600; color:var(--ink); line-height:1.3;">${name}</div>
            <div style="font-family:'IBM Plex Mono',monospace; font-size:var(--f85); color:var(--faint); margin-top:1px;">${esc(c.meta)}</div>
          </div>`;
  }).join('\n          ');
}

function interestItems(interests) {
  return interests.map(i => `<div style="margin-bottom:5px;">
            <div style="font-size:var(--f10); font-weight:600; color:var(--ink); line-height:1.3;">${esc(i.name)}</div>
            <div style="font-size:var(--f95); color:var(--sec); margin-top:1px; line-height:1.45;">${esc(i.line)}</div>
          </div>`).join('\n          ');
}

function languageItems(languages) {
  return languages.map(l => `<div style="display:flex; justify-content:space-between; align-items:baseline; font-size:var(--f10); margin-bottom:4px;">
            <span style="color:var(--ink);">${esc(l.language)}</span><span style="font-family:'IBM Plex Mono',monospace; font-size:var(--f85); color:var(--faint);">${esc(l.fluency)}</span>
          </div>`).join('\n          ');
}

function render(resume) {
  const m = buildModel(resume);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.name)} · CV</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Source+Serif+4:ital,opsz,wght@1,8..60,400;1,8..60,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<div id="cv" style="min-height:100vh; background:var(--bg); font-family:'IBM Plex Sans',system-ui,sans-serif; color:var(--ink); padding:44px 20px; -webkit-font-smoothing:antialiased;">

  <div class="cv-noprint" style="position:fixed; top:16px; right:16px; z-index:20; display:flex; gap:8px;">
    <a href="./Zadkiel_AHARONIAN_CV_EN.pdf" download="Zadkiel_AHARONIAN_CV_EN.pdf" style="font-family:'IBM Plex Mono',monospace; font-size:var(--f10); letter-spacing:0.08em; text-transform:uppercase; color:var(--sec); background:var(--sheet); border:1px solid var(--rule); border-radius:999px; padding:6px 13px; cursor:pointer; text-decoration:none;">pdf</a>
    <button id="cv-print" type="button" style="font-family:'IBM Plex Mono',monospace; font-size:var(--f10); letter-spacing:0.08em; text-transform:uppercase; color:var(--sec); background:var(--sheet); border:1px solid var(--rule); border-radius:999px; padding:6px 13px; cursor:pointer;">print</button>
    <button id="cv-theme-toggle" type="button" style="font-family:'IBM Plex Mono',monospace; font-size:var(--f10); letter-spacing:0.08em; text-transform:uppercase; color:var(--sec); background:var(--sheet); border:1px solid var(--rule); border-radius:999px; padding:6px 13px; cursor:pointer;">light</button>
  </div>

  <div class="cv-sheet" style="width:794px; max-width:100%; min-height:1123px; margin:0 auto; background:var(--sheet); box-shadow:var(--shadow); padding:30px 46px 22px;">

    <header>
      <h1 style="margin:0; font-family:'IBM Plex Serif',Georgia,serif; font-size:var(--f36); font-weight:400; letter-spacing:-0.015em; line-height:1.0; color:var(--ink);">${esc(m.name)}<span class="cv-cursor" style="display:inline-block; width:10px; height:0.8em; margin-left:8px; vertical-align:-1px; background:var(--ink);"></span></h1>
      <div style="margin-top:7px; font-size:var(--f12); font-weight:500; color:var(--sec);">${esc(m.titleMain)}</div>
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px 9px; margin-top:12px; font-family:'IBM Plex Mono',monospace; font-size:var(--f95); color:var(--sec);">
        ${contactRow(m)}
      </div>
      <p style="margin:11px 0 0; font-family:'Source Serif 4',Georgia,serif; font-style:italic; font-size:var(--f135); line-height:1.45; color:var(--sec); font-weight:400; text-wrap:pretty;">${rich(m.summary)}</p>
      <div style="height:1px; background:var(--rule); margin-top:10px;"></div>
    </header>

    <div class="cv-grid" style="display:grid; grid-template-columns:1fr 258px; gap:0; margin-top:9px; align-items:start;">

      <main class="cv-main" style="padding-right:26px;">
        ${experienceSection(m.experience)}
        ${projectsSection(m.projects)}
      </main>

      <aside class="cv-aside" style="border-left:1px solid var(--rule); padding-left:26px; display:flex; flex-direction:column; gap:10px;">
        ${sidebarSection('Skills', 9, m.skills.length ? skillsItems(m.skills) : '')}
        ${sidebarSection('Education', 8, m.education.length ? educationItems(m.education) : '')}
        ${sidebarSection('Certifications', 8, m.certs.length ? certItems(m.certs) : '')}
        ${sidebarSection('Interests', 8, m.interests.length ? interestItems(m.interests) : '')}
        ${sidebarSection('Languages', 8, m.languages.length ? languageItems(m.languages) : '')}
      </aside>
    </div>
  </div>
</div>
<script>
(function () {
  var cv = document.getElementById('cv');
  var btn = document.getElementById('cv-theme-toggle');
  var print = document.getElementById('cv-print');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function effective() {
    return cv.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light');
  }
  function syncLabel() {
    btn.textContent = effective() === 'dark' ? 'light' : 'dark';
  }
  if (cv && btn) {
    btn.addEventListener('click', function () {
      cv.setAttribute('data-theme', effective() === 'dark' ? 'light' : 'dark');
      syncLabel();
    });
    if (mq && mq.addEventListener) mq.addEventListener('change', syncLabel);
    syncLabel();
  }
  if (print) {
    print.addEventListener('click', function () { window.print(); });
  }
})();
</script>
</body>
</html>
`;
}

module.exports = { render };
