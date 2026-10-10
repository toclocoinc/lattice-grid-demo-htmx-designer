/**
 * The "server": a work-items table, the saved dashboard state, the HTML template
 * and the route handlers.
 */
const items = [
  ['W-101', 'Audit checkout funnel', 'Done', 'Ana Lopez', 'Growth', '2026-10-05', '2026-10-07'],
  ['W-102', 'Redesign pricing table', 'Done', 'Dev Patel', 'Growth', '2026-10-06', '2026-10-11'],
  ['W-103', 'Write the launch email', 'Doing', 'Chloe Marsh', 'Growth', '2026-10-07', '2026-10-13'],
  ['W-104', 'Set up the A/B test', 'Doing', 'Ben Okafor', 'Growth', '2026-10-12', '2026-10-17'],
  ['W-105', 'Webinar landing page', 'Doing', 'Eva Lindqvist', 'Growth', '2026-10-13', '2026-10-18'],
  ['W-106', 'Referral scheme brief', 'Todo', 'Femi Adeyemi', 'Growth', '2026-10-19', '2026-10-22'],
  ['W-107', 'Review attribution', 'Doing', 'Ana Lopez', 'Growth', '2026-10-09', '2026-10-12'],
  ['W-108', 'Quarterly results page', 'Todo', 'Dev Patel', 'Growth', '2026-10-21', '2026-10-27'],
  ['W-109', 'Partner marketing plan', 'Todo', 'Chloe Marsh', 'Growth', '2026-10-14', '2026-10-21'],
  ['W-110', 'Win-back campaign', 'Todo', 'Ben Okafor', 'Growth', '2026-10-16', '2026-10-21'],
  ['W-111', 'Onboarding emails', 'Todo', 'Eva Lindqvist', 'Growth', '2026-10-20', '2026-10-24'],
  ['W-112', 'Logistics case study', 'Todo', 'Femi Adeyemi', 'Growth', '2026-10-22', '2026-10-27'],
  ['W-201', 'Move billing to ledger', 'Done', 'Ben Okafor', 'Platform', '2026-10-05', '2026-10-07'],
  ['W-202', 'Rotate the API keys', 'Done', 'Eva Lindqvist', 'Platform', '2026-10-07', '2026-10-12'],
  ['W-203', 'Cache pricing lookups', 'Doing', 'Femi Adeyemi', 'Platform', '2026-10-09', '2026-10-15'],
  ['W-204', 'Retire the v1 webhooks', 'Doing', 'Chloe Marsh', 'Platform', '2026-10-12', '2026-10-17'],
  ['W-205', 'Load test export queue', 'Doing', 'Ana Lopez', 'Platform', '2026-10-14', '2026-10-19'],
  ['W-206', 'Failover drill', 'Todo', 'Dev Patel', 'Platform', '2026-10-21', '2026-10-24'],
  ['W-207', 'Upgrade the job runner', 'Doing', 'Ben Okafor', 'Platform', '2026-10-09', '2026-10-12'],
  ['W-208', 'Audit log retention', 'Todo', 'Eva Lindqvist', 'Platform', '2026-10-22', '2026-10-28'],
  ['W-209', 'Single sign-on rollout', 'Todo', 'Femi Adeyemi', 'Platform', '2026-10-16', '2026-10-23'],
  ['W-210', 'Reduce build times', 'Todo', 'Chloe Marsh', 'Platform', '2026-10-16', '2026-10-21'],
  ['W-211', 'Payment queue alerts', 'Todo', 'Ana Lopez', 'Platform', '2026-10-21', '2026-10-25'],
  ['W-212', 'Move images to storage', 'Todo', 'Dev Patel', 'Platform', '2026-10-24', '2026-10-29'],
  ['W-301', 'Colour palette audit', 'Done', 'Grace Tan', 'Design', '2026-10-06', '2026-10-08'],
  ['W-302', 'Mobile navigation', 'Done', 'Hugo Martin', 'Design', '2026-10-07', '2026-10-12'],
  ['W-303', 'Icon set refresh', 'Doing', 'Ines Costa', 'Design', '2026-10-08', '2026-10-14'],
  ['W-304', 'Empty report states', 'Doing', 'Jonas Weber', 'Design', '2026-10-13', '2026-10-18'],
  ['W-305', 'Accessibility review', 'Doing', 'Grace Tan', 'Design', '2026-10-14', '2026-10-19'],
  ['W-306', 'Widget gallery', 'Todo', 'Hugo Martin', 'Design', '2026-10-20', '2026-10-23'],
  ['W-307', 'Checklist artwork', 'Doing', 'Grace Tan', 'Design', '2026-10-10', '2026-10-13'],
  ['W-308', 'Help centre artwork', 'Todo', 'Hugo Martin', 'Design', '2026-10-22', '2026-10-28'],
  ['W-309', 'Dark theme tokens', 'Todo', 'Ines Costa', 'Design', '2026-10-15', '2026-10-22'],
  ['W-310', 'Pricing page prototype', 'Todo', 'Jonas Weber', 'Design', '2026-10-17', '2026-10-22'],
  ['W-311', 'Export usability tests', 'Todo', 'Grace Tan', 'Design', '2026-10-21', '2026-10-25'],
  ['W-312', 'Component docs', 'Todo', 'Hugo Martin', 'Design', '2026-10-23', '2026-10-28'],
].map(([id, title, status, owner, team, start, end]) => ({ id, title, status, owner, team, start, end }));

// SERVER TEMPLATE START
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const teams = ['Growth', 'Platform', 'Design'];
const statuses = ['Todo', 'Doing', 'Done'];

/** The dashboard the author last saved. A swap re-sends it, so a swap never resets the layout. */
let saved = {
  schemaVersion: 1,
  selectedPageId: 'delivery',
  panels: {},
  pages: [{
    id: 'delivery', title: 'Delivery',
    spec: {
      layout: { columns: 1, rows: 3, overflowY: 'scroll', rowHeight: '300px', windows: [
        { id: 'board', xPos: 1, yPos: 1, xSize: 1, ySize: 1 },
        { id: 'week', xPos: 1, yPos: 2, xSize: 1, ySize: 1 },
        { id: 'plan', xPos: 1, yPos: 3, xSize: 1, ySize: 1 },
      ] },
      panels: [
        { id: 'board', kind: 'board', title: 'By status', source: 'items',
          options: { columnProperty: 'status', columns: statuses.map((s) => ({ id: s, title: s })), card: { title: 'title', subtitle: 'owner' } } },
        { id: 'week', kind: 'calendar', title: 'This fortnight', source: 'items',
          options: { view: 'week', date: '2026-10-12', startProperty: 'start', endProperty: 'end', card: { title: 'title' } } },
        { id: 'plan', kind: 'gantt', title: 'Plan', source: 'items',
          options: { fields: { id: 'id', name: 'title', start: 'start', end: 'end' }, split: { zoom: 'week' } } },
      ],
    },
  }],
};

const itemRow = (r) =>
  `<tr data-lattice-row="${r.id}"><td>${r.id}</td><td>${esc(r.title)}</td><td>${r.status}</td><td>${esc(r.owner)}</td><td>${r.team}</td>
    <td>${r.start}</td><td>${r.end}</td></tr>`;

/** The team picker. Its pressed state is in the markup, so a history snapshot carries it. */
const picker = (team, page, attrs = '') =>
  `<div class="filters" id="team-filters" ${attrs}>${['', ...teams]
    .map((t) => `<button hx-get="/htmx-demo/designer/source?team=${t}" hx-target="#source"
      hx-push-url="${page}?team=${t}" aria-pressed="${t === team}">${t || 'All teams'}</button>`)
    .join('\n  ')}</div>`;

/** The source the dashboard reads: a server table with one row per work item. */
const sourceTable = (list) =>
  `<table id="items" data-lattice-grid>
  <thead><tr><th data-field="id">Ref</th><th data-field="title">Work item</th><th data-field="status">Status</th>
    <th data-field="owner">Owner</th><th data-field="team">Team</th><th data-field="start" data-type="date">Start</th>
    <th data-field="end" data-type="date">End</th></tr></thead>
  <tbody>
  ${list.map(itemRow).join('\n  ')}
  </tbody>
</table>`;

const forTeam = (team) => (team ? items.filter((r) => r.team === team) : items);

/** The picker, the source, and the Designer over it, started from the saved state. */
export function designerFragment(team = '', page = (typeof location !== 'undefined' ? location.pathname : '/lattice-grid-demo-htmx-designer/')) {
  const state = JSON.stringify(saved).replace(/</g, '\\u003c');
  return `<div class="view">${picker(team, page)}
<div id="source">${sourceTable(forTeam(team))}</div>
<div data-lattice-designer data-lattice-bind="items" hx-post="/htmx-demo/designer/save" hx-trigger="lattice:designer-change"
  hx-vals='js:{state: JSON.stringify(event.detail.state), cause: event.detail.cause}'
  hx-target="#save-status" hx-swap="innerHTML" style="height:calc(100vh - 300px); min-height:640px"></div>
<script type="application/json" data-lattice-config>{"mode":"edit","state":${state}}</script></div>`;
}

export const routes = {
  // hx-get: only the source table is swapped; the designer stays and its widgets refresh.
  // The picker comes back out of band, so its pressed button follows.
  'GET /htmx-demo/designer/source': ({ params }) =>
    sourceTable(forTeam(params.team)) + picker(params.team, location.pathname, 'hx-swap-oob="true"'),

  // hx-post from lattice:designer-change: keep the whole state and confirm.
  'POST /htmx-demo/designer/save': ({ params }) => {
    saved = JSON.parse(params.state);
    const page = saved.pages.find((p) => p.id === saved.selectedPageId);
    return `Server saved the dashboard (${esc(params.cause)}): ${page.spec.panels.length} widgets on ${esc(page.title)}`;
  },
};
// SERVER TEMPLATE END
