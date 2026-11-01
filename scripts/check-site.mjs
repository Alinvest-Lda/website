import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const fail = [];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const pages = ['index.html', 'detalhe.html', 'noticia.html', 'politica-de-privacidade.html'];
for (const page of pages) {
  if (!exists(page)) fail.push('Missing page: ' + page);
}
const htmlFiles = pages.filter(exists);
for (const page of htmlFiles) {
  const source = read(page);
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) fail.push(page + ' has duplicate IDs: ' + [...new Set(duplicates)].join(', '));
  for (const match of source.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|#|javascript:|data:)/i.test(value)) continue;
    const clean = value.split(/[?#]/)[0];
    if (!clean || clean.startsWith('/api/')) continue;
    if (!exists(clean)) fail.push(page + ' references missing local asset: ' + value);
  }
}
for (const file of ['robots.txt', 'sitemap.xml', 'manifest.webmanifest', 'assets/css/site.css', 'assets/js/site.js', 'assets/js/content-data.js', 'assets/js/content-renderer.js', 'assets/js/cms.js', 'assets/js/cms-config.js', 'assets/js/detail-page.js', 'assets/js/news-page.js', 'api/contact.js']) {
  if (!exists(file)) fail.push('Missing required file: ' + file);
}
const jsFiles = [];
const walk = dir => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) walk(relative);
    else if (/\.(?:js|mjs)$/.test(entry.name)) jsFiles.push(relative);
  }
};
for (const dir of ['assets/js', 'api', 'scripts']) if (exists(dir)) walk(dir);
for (const file of jsFiles) {
  const check = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (check.status !== 0) fail.push('JavaScript syntax error in ' + file + ': ' + (check.stderr || check.stdout).trim());
}
if (exists('assets/js/content-data.js')) {
  const sandbox = { window: {} };
  vm.runInNewContext(read('assets/js/content-data.js'), sandbox);
  const model = sandbox.window.SERVICE_CONTENT;
  for (const key of ['provider', 'areas', 'programas', 'apoio', 'noticias']) {
    if (!model || !model[key]) fail.push('Content model missing: ' + key);
  }
  for (const [key, item] of Object.entries(model?.areas || {})) if (!item.title || !item.intro) fail.push('Area missing title/intro: ' + key);
  for (const [key, item] of Object.entries(model?.programas || {})) if (!item.title || !item.intro) fail.push('Programme missing title/intro: ' + key);
  for (const [key, item] of Object.entries(model?.apoio || {})) if (!item.title || !item.intro) fail.push('Solution missing title/intro: ' + key);
  for (const item of model?.noticias || []) if (!item.slug || !item.title || !Array.isArray(item.body)) fail.push('Article missing required fields: ' + (item.slug || '(no slug)'));
}
if (exists('robots.txt') && !read('robots.txt').includes('Sitemap: https://alinvest-group.com/sitemap.xml')) fail.push('robots.txt does not reference the canonical sitemap');
if (exists('sitemap.xml') && !read('sitemap.xml').includes('https://alinvest-group.com/')) fail.push('sitemap.xml does not include the canonical homepage');
if (fail.length) {
  console.error('Website quality checks failed:');
  for (const item of fail) console.error('- ' + item);
  process.exit(1);
}
console.log('Website quality checks passed. Pages, assets, JavaScript syntax and content model are valid.');
