/**
 * Turns a magazine issue designed on the canvas (content/magazine/<slug>/*.dc.html + issue.json)
 * into static page HTML for the site (app/lib/magazine/issues/<slug>.json).
 *
 *   node scripts/build-magazine-issue.mjs no-0
 *
 * Supports the subset of the canvas format the issues use: {{holes}}, <sc-for>, <sc-if>,
 * a DCLogic class with renderVals(). Upload ids (/_blob/<id>) are swapped for issue.json assets.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const slug = process.argv[2];
if (!slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error('usage: node scripts/build-magazine-issue.mjs <issue-slug>');

const src = join('content/magazine', slug);
const issue = JSON.parse(readFileSync(join(src, 'issue.json'), 'utf8'));

class DCLogic {
  constructor(props) { this.props = props; this.state = {}; }
  setState(s) { Object.assign(this.state, s); }
  forceUpdate() {}
}

const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function look(path, ctx) {
  path = path.trim();
  if (path === 'true') return true;
  if (path === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ctx);
}

const fill = (s, ctx) => s.replace(/\{\{([^}]+)\}\}/g, (_, p) => { const v = look(p, ctx); return v == null ? '' : esc(v); });

/** Expands the first <sc-for>/<sc-if> (with its matching close tag) and recurses; fills holes elsewhere. */
function render(tpl, ctx) {
  const open = /<sc-(for|if)\b([^>]*)>/.exec(tpl);
  if (!open) return fill(tpl, ctx);
  const name = `sc-${open[1]}`;
  const tagRe = new RegExp(`<${name}\\b[^>]*>|</${name}>`, 'g');
  tagRe.lastIndex = open.index + open[0].length;
  let depth = 1, m;
  while (depth && (m = tagRe.exec(tpl))) depth += m[0].startsWith('</') ? -1 : 1;
  if (depth) throw new Error(`unclosed <${name}>`);
  const inner = tpl.slice(open.index + open[0].length, m.index);
  const attr = (n) => (new RegExp(`${n}="([^"]*)"`).exec(open[2]) || [])[1] || '';
  let body = '';
  if (open[1] === 'for') {
    const list = look(attr('list').replace(/[{}]/g, ''), ctx) || [];
    const as = attr('as');
    body = list.map((item, i) => render(inner, Object.assign(Object.create(ctx), { [as]: item, $index: i }))).join('');
  } else if (look(attr('value').replace(/[{}]/g, ''), ctx)) {
    body = render(inner, ctx);
  }
  return fill(tpl.slice(0, open.index), ctx) + body + render(tpl.slice(m.index + m[0].length), ctx);
}

function buildPage(file) {
  const raw = readFileSync(join(src, file), 'utf8');
  const title = (/<title>([^<]*)<\/title>/.exec(raw) || [])[1] || file;
  const tpl = /<x-dc>([\s\S]*)<\/x-dc>/.exec(raw)[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();
  const tag = /<script type="text\/x-dc" data-dc-script data-props='([^']*)'>([\s\S]*?)<\/script>/.exec(raw);
  if (!tag) throw new Error(`${file}: no data-dc-script block`);
  const defs = JSON.parse(decode(tag[1]));
  const props = Object.fromEntries(Object.entries(defs).filter(([, d]) => d && 'default' in d).map(([k, d]) => [k, d.default]));
  const Component = new Function('DCLogic', `${tag[2]}; return Component;`)(DCLogic);
  let html = render(tpl, new Component(props).renderVals());
  html = html.replace(/\/_blob\/([0-9a-f]{32})/g, (_, id) => {
    if (!issue.assets[id]) throw new Error(`${file}: no asset mapped for upload ${id}`);
    return issue.assets[id];
  });
  // self-check: nothing of the template language may reach the site
  for (const leftover of ['{{', '<sc-', '/_blob/', '<script']) {
    if (html.includes(leftover)) throw new Error(`${file}: "${leftover}" left in output`);
  }
  return { id: file.replace(/\.dc\.html$/, ''), title, html };
}

const pages = readdirSync(src).filter((f) => f.endsWith('.dc.html')).sort().map(buildPage);
const out = join('app/lib/magazine/issues');
mkdirSync(out, { recursive: true });
const meta = { ...issue };
delete meta.assets;
writeFileSync(join(out, `${slug}.json`), JSON.stringify({ slug, ...meta, pages }, null, 1));
process.stdout.write(`${slug}: ${pages.length} pages → ${join(out, `${slug}.json`)}\n`);
