import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(path.join(root, 'content', 'portfolio.json'), 'utf8'));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const source = await readFile(path.join(root, 'content', 'portfolio.json'), 'utf8');
const decode = value => value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

test('all five distinct projects have clear attribution and evidence links', () => {
  assert.equal(data.projects.length, 5);
  assert.equal(new Set(data.projects.map(project => project.id)).size, data.projects.length);
  for (const project of data.projects) {
    assert.ok(project.summary && project.status && project.period);
    assert.equal(project.sections.length, 3);
    assert.ok(project.note.text.length > 30);
    assert.ok(html.includes(`id="${project.id}"`));
  }
  assert.equal(data.projects.filter(project => project.category === 'Independent concept').length, 2);
});

test('Cheeky Panda is presented as academic work, with both brochure sides', () => {
  const project = data.projects.find(item => item.id === 'cheeky-panda');
  assert.ok(project);
  assert.equal(project.category, 'University project');
  assert.match(project.status, /not commissioned/);
  assert.match(project.summary, /two-sided brochure/);
  assert.equal(project.media.length, 2);
  assert.match(project.note.text, /not commissioned or approved/);
  assert.match(project.note.text, /not a statement of verified environmental performance/);
  assert.doesNotMatch(JSON.stringify(project), /client results|conversion uplift|campaign revenue/i);
});

test('PDF page numbering follows the number of selected projects', () => {
  const total = data.projects.length + 2;
  const footers = [...html.matchAll(/class="folio-footer"[^>]*>.*?<span>(\d{2}) \/ (\d{2})<\/span>/g)];
  assert.equal(footers.length, total);
  footers.forEach((match, index) => {
    assert.equal(Number(match[1]), index + 1);
    assert.equal(Number(match[2]), total);
  });
});

test('Anzara previews use product-detail assets without changing the source videos', () => {
  const project = data.projects.find(item => item.id === 'anzara');
  assert.equal(project.thumbnail, 'assets/images/anzara-brand-card.webp');
  assert.deepEqual(project.media.map(item => item.src), [
    'assets/images/anzara-saree-detail.webp',
    'assets/images/anzara-gharara-detail.webp',
  ]);
  assert.deepEqual(project.media.map(item => item.url), [
    'https://www.tiktok.com/@anzara.official/video/7211155694119111937',
    'https://www.tiktok.com/@anzara.official/video/7220067355550846210',
  ]);
  assert.ok(project.media.every(item => item.width >= 1500 && item.height >= 1500));
  assert.equal(data.hero.portrait, 'assets/images/meharin-portrait.webp');
  assert.doesNotMatch(html, /assets\/images\/anzara-(?:saree|gharara)\.webp/);
});

test('Nasima project card uses the real childcare setting without duplicating case-study media', () => {
  const project = data.projects.find(item => item.id === 'nasimas');
  assert.equal(project.thumbnail, 'assets/images/nasimas-brand-card.webp');
  assert.ok(project.media.every(item => item.src !== project.thumbnail));
  assert.equal(project.media[1].src, 'assets/images/nasimas-paid-results.webp');
  assert.match(project.note.text, /5\.7K paid views/);
  assert.match(project.note.text, /under GBP 40 total spend/);
  assert.match(project.note.text, /1\.7K impressions and 55 clicks/);
  assert.match(project.note.text, /audience overlap/);
});

test('canonical URLs and the Pages CNAME agree', async () => {
  const cname = (await readFile(path.join(root, 'CNAME'), 'utf8')).trim();
  assert.equal(new URL(data.siteUrl).hostname, cname);
  assert.ok(html.includes(`<link rel="canonical" href="${data.siteUrl}/">`));
  const project = data.projects.find(item => item.id === 'cheeky-panda');
  for (const image of project.media) assert.equal(new URL(image.url).origin, data.siteUrl);
});

test('substantive portfolio content is present in the generated document', () => {
  const plain = decode(html.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ' '));
  const relevant = [data.hero.intro, data.hero.availability, data.about.body, data.about.contactText];
  for (const project of data.projects) {
    relevant.push(project.title, project.summary, project.note.text);
    for (const section of project.sections) relevant.push(...(section.items || [section.text]));
  }
  for (const text of relevant) assert.ok(plain.includes(text), `Missing shared copy: ${text}`);
});

test('public copy excludes private contact details and unsupported claims', () => {
  assert.doesNotMatch(source, /7564|Ambleside|baron\.khan@|1st Class|highest aggregate|1,500|500,000|0\.5M|1,000 followers|200.*visits/i);
  assert.doesNotMatch(source, /[\u2018\u2019\u2014]/);
  assert.match(source, /Distinction/);
  assert.match(source, /not commissioned/);
});

test('hero highlights use verified, evidence-backed achievements', () => {
  assert.deepEqual(data.hero.proof, [
    { value: 'Distinction', label: 'MSc International Marketing' },
    { value: '796.5K views', label: 'Two featured Anzara TikToks' },
    { value: '5.7K paid views', label: 'Three Nasima Facebook campaigns' },
  ]);
});

test('external destinations are HTTPS, email or local anchors', () => {
  const links = [...html.matchAll(/href="([^"]+)"/g)].map(match => decode(match[1]));
  for (const link of links) {
    assert.ok(link.startsWith('https://') || link.startsWith('mailto:') || link.startsWith('#') ||
      /^(assets\/|styles\.css|downloads\/)/.test(link), `Unexpected link: ${link}`);
    assert.doesNotMatch(link, /localhost|127\.0\.0\.1/);
  }
  assert.ok(links.includes(data.linkedin));
});

test('all referenced local images, fonts and scripts exist', async () => {
  const refs = [...html.matchAll(/(?:src|href)="((?:assets\/|app\.js|styles\.css)[^"]*)"/g)].map(match => match[1]);
  const stylesheet = await readFile(path.join(root, 'styles.css'), 'utf8');
  const fontRefs = [...stylesheet.matchAll(/url\('([^']+)'\)/g)].map(match => match[1]);
  for (const ref of new Set([...refs, ...fontRefs])) await access(path.join(root, ref));
});

test('basic accessibility and progressive enhancement are present', () => {
  assert.match(html, /<html lang="en-GB">/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-labelledby="image-dialog-caption"/);
  assert.match(html, /aria-label="Main navigation"/);
  for (const match of html.matchAll(/<img\b[^>]*>/g)) assert.match(match[0], /alt="/);
});

test('Git preserves the PDF and image assets as binary files', async () => {
  const attributes = await readFile(path.join(root, '.gitattributes'), 'utf8');
  for (const extension of ['pdf', 'png', 'jpg', 'webp', 'woff2']) {
    assert.ok(attributes.split(/\r?\n/).includes(`*.${extension} binary`));
  }
});
