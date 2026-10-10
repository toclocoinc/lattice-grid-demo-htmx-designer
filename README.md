# htmx dashboard Designer over a server table

**Live demo:** https://toclocoinc.github.io/lattice-grid-demo-htmx-designer/

The server renders a plain `<table>` of work items, and sends the dashboard the author last saved as JSON. A `data-lattice-designer` element starts from that state and [Lattice Grid](https://www.latticegrid.dev/htmx/) builds a Board, a Calendar and a Gantt chart over the table, with no mount code on the page: only markup, [htmx](https://htmx.org/) and the Lattice htmx module.

The data is 36 work items across three teams (Growth, Platform and Design). The page shows five things:

1. **Built on load.** The Designer was declared with saved state; it builds a dashboard of a Board, a Calendar and a Gantt over the work-items table.
2. **Swap.** Picking a team runs an `hx-get` that swaps only the source table; the Board, Calendar and Gantt all refresh from it, and the picker comes back out of band so its pressed button follows.
3. **Edit.** Dragging a widget by its title bar raises `lattice:designer-change` with the whole state and the cause; `hx-trigger="lattice:designer-change"` posts it with a single `hx-post`, and the server's reply appears under the dashboard.
4. **Add a page.** "Add page" in the Designer toolbar creates a page, selects it and posts the state again.
5. **Back.** The state, including the selected page, is saved with htmx's history snapshot and comes back when you press Back, together with the team you had picked.

## The stand-in server

GitHub Pages is static, so `src/mock-server.js` answers htmx's requests to `/htmx-demo/` in the browser, from the route handlers in `src/server.js`, after a short delay so each swap is visible. Nothing leaves the page. Those handlers are exactly what a real server would do: return the source table for `GET /htmx-demo/designer/source` and store the dashboard state, replying with a line of HTML, for `POST /htmx-demo/designer/save`. Port them to your own backend (Django, Rails, Laravel, Go, anything that renders HTML) and delete the stand-in.

## Run it

```
npm ci
npm run serve        # http://localhost:8000/
npm run verify       # headless Chrome check of the steps at 1440x900 and 1920x1080 (needs Chrome)
```

The grid and its modules load from the published `@toclocoinc/lattice-grid` package on jsDelivr; change the version in `index.html` and `main.js` to move to a newer release. On `localhost` no licence key is needed; the key in `main.js` is the public one for `toclocoinc.github.io`.

## Files

- `index.html`: the page, with the server-rendered table and Designer already in it.
- `main.js`: installs the stand-in server, loads the Lattice scripts, the Lattice htmx module and htmx.
- `src/server.js`: the demo data, the saved dashboard, the HTML template and the route handlers.
- `src/mock-server.js`: the in-browser stand-in for a backend.
- `tools/serve.mjs`, `tools/verify.mjs`: a static file server and the headless Chrome check.

Licence: MIT for this demo's code. Lattice Grid itself is commercially licensed; see [latticegrid.dev/pricing](https://www.latticegrid.dev/pricing/).
