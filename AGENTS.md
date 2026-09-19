# AGENTS.md

> Guide for agents and humans working in this repo.

## Project

Figma plugin **Figma Commands** built with [`@create-figma-plugin`](https://yuanqing.github.io/create-figma-plugin/) v4 (`build / utilities / ui / tsconfig @ 4.0.3`, `@figma/plugin-typings @ 1.138`, `typescript @ 5.9`, `preact >= 10`).

## Structure

```
src/
  detach-instances/main.ts                  # command without UI
  remove-all-auto-layout-constraints/main.ts
  remove-hidden-layers/main.ts
  unlink-layer-styles/main.ts
  type-scanner/{main.ts,scan.ts,types.ts,ui.tsx}  # only command WITH UI
package.json          # figma-plugin manifest (id 1676660366330) + 5-command menu
tsconfig.json         # extends @create-figma-plugin/tsconfig (skipLibCheck, types: plugin-typings)
.oxlintrc.json        # lint (replaces eslint)
.oxfmtrc.json         # formatting (replaces prettier, style: singleQuote, semi:false, tabWidth:2)
```

Convention: **one folder per command**. Commands without UI expose only `main.ts` with `export default function ()`. Only `type-scanner` has `ui.tsx` (Preact + `@create-figma-plugin/ui`) with logic split into `scan.ts` / `types.ts`.

## Scripts

| Script                 | What it does                                                                     |
| ---------------------- | -------------------------------------------------------------------------------- |
| `npm run build`        | `build-figma-plugin --typecheck --minify` (generates `manifest.json` + `build/`) |
| `npm run watch`        | automatic rebuild on changes                                                     |
| `npm run typecheck`    | `tsc --noEmit`                                                                   |
| `npm run lint`         | `oxlint .`                                                                       |
| `npm run lint:fix`     | `oxlint --fix .`                                                                 |
| `npm run format`       | `oxfmt` (writes)                                                                 |
| `npm run format:check` | `oxfmt --check` (CI)                                                             |

Requirements: Node 20+ and the Figma desktop app. Install with `npm install`. To test: `npm run build`, then in Figma run `Import plugin from manifest…` and pick the generated `manifest.json`. Do not commit `manifest.json` or `build/` (they are in `.gitignore`).

## Conventions

- Strict TypeScript via `@create-figma-plugin/tsconfig`. Do not use `any` except for the pre-existing dynamic `styleId` access.
- Commands without UI: validate `figma.currentPage.selection`, traverse recursively, finish with `figma.notify()` + `figma.closePlugin()`.
- Command with UI (`type-scanner`): `main.ts` uses `emit/on/showUI` from `utilities`; `ui.tsx` uses `render` from `ui` + `preact/hooks`. Messages: `SCAN_TEXT_STYLES` / `TEXT_STYLES_SCANNED` / `SELECT_TEXT_STYLE_GROUP`.
- Style: `singleQuote`, no semicolons, `tabWidth: 2`, `bracketSpacing: false`, `arrowParens: avoid`, `printWidth: 80` (see `.oxfmtrc.json`). Lint with oxlint (`typescript` plugin, `no-console` off because `console.error` is used in `remove-hidden-layers`).
- To add a new command: create `src/<name>/main.ts` (plus `ui.tsx` with `preact` if it needs UI), register it in `package.json → figma-plugin.menu[]` with `main` (and `ui` when applicable), and document it in `README.md`.

## Don'ts

- Do not reintroduce `eslint`, `prettier`, or `rimraf` (removed in the oxlint/oxfmt + build v4 migration).
- Do not commit `manifest.json`, `build/`, `node_modules/`, or `*.tsbuildinfo`.
- Do not change the plugin `id` (`1676660366330`) without reason: it would break the existing installation.
