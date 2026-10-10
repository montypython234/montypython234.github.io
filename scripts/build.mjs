import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(path.join(root, 'content', 'portfolio.json'), 'utf8'));
const pageCount = data.projects.length + 2;
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const lines = value => escape(value).replace(/\n/g, '<br>\n');
const external = (url, label, extra = '') =>
  `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer" ${extra}>${escape(label)}<span aria-hidden="true" class="link-arrow">&#8599;</span></a>`;
const linkedIn = () => external(data.linkedin,
  'LinkedIn',
  'class="social-link" aria-label="Visit Meharin Onty on LinkedIn (opens in a new tab)"')
  .replace('>LinkedIn', '><img src="assets/icons/linkedin.png" width="24" height="24" alt="">LinkedIn');
const flower = '<svg class="flower" viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor"><ellipse cx="50" cy="27" rx="12" ry="25"/><ellipse cx="50" cy="73" rx="12" ry="25"/><ellipse cx="27" cy="50" rx="25" ry="12"/><ellipse cx="73" cy="50" rx="25" ry="12"/><ellipse cx="50" cy="27" rx="12" ry="25" transform="rotate(45 50 50)"/><ellipse cx="50" cy="73" rx="12" ry="25" transform="rotate(45 50 50)"/><ellipse cx="27" cy="50" rx="25" ry="12" transform="rotate(45 50 50)"/><ellipse cx="73" cy="50" rx="25" ry="12" transform="rotate(45 50 50)"/></g><circle cx="50" cy="50" r="11" fill="var(--paper)"/></svg>';
const tags = values => `<ul class="tags" aria-label="Skills used">${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>`;
const footer = page => `<div class="folio-footer" aria-hidden="true"><span>${escape(data.brand)} / ${escape(data.name)}</span><span>${String(page).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}</span></div>`;
const projectLinks = project => project.links.length
  ? `<div class="project-links">${project.links.map(link => external(link.url, link.label)).join('')}</div>` : '';
const testimonial = item => `<figure class="project-testimonial">
    <blockquote cite="${escape(item.url)}"><p>&ldquo;${escape(item.quote)}&rdquo;</p></blockquote>
    <figcaption><strong>${escape(item.author)}</strong>, ${escape(item.role)} / ${external(item.url, 'LinkedIn', `aria-label="Read ${escape(item.author)}&#39;s recommendation on LinkedIn (opens in a new tab)"`)}</figcaption>
  </figure>`;
const media = item => `<figure class="project-media">
  <div class="image-wrap">
    <img src="${escape(item.src)}" width="${item.width}" height="${item.height}" alt="${escape(item.alt)}" loading="lazy" decoding="async">
    <a class="zoom-button screen-only" href="${escape(item.src)}" target="_blank" rel="noopener noreferrer" data-image="${escape(item.src)}" data-caption="${escape(item.caption)}" data-alt="${escape(item.alt)}" aria-label="View image: ${escape(item.caption)}"><span aria-hidden="true">+</span></a>
  </div>
  <figcaption>${item.metric ? `<strong class="media-metric">${escape(item.metric)}</strong>` : ''}${escape(item.caption)}${item.url ? `<br>${external(item.url, item.linkLabel)}` : ''}</figcaption>
</figure>`;
const project = (item, index) => `<article class="folio-page project project--${escape(item.layout)}" id="${escape(item.id)}" aria-labelledby="${escape(item.id)}-title">
  <header class="project-header">
    <div class="project-kicker"><span class="project-number">${escape(item.number)}</span><span>${escape(item.category)}</span><span class="status">${escape(item.status)}</span></div>
    <div class="project-heading"><div><p class="eyebrow">${escape(item.brand)} / ${escape(item.sector)}</p><h2 id="${escape(item.id)}-title">${escape(item.title)}</h2></div><p class="project-period">${escape(item.period)}</p></div>
    <p class="project-summary">${escape(item.summary)}</p>
  </header>${item.testimonial ? `\n  ${testimonial(item.testimonial)}` : ''}
  <div class="project-layout">
    <div class="project-gallery">${item.media.map(media).join('')}</div>
    <div class="project-copy">
      <div class="story-sections">${item.sections.map(section => `<section><h3>${escape(section.heading)}</h3>${section.text ? `<p>${escape(section.text)}</p>` : ''}${section.items ? `<ul class="contribution-list">${section.items.map(text => `<li>${escape(text)}</li>`).join('')}</ul>` : ''}</section>`).join('')}</div>
      <aside class="project-note"><span class="note-mark" aria-hidden="true">*</span><div><h3>${escape(item.note.label)}</h3><p>${escape(item.note.text)}</p></div></aside>
      ${tags(item.tools)}
      ${projectLinks(item)}
    </div>
  </div>
  ${footer(index + 2)}
</article>`;
const education = item => `<div class="education-item"><h4>${escape(item.title)}</h4><p>${escape(item.institution)}</p><p class="education-detail">${escape(item.detail)}</p><ul>${item.highlights.map(text => `<li>${escape(text)}</li>`).join('')}</ul></div>`;
const course = item => `<li class="course-card">
  <img src="${escape(item.image.src)}" width="${item.image.width}" height="${item.image.height}" alt="${escape(item.image.alt)}" loading="lazy" decoding="async">
  <div><h4>${escape(item.title)}</h4><p class="course-grade"><strong>${escape(item.grade)}%</strong> course grade</p>${external(item.url, 'View certificate', `aria-label="View certificate for ${escape(item.title)} on Coursera (opens in a new tab)"`)}</div>
</li>`;
const schema = {
  '@context': 'https://schema.org', '@type': 'Person',
  name: data.name, url: data.siteUrl, sameAs: [data.linkedin],
  description: data.hero.intro, jobTitle: 'Marketing graduate',
  email: data.email,
  image: `${data.siteUrl}/${data.hero.portrait}`,
};
const html = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#173e35">
  <meta name="description" content="Meet Meharin Onty, an MSc International Marketing graduate with Distinction in Enfield. Explore real-world social content, website work and independent creative concepts.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="The Meharin Edit | Meharin Onty, Marketing Graduate">
  <meta property="og:description" content="Thoughtful ideas. Content that feels human. Explore Meharin's selected marketing work.">
  <meta property="og:url" content="${escape(data.siteUrl)}/">
  <meta property="og:image" content="${escape(data.siteUrl)}/assets/images/social-card.jpg">
  <meta property="og:image:alt" content="The Meharin Edit: Meharin Onty's marketing portfolio.">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${escape(data.siteUrl)}/">
  <link rel="icon" type="image/svg+xml" href="assets/icons/favicon.svg">
  <link rel="preload" href="assets/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="styles.css">
  <script src="app.js" defer></script>
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
  <title>The Meharin Edit | Meharin Onty, Marketing Graduate</title>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header screen-only">
    <a class="wordmark" href="#top" aria-label="The Meharin Edit, back to top">${flower}<span>the meharin <i>edit.</i></span></a>
    <nav aria-label="Main navigation"><a href="#work">Selected work</a><a href="#about">About me</a><a class="nav-contact" href="#contact">Say hello <span aria-hidden="true">&#8599;</span></a></nav>
  </header>
  <main id="main">
    <section class="folio-page hero" id="top" aria-labelledby="hero-title">
      <div class="hero-topline"><span>${escape(data.brand)} / ${escape(data.edition)}</span><span>${escape(data.location)}</span></div>
      <div class="hero-layout">
        <div class="hero-copy">
          <p class="eyebrow">${escape(data.hero.eyebrow)}</p>
          <h1 id="hero-title">${escape(data.hero.greeting)}</h1>
          <p class="hero-headline">${lines(data.hero.headline)}</p>
          <p class="hero-intro">${escape(data.hero.intro)}</p>
          <p class="availability"><span aria-hidden="true"></span>${escape(data.hero.availability)}</p>
          <div class="hero-actions screen-only"><a class="button button--dark" href="#work">Explore my work <span aria-hidden="true">&#8595;</span></a><a class="button button--outline" href="${escape(data.pdf)}" download>Download portfolio <span aria-hidden="true">&#8595;</span></a></div>
          <div class="hero-socials"><a href="mailto:${escape(data.email)}">${escape(data.email)}</a>${linkedIn()}</div>
        </div>
        <figure class="portrait"><div class="portrait-frame"><img src="${escape(data.hero.portrait)}" alt="${escape(data.hero.portraitAlt)}" width="800" height="1000" fetchpriority="high">${flower}<span class="portrait-label">a little about me</span></div><figcaption>${escape(data.hero.portraitCaption)}</figcaption></figure>
      </div>
      <div class="proof-strip">${data.hero.proof.map(item => `<div><strong>${escape(item.value)}</strong><span>${escape(item.label)}</span></div>`).join('')}</div>
      <section class="cover-index print-only" aria-label="In this portfolio">${data.projects.map((item, index) => `<div><span class="eyebrow">Page ${String(index + 2).padStart(2, '0')} / ${escape(item.category)}</span><h2>${escape(item.brand)}</h2><p>${escape(item.title)}</p></div>`).join('')}</section>
      ${footer(1)}
    </section>
    <section class="work-index screen-only" id="work" aria-labelledby="work-title">
      <div class="section-intro"><p class="eyebrow">${escape(data.workIntro.eyebrow)}</p><h2 id="work-title">${escape(data.workIntro.title)}</h2><p>${escape(data.workIntro.text)}</p></div>
      <div class="project-index">${data.projects.map(item => `<a class="work-card work-card--${escape(item.id)}" href="#${escape(item.id)}"><div class="work-card-image"><img src="${escape(item.thumbnail)}" alt="${escape(item.thumbnailAlt)}" loading="lazy" decoding="async"><span class="card-arrow" aria-hidden="true">&#8599;</span></div><div class="work-card-caption"><div><span class="eyebrow">${escape(item.category)}</span><h3>${escape(item.brand)}</h3><p>${escape(item.title)}</p></div><span class="card-number" aria-hidden="true">${escape(item.number)}</span></div></a>`).join('')}</div>
    </section>
    <div class="case-studies">${data.projects.map(project).join('')}</div>
    <section class="folio-page about" id="about" aria-labelledby="about-title">
      <div class="about-heading"><div><p class="eyebrow">${escape(data.about.eyebrow)}</p><h2 id="about-title">${lines(data.about.title)}</h2></div>${flower}</div>
      <div class="about-intro"><p>${escape(data.about.intro)}</p><p>${escape(data.about.body)}</p></div>
      <div class="about-grid">
        <div class="education"><h3 class="column-title">A marketing foundation</h3>${data.about.education.map(education).join('')}</div>
        <div class="capabilities"><h3 class="column-title">What I can bring to a team</h3>${data.about.skills.map(group => `<section class="skill-group"><h4>${escape(group.title)}</h4><ul>${group.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul></section>`).join('')}<p class="languages"><strong>Languages</strong><br>${escape(data.about.languages)}</p><p class="role-note">${escape(data.about.role)}</p></div>
      </div>
      <section class="learning" aria-labelledby="learning-title"><div class="learning-heading"><h3 class="column-title" id="learning-title">${escape(data.about.learning.title)}</h3><p>${escape(data.about.learning.text)}</p></div><ul class="course-list">${data.about.learning.courses.map(course).join('')}</ul></section>
      <div class="contact-block" id="contact"><div><h3>${escape(data.about.contactTitle)}</h3><p>${escape(data.about.contactText)}</p></div><div class="contact-links"><a class="email-link" href="mailto:${escape(data.email)}">${escape(data.email)} <span aria-hidden="true">&#8599;</span></a>${linkedIn()}<a class="text-link screen-only" href="${escape(data.pdf)}" download>Download the portfolio PDF <span aria-hidden="true">&#8595;</span></a></div></div>
      <p class="rights-note">${escape(data.footer.disclaimer)}</p>
      ${footer(pageCount)}
    </section>
  </main>
  <footer class="site-footer screen-only"><span>${escape(data.footer.credit)}</span><span>${escape(data.footer.privacy)}</span><a href="#top">Back to top <span aria-hidden="true">&#8593;</span></a></footer>
  <dialog class="image-dialog" aria-labelledby="image-dialog-caption"><button class="dialog-close" type="button" aria-label="Close enlarged image">Close <span aria-hidden="true">&times;</span></button><img alt=""><p id="image-dialog-caption"></p><a class="dialog-original" target="_blank" rel="noopener noreferrer">Open full-resolution image <span aria-hidden="true">&#8599;</span></a></dialog>
</body>
</html>
`;
await mkdir(path.join(root, 'downloads'), { recursive: true });
await writeFile(path.join(root, 'index.html'), html.replace(/[ \t]+$/gm, ''), 'utf8');
await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${data.siteUrl}/sitemap.xml\n`, 'utf8');
await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${data.siteUrl}/</loc></url></urlset>\n`, 'utf8');
console.log(`Built index.html from ${data.projects.length} projects. Web and PDF use the same document.`);
