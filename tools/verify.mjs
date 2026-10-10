// Real-Chrome check of the five steps at 1440x900 and 1920x1080: built on load, a source swap,
// a posted edit, an added page, Back, and no console errors or [lattice] warnings.
// Screenshots go to shots/ (ignored by git) so they can be read by eye.
//   npm run serve                    (in another terminal)
//   CHROME=/usr/bin/google-chrome node tools/verify.mjs [http://localhost:8000/]
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://localhost:8000/';
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
let failed = 0;
const check = (ok, what) => { if (!ok) failed += 1; console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); };
mkdirSync('shots', { recursive: true });

// What each widget shows, read from the page.
const state = () => document.evaluate && (() => {
  const win = (title) => [...document.querySelectorAll('.lat-layout__window')].find((w) => w.textContent.includes(title));
  const board = win('By status');
  const cal = win('This fortnight');
  const plan = win('Plan');
  const has = (w, t) => (w ? w.textContent.includes(t) : false);
  return {
    sourceRows: Number(document.querySelector('#items [role=grid]')?.getAttribute('aria-rowcount') || 0) - 1,
    cards: board ? board.querySelectorAll('[class*=card]').length : 0,
    board: has(board, 'Move billing to ledger'),
    calendar: has(cal, 'Set up the A/B test'),
    calendarOther: has(cal, 'Load test export queue'),
    plan: has(plan, 'Audit checkout funnel'),
    planOther: has(plan, 'Load test export queue'),
    pressed: [...document.querySelectorAll('#team-filters button[aria-pressed=true]')].map((b) => b.textContent).join(),
    tabs: [...document.querySelectorAll('.lattice-designer-tab')].map((t) => t.textContent.trim() + (t.getAttribute('aria-selected') === 'true' ? '*' : '')).join('|'),
    status: document.getElementById('save-status').textContent,
    log: document.getElementById('request-log').textContent,
  };
})();
const snap = (page) => page.evaluate(state);
const click = async (page, text, sel = 'button') => {
  const h = await page.evaluateHandle((t, s) => [...document.querySelectorAll(s)].find((e) => e.textContent.trim() === t), text, sel);
  await h.asElement().click();
};

try {
  for (const [width, height] of [[1440, 900], [1920, 1080]]) {
    console.log(`\n== ${width}x${height}`);
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    const problems = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning' || m.text().includes('[lattice]')) problems.push(`${m.type()}: ${m.text()}`); });
    page.on('pageerror', (e) => problems.push(e.message));
    await page.goto(url);
    await page.waitForFunction(() => document.querySelectorAll('.lat-layout__window').length === 3, { timeout: 30000 });
    await sleep(2000);
    const tag = `${width}`;
    const first = await snap(page);
    check(first.sourceRows >= 36 && first.board && first.calendar && first.calendarOther && first.plan && first.planOther, `built on load: ${first.sourceRows} source rows; board, calendar and plan show their items`);
    await page.screenshot({ path: `shots/${tag}-1-load.png` });
    await page.evaluate(() => [...document.querySelectorAll('.lat-layout__window')].find((w) => w.textContent.includes('Plan')).scrollIntoView());
    await sleep(500);
    await page.screenshot({ path: `shots/${tag}-1b-plan.png` });
    await page.evaluate(() => window.scrollTo(0, 0));

    await click(page, 'Growth');
    await sleep(2000);
    const growth = await snap(page);
    check(growth.pressed === 'Growth' && growth.sourceRows === 12 && !growth.board && growth.calendar && !growth.calendarOther && growth.plan && !growth.planOther, `swap: Growth, ${growth.sourceRows} source rows; Platform items gone from all three widgets`);
    await page.screenshot({ path: `shots/${tag}-2-swap.png` });

    const bar = await page.evaluate(() => { const r = [...document.querySelectorAll('.lat-layout__window')].find((w) => w.textContent.includes('By status')).firstElementChild.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const cal = await page.evaluate(() => { const r = [...document.querySelectorAll('.lat-layout__window')].find((w) => w.textContent.includes('This fortnight')).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height - 20 }; });
    await page.mouse.move(bar.x, bar.y);
    await page.mouse.down();
    await page.mouse.move(cal.x, (bar.y + cal.y) / 2, { steps: 8 });
    await page.mouse.move(cal.x, cal.y, { steps: 8 });
    await page.mouse.up();
    await sleep(1500);
    const moved = await snap(page);
    check(/Server saved the dashboard \(move\)/.test(moved.status) && /POST \/htmx-demo\/designer\/save/.test(moved.log), `edit: ${moved.status}`);
    await page.screenshot({ path: `shots/${tag}-3-edit.png` });

    await click(page, 'Add page');
    await sleep(1500);
    const added = await snap(page);
    check(added.tabs.split('|').length === 2 && /addPage/.test(added.status), `add page: ${added.tabs}; ${added.status}`);
    await page.screenshot({ path: `shots/${tag}-4-addpage.png` });

    await click(page, 'Delivery', '.lattice-designer-tab');
    await sleep(800);
    await click(page, 'Platform');
    await sleep(2000);
    await click(page, 'Page 2', '.lattice-designer-tab').catch(() => {});
    const before = await snap(page);
    await sleep(800);
    await page.goBack();
    await sleep(2500);
    const back = await snap(page);
    check(back.pressed === 'Growth' && back.tabs === 'Delivery*|Page 2' && back.sourceRows === 12 && !back.board && back.calendar && back.plan, `Back: team ${back.pressed}, tabs ${back.tabs} (before: ${before.pressed}, ${before.tabs})`);
    await page.screenshot({ path: `shots/${tag}-5-back.png` });

    check(problems.length === 0, `no console errors or warnings ${problems.join(' / ')}`);
    await page.close();
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
