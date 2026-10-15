// Order is the whole trick: the stand-in server goes in first, the Lattice scripts
// the Designer's widgets need and the Lattice htmx module next so their listeners
// are registered, and htmx itself last. htmx then processes the page and fires
// htmx:load for the server-rendered markup, which is what builds the Designer.
// No mount call anywhere. Before any of that, the stand-in server answers the page's own
// URL: it renders the fragment for location.search into the page, the way a real server
// would, so the Designer is built once, for the URL's filter, and never for the default.
import { installMockServer } from './src/mock-server.js?v=202610121200';
import { routes, designerFragment } from './src/server.js?v=202610121200';

const GRID = 'https://cdn.latticegrid.dev/lattice-grid@1.103.1';
const HTMX = 'https://cdn.jsdelivr.net/npm/htmx.org@2.0.4/dist/htmx.min.js';
const HTMX_SRI = 'sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+';
// Public, domain-bound key for toclocoinc.github.io; on localhost no key is needed.
const LICENCE = 'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA';

const loadScript = (src, attrs = {}) => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  s.onload = resolve;
  s.onerror = () => reject(new Error('could not load ' + src));
  document.head.append(s);
});

installMockServer(routes);
const team = new URLSearchParams(location.search).get('team') || '';
document.getElementById('designer-view').innerHTML = designerFragment(['Growth', 'Platform', 'Design'].includes(team) ? team : '');
for (const file of ['lattice-grid', 'modules/layout', 'modules/kpi', 'modules/calendar', 'modules/kanban', 'modules/gantt', 'modules/designer']) {
  await loadScript(`${GRID}/${file}.min.js`);
}
// One call licenses every build, the htmx module included.
globalThis.LatticeGrid.setLicence(LICENCE);
await import('@toclocoinc/lattice-grid/modules/htmx');
// History URLs are the full page path, so Back works wherever the page is served from.
for (const el of document.querySelectorAll('[hx-push-url]')) {
  el.setAttribute('hx-push-url', location.pathname + el.getAttribute('hx-push-url').slice(el.getAttribute('hx-push-url').indexOf('?')));
}
// htmx 2.0.4 starts on DOMContentLoaded unless readyState is already 'complete', so a script
// added in between never starts. Wait for the window load event, then add it.
if (document.readyState !== 'complete') await new Promise((r) => { window.addEventListener('load', r, { once: true }); });
await loadScript(HTMX, { integrity: HTMX_SRI, crossorigin: 'anonymous' });

// The request log: one line per request the stand-in server answered.
const log = document.getElementById('request-log');
document.body.addEventListener('htmx:afterRequest', (e) => {
  const { requestConfig: c, xhr } = e.detail;
  if (log.firstElementChild?.textContent === 'none yet') log.replaceChildren();
  const li = document.createElement('li');
  li.textContent = c.verb.toUpperCase() + ' ' + c.path + ' → ' + xhr.status;
  log.prepend(li);
  while (log.children.length > 6) log.lastElementChild.remove();
});

