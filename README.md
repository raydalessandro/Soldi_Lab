# Soldi_Lab

> Infrastruttura di certezze finanziarie personali per famiglie italiane.
> Locale, AI-friendly, multi-famiglia.

App **Polo B** dell'ecosistema **EAR Lab Famiglia** — app madre:
[la-famiglia-alpha.vercel.app](https://la-famiglia-alpha.vercel.app).

## Cos'è

Soldi_Lab **non è un tracker di spese**. Mantiene aggiornati due fatti
strutturali — il *floor* di spesa (quanto ti costa stare al mondo) e
lo *stato patrimoniale* (cosa hai e come è strutturato) — in modo da
poter prendere decisioni finanziarie con dati veri, sia da soli sia
in dialogo con un advisor AI esterno o integrato.

**Distinzione fondamentale: necessario vs discrezionale.** L'app
conosce solo il necessario; il discrezionale (caffè, cene, regali,
viaggi extra) è libertà dell'utente, gestita a sentimento sul margine
che l'app calcola.

Specifica completa e versioning: [`SPEC.md`](./SPEC.md).

## Stack

- **Next.js 16** App Router con `output: 'export'` (statico, zero backend)
- **TypeScript strict**, Tailwind CSS 4
- **Dexie** (IndexedDB) come sorgente di verità locale, **Zustand** per UI state
- **Zod** ai bordi (form, import JSON)
- **PWA installabile** (manifest + icone generate da `prototype/assets/logo.png`)
- **Vitest** + Testing Library + fake-indexeddb (unit), **Playwright** (E2E mobile-chrome)

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # static export → out/
pnpm test         # unit
pnpm test:e2e     # e2e (richiede PLAYWRIGHT_BROWSERS_PATH se browser pre-installati)
pnpm lint
pnpm format
pnpm typecheck
```

Per (ri)generare le icone PWA dal logo sorgente:

```bash
pnpm icons:generate
```

## Struttura

```
src/
  app/             Route App Router (dashboard, floor, income, patrimony, cycle, advisor, settings)
  components/      Componenti React riusabili (AppHeader, BottomNav, ...)
  lib/
    db/            Schema Dexie + utility test
    repo/          Funzioni CRUD per ogni entità (l'unico punto di scrittura)
    insights/      Calcoli puri runtime (floor, income, patrimony)
    hooks/         Hook reattivi (useActiveSpace, useFloorItems, ...)
    store/         Zustand UI store
    constants.ts   Tassonomie tipate (NECESSITY_META, PATRIMONY_META, ...)
    types.ts       Entità SPEC §4.2
    zod-schemas.ts Validatori
e2e/               Test Playwright
prototype/         JSX di riferimento UI (rimossa a v1 completa)
public/            Manifest PWA + icone
scripts/           Generazione icone
SPEC.md            Specifica tecnica canonica
```

## Stato v1

Sviluppo in fasi piccole con TDD + E2E, ogni fase è una PR squashata in `main`.

- [x] **F1** Scaffold Next.js + TS + Tailwind + Vitest + Playwright + PWA
- [x] **F2** Data layer Dexie + Zod + Zustand + repository
- [x] **F3** Spazi + welcome onboarding + space switcher + impostazioni
- [x] **F4** Modulo Floor (lista, filtri, edit inline, add, archivia)
- [x] **F5** Modulo Entrate (add/edit/archivia, totale mensile normalizzato)
- [ ] **F6** Modulo Patrimonio (in corso)
- [ ] **F7** Insight runtime + Dashboard completa
- [ ] **F8** Export contesto AI (Livello 1 advisor)
- [ ] **F9** Backup / import JSON
- [ ] **F10** Onboarding contestuale + service worker offline

Fuori scope v1 (rimandato): quotazioni live (v2), ciclo economico con
indicatori reali (v2.5), chat AI integrata con DeepSeek (v3).

## Privacy

Tutti i dati restano sul dispositivo via IndexedDB. Nessun backend
EAR Lab vede i dati. Il backup è un file JSON che l'utente sceglie
dove salvare. Quando in v3 si attiverà la chat AI integrata, l'API
key DeepSeek sarà locale e le chiamate andranno direttamente
dal browser al provider.
