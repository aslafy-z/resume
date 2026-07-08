const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COUNTRIES = { FR: 'France', GB: 'United Kingdom', US: 'United States', DE: 'Germany', ES: 'Spain' };

const CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  @keyframes cvblink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
  .cv-cursor { animation: cvblink 1.15s step-end infinite; }
  @media screen { .cv-sheet { zoom: 1.5; } }
  #cv strong { font-weight: 600; color: var(--em); }
  #cv {
    --bg: #e9e9e7; --sheet: #ffffff; --ink: #191919; --sec: #484848;
    --faint: #7a7a7a; --rule: #d8d8d5; --hair: #ebebe8; --em: #191919;
    --shadow: 0 1px 2px rgba(0,0,0,.05), 0 18px 50px rgba(0,0,0,.10);
  }
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
  @media print {
    @page { size: A4; margin: 0; }
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
  const labelParts = String(b.label || '').split(/\s+[-–—]\s+/);
  const prof = net => (b.profiles || []).find(p => (p.network || '').toLowerCase() === net) || {};
  const gh = prof('github');
  const li = prof('linkedin');
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
      keywordLine: (p.keywords || []).join('  ·  '),
    };
  };

  return {
    name: b.name || '',
    titleMain: labelParts[0] || '',
    location: [loc.city, COUNTRIES[loc.countryCode] || loc.countryCode].filter(Boolean).join(', '),
    email: b.email || '',
    emailHref: 'mailto:' + (b.email || ''),
    phone: b.phone || '',
    telHref: 'tel:' + String(b.phone || '').replace(/\s/g, ''),
    githubUrl: gh.url || '#',
    githubDisplay: gh.username ? 'github.com/' + gh.username : '',
    linkedinUrl: li.url || '#',
    linkedinDisplay: li.username ? 'linkedin.com/in/' + li.username : '',
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

const SECTION_LABEL = "font-family:'IBM Plex Mono',monospace; font-size:9.5px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink);";

function mainSectionHeader(title, marginBottom) {
  return `<div style="display:flex; align-items:baseline; gap:11px; margin-bottom:${marginBottom}px;">
    <span style="${SECTION_LABEL}">${esc(title)}</span>
    <span style="flex:1; height:1px; background:var(--hair);"></span>
  </div>`;
}

function contactRow(m) {
  const parts = [];
  if (m.location) parts.push(`<span style="color:var(--faint);">${esc(m.location)}</span>`);
  if (m.email) parts.push(`<a href="${esc(m.emailHref)}" style="color:var(--sec); text-decoration:none;">${esc(m.email)}</a>`);
  if (m.phone) parts.push(`<a href="${esc(m.telHref)}" style="color:var(--sec); text-decoration:none;">${esc(m.phone)}</a>`);
  if (m.githubDisplay) parts.push(`<a href="${esc(m.githubUrl)}" target="_blank" rel="noopener" style="color:var(--sec); text-decoration:none;">${esc(m.githubDisplay)}</a>`);
  if (m.linkedinDisplay) parts.push(`<a href="${esc(m.linkedinUrl)}" target="_blank" rel="noopener" style="color:var(--sec); text-decoration:none;">${esc(m.linkedinDisplay)}</a>`);
  return parts.join('\n        <span style="color:var(--rule);">·</span>\n        ');
}

function experienceSection(jobs) {
  if (!jobs.length) return '';
  const items = jobs.map(job => `<div style="margin-bottom:9px; break-inside:avoid;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; gap:14px;">
              <div style="font-size:12px; line-height:1.3;"><span style="font-weight:600; color:var(--ink);">${esc(job.role)}</span><span style="color:var(--faint);"> · </span><span style="color:var(--sec);">${esc(job.org)}</span></div>
              <div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:var(--faint); white-space:nowrap;">${esc(job.period)}</div>
            </div>
            <div style="font-size:10px; color:var(--faint); margin-top:2px; line-height:1.4;">${rich(job.blurb)}</div>
            ${job.bullets.length ? `<ul style="margin:5px 0 0; padding:0; list-style:none; display:flex; flex-direction:column; gap:2px;">
              ${job.bullets.map(b => `<li style="font-size:10px; line-height:1.45; color:var(--sec); display:flex; gap:8px;">
                <span style="color:var(--faint); flex:none;">–</span><span>${rich(b)}</span>
              </li>`).join('\n              ')}
            </ul>` : ''}
          </div>`).join('\n          ');
  return `<section style="margin-bottom:12px;">
          ${mainSectionHeader('Experience', 11)}
          ${items}
        </section>`;
}

function projectsSection(projects) {
  if (!projects.length) return '';
  const items = projects.map(p => `<div style="margin-bottom:7px; break-inside:avoid;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; gap:14px;">
              <div style="font-family:'IBM Plex Mono',monospace; font-size:11px; line-height:1.3;"><span style="color:var(--faint);">${esc(p.owner)}</span><span style="font-weight:500; color:var(--ink);">${esc(p.repo)}</span></div>
              <div style="font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:0.08em; text-transform:uppercase; color:var(--faint); white-space:nowrap;">${esc(p.role)}</div>
            </div>
            <div style="font-size:10px; color:var(--sec); margin-top:3px; line-height:1.45;">${rich(p.description)}</div>
            <div style="font-family:'IBM Plex Mono',monospace; font-size:8.5px; color:var(--faint); margin-top:3px; line-height:1.4; letter-spacing:0.02em;">${esc(p.keywordLine)}</div>
          </div>`).join('\n          ');
  return `<section style="break-inside:avoid;">
          ${mainSectionHeader('Open Source', 9)}
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
  return skills.map(g => `<div style="margin-bottom:7px;">
            <div style="font-size:9.5px; font-weight:600; color:var(--ink); margin-bottom:2px;">${esc(g.name)}</div>
            <div style="font-size:9.5px; color:var(--sec); line-height:1.5;">${esc(g.line)}</div>
          </div>`).join('\n          ');
}

function educationItems(education) {
  return education.map(e => `<div style="margin-bottom:6px;">
            <div style="font-size:10px; font-weight:600; color:var(--ink); line-height:1.3;">${esc(e.school)}</div>
            <div style="font-size:9.5px; color:var(--sec); margin-top:1px; line-height:1.4;">${esc(e.degree)}</div>
            <div style="font-family:'IBM Plex Mono',monospace; font-size:8.5px; color:var(--faint); margin-top:2px;">${esc(e.period)}</div>
          </div>`).join('\n          ');
}

function certItems(certs) {
  return certs.map(c => {
    const name = c.url
      ? `<a href="${esc(c.url)}" target="_blank" rel="noopener" style="color:var(--ink); text-decoration:none;">${esc(c.name)}</a>`
      : esc(c.name);
    return `<div style="margin-bottom:6px;">
            <div style="font-size:10px; font-weight:600; color:var(--ink); line-height:1.3;">${name}</div>
            <div style="font-family:'IBM Plex Mono',monospace; font-size:8.5px; color:var(--faint); margin-top:1px;">${esc(c.meta)}</div>
          </div>`;
  }).join('\n          ');
}

function interestItems(interests) {
  return interests.map(i => `<div style="margin-bottom:6px;">
            <div style="font-size:10px; font-weight:600; color:var(--ink); line-height:1.3;">${esc(i.name)}</div>
            <div style="font-size:9.5px; color:var(--sec); margin-top:1px; line-height:1.5;">${esc(i.line)}</div>
          </div>`).join('\n          ');
}

function languageItems(languages) {
  return languages.map(l => `<div style="display:flex; justify-content:space-between; align-items:baseline; font-size:10px; margin-bottom:4px;">
            <span style="color:var(--ink);">${esc(l.language)}</span><span style="font-family:'IBM Plex Mono',monospace; font-size:8.5px; color:var(--faint);">${esc(l.fluency)}</span>
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
    <a href="./resume.pdf" target="_blank" rel="noopener" style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--sec); background:var(--sheet); border:1px solid var(--rule); border-radius:999px; padding:6px 13px; cursor:pointer; text-decoration:none;">pdf</a>
    <button id="cv-print" type="button" style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--sec); background:var(--sheet); border:1px solid var(--rule); border-radius:999px; padding:6px 13px; cursor:pointer;">print</button>
    <button id="cv-theme-toggle" type="button" style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--sec); background:var(--sheet); border:1px solid var(--rule); border-radius:999px; padding:6px 13px; cursor:pointer;">light</button>
  </div>

  <div class="cv-sheet" style="width:794px; max-width:100%; min-height:1123px; margin:0 auto; background:var(--sheet); box-shadow:var(--shadow); padding:36px 54px 28px;">

    <header>
      <h1 style="margin:0; font-family:'IBM Plex Serif',Georgia,serif; font-size:36px; font-weight:400; letter-spacing:-0.015em; line-height:1.0; color:var(--ink);">${esc(m.name)}<span class="cv-cursor" style="display:inline-block; width:10px; height:0.8em; margin-left:8px; vertical-align:-1px; background:var(--ink);"></span></h1>
      <div style="margin-top:7px; font-size:12px; font-weight:500; color:var(--sec);">${esc(m.titleMain)}</div>
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px 9px; margin-top:12px; font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:var(--sec);">
        ${contactRow(m)}
      </div>
      <p style="margin:13px 0 0; font-family:'Source Serif 4',Georgia,serif; font-style:italic; font-size:13.5px; line-height:1.5; color:var(--sec); font-weight:400; text-wrap:pretty;">${rich(m.summary)}</p>
      <div style="height:1px; background:var(--rule); margin-top:13px;"></div>
    </header>

    <div style="display:grid; grid-template-columns:1fr 258px; gap:0; margin-top:12px; align-items:start;">

      <main style="padding-right:34px;">
        ${experienceSection(m.experience)}
        ${projectsSection(m.projects)}
      </main>

      <aside style="border-left:1px solid var(--rule); padding-left:32px; display:flex; flex-direction:column; gap:11px;">
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
