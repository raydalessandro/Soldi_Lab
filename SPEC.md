# Soldi_Lab — Specifica Tecnica

> Infrastruttura di certezze finanziarie personali per famiglie italiane.
> Locale, AI-friendly, multi-famiglia. App Polo B dell'ecosistema EAR Lab Famiglia.

---

## 1. Visione

### 1.1 Cos'è Soldi_Lab

Soldi_Lab **non è un tracker di spese**. È un'infrastruttura di certezze finanziarie esposta a un advisor AI. Mantiene aggiornati due fatti strutturali — il **floor di spesa** (quanto ti costa stare al mondo) e lo **stato patrimoniale** (cosa hai e come è strutturato) — in modo che tu possa prendere decisioni finanziarie con dati veri, sia da solo (insight automatici), sia in dialogo con un AI esterno o integrato.

### 1.2 Cosa NON è

- Non traccia transazioni quotidiane.
- Non gestisce conti correnti o saldi operativi.
- Non legge estratti conto bancari.
- Non chiede scontrini, caffè, benzine.
- Non giudica spese discrezionali — sono fuori scope per principio.

### 1.3 Il principio operativo (filosofia)

**Distinzione fondamentale: necessario vs discrezionale.**

L'app conosce solo il **necessario**: spese strutturali che ricorrono con regolarità prevedibile e la cui interruzione cambierebbe la vita in modo significativo. Tutto ciò che è discrezionale (caffè di compagnia, cena fuori del sabato, regalo improvvisato, viaggio extra) **non esiste per l'app**. È libertà dell'utente, gestita a sentimento sul margine che l'app calcola.

**Conseguenza pratica:** la lista delle voci nel Floor è finita per definizione. Una famiglia normale avrà 15-30 voci. Niente ansia da completezza.

**Onboarding tutorial (testo da mostrare al primo avvio del modulo Floor):**
> "Una spesa entra nel Floor se ricorre con regolarità prevedibile e se la sua interruzione cambierebbe in modo strutturale la tua vita o richiederebbe una decisione consapevole. Tutto il resto — caffè, cene fuori, regali improvvisati — sta fuori. Quelle spese le gestisci tu sul margine che ti resta."

### 1.4 Frequenza d'uso

Cinque minuti al mese, forse meno. L'utente apre l'app **quando cambia qualcosa di strutturale**: bolletta nuova arrivata, abbonamento iniziato/cessato, investimento fatto, aumento di stipendio. Tra una manutenzione e l'altra, l'app vive e fa lavorare l'intelligenza automatica + l'AI.

### 1.5 Pattern architetturale

Polo B esteso: filesystem-as-truth + IndexedDB locale. Zero backend. Deploy Vercel statico. PWA installabile. Italiano. Mobile-first.

---

## 2. I quattro moduli

### 2.1 Floor — Spese permanenti

Lista flat (no albero). Ogni voce ha un `necessity_level` che ne determina la criticità:

- **`essential`** — Sopravvivenza pura. Se la togli, la vita salta. Mutuo, affitto, utenze base, alimentari, tasse, salute critica.
- **`baseline`** — Standard di vita stabile e scelto. Abbonamenti, telefono, palestra, scuola figli, attività regolari. Sono scelte tue, ma stabili.
- **`lifestyle`** — Comportamenti ricorrenti riducibili. Pranzo medio al lavoro più caro della media, hobby costosi regolari, donazioni continuative non vincolanti.

Ogni voce ha anche una frequenza (`monthly`, `bimonthly`, `quarterly`, `semiannual`, `annual`) e un tipo (`fixed` = importo costante, `variable` = importo che varia, ti segno la media).

**Voce speciale automatica "Vita variabile mensile":** stima soggettiva di spesa quotidiana non tracciata (alimentari, benzina, piccole spese ricorrenti). L'utente la setta a sentimento, la rivede ogni tanto. È sempre `essential` e `variable`.

### 2.2 Entrate — Flussi stabili

Lista flat di entrate ricorrenti. Stipendio, pensione, affitti attivi, consulenze regolari, rendite. Solo entrate **stabili e ricorrenti** — non bonus una tantum, non vendite occasionali. Ogni voce: nome, importo, frequenza, attiva sì/no.

### 2.3 Patrimonio — Asset e operazioni

Lista flat di **stati attuali**, non transazioni storiche. Ogni asset ha:

- **`type`** (natura tecnica): `liquid` | `deposit` | `bonds` | `etf_stocks` | `pension` | `real_estate` | `other`
- **`patrimony_type`** (funzione strategica): `reserve` | `productive` | `parked`

**Funzioni strategiche:**
- **`reserve`** — Liquidità per emergenze. Accessibile, può non rendere. Sano: 3-6 mesi di essential.
- **`productive`** — Capitale che lavora. Produce rendimento atteso, orizzonte lungo.
- **`parked`** — Patrimonio fermo senza destinazione chiara. Né protegge, né lavora attivamente. Indicatore di sub-ottimalità.

Campi: nome, type, patrimony_type, valore corrente, rendimento atteso % annuo opzionale, contributo periodico €/mese opzionale (per PAC), scadenza opzionale, nota. Campi opzionali per quotazione automatica: `quote_symbol`, `quote_source`, `quantity`, `last_quote`, `last_quote_at`.

### 2.4 Cicli — Fase economica e settori (v2.5)

Modulo educativo minimal. La UI mostra **solo** due informazioni:

1. **In che fase del ciclo siamo** (early / mid / late / recession), con visualizzazione circolare delle 4 fasi.
2. **Quali settori storicamente performano** in quella fase.

Nessun indicatore numerico in UI. I dati grezzi (yield curve, PMI, inflazione, tasso BCE) servono solo per determinare la fase dietro le quinte. L'utente può cliccare un piccolo link "Cos'è il ciclo economico?" per aprire un articolo markdown di approfondimento, ma è opt-in completo.

**Filosofia:** non insegnare nell'app, solo fornire strumenti per decidere. Chi vuole approfondire, va a studiarsi la cosa.

### 2.5 Advisor — Intelligenza progressiva

Tre livelli, da v1 in poi:

- **Livello 0 (v1)**: Insight automatici calcolati runtime in TypeScript. Senza LLM. Sezione 5.
- **Livello 1 (v1)**: Pulsante "Esporta contesto AI" → genera markdown con stato completo + insight, copiabile in qualsiasi LLM esterno.
- **Livello 2 (v3)**: Chat integrata con DeepSeek API + tool calling. API key locale dell'utente. L'AI ragiona sui dati e dice **cosa NON fare**, non cosa fare. Sezione 7.

---

## 3. Stack tecnico

| Componente | Scelta |
|---|---|
| Framework | Next.js 15 (static export) |
| Linguaggio | TypeScript strict |
| Storage locale | IndexedDB via Dexie.js |
| Stato | Zustand |
| Styling | Tailwind CSS |
| Validazione | Zod |
| Test | Vitest |
| PWA | next-pwa |
| Deploy | Vercel statico |
| LLM v2 | DeepSeek API (API key locale utente) |
| Lingua | Italiano |

---

## 4. Modello dati

### 4.1 Convenzioni

- ID: UUID v4 generati lato client (`crypto.randomUUID()`).
- Timestamp: ISO 8601 UTC.
- Soft delete: campo `archived_at` (null se attivo).
- Audit: `created_at` e `updated_at` per ogni record.
- Valuta: EUR. Multivaluta fuori scope.

### 4.2 Entità

```typescript
// === SPAZI (famiglie) ===
type Space = {
  id: string;
  name: string;              // "Casa Mia", "Casa Genitori"
  icon?: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

// === FLOOR (spese permanenti) ===
type Frequency =
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual';

type NecessityLevel = 'essential' | 'baseline' | 'lifestyle';

type FloorItem = {
  id: string;
  space_id: string;
  name: string;              // "Mutuo casa", "Netflix", "Bolletta luce"
  amount: number;            // sempre positivo, in EUR
  frequency: Frequency;      // se 'annual', amount è ANNUO; se 'monthly', mensile, etc.
  type: 'fixed' | 'variable'; // fixed = costante, variable = media
  necessity_level: NecessityLevel;
  active: boolean;           // false = dormiente (non concorre al floor)
  note?: string;
  is_variable_life: boolean; // true solo per la voce speciale "Vita variabile mensile"
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

// === ENTRATE STABILI ===
type IncomeItem = {
  id: string;
  space_id: string;
  name: string;              // "Stipendio", "Affitto attivo"
  amount: number;
  frequency: Frequency;
  active: boolean;
  note?: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

// === PATRIMONIO ===
type AssetType =
  | 'liquid'        // conti correnti, contanti
  | 'deposit'       // conti deposito, certificati
  | 'bonds'         // obbligazioni, BTP
  | 'etf_stocks'    // ETF, azioni, fondi
  | 'pension'       // fondi pensione
  | 'real_estate'   // immobili
  | 'other';

type PatrimonyType = 'reserve' | 'productive' | 'parked';

type Asset = {
  id: string;
  space_id: string;
  name: string;
  type: AssetType;
  patrimony_type: PatrimonyType;
  current_value: number;          // se quote_symbol presente: calcolato runtime = quantity * last_quote
  expected_return_pct?: number;   // % annuo atteso o storico
  monthly_contribution?: number;  // €/mese se PAC o accumulo automatico
  maturity_date?: string;         // ISO date, per CD/obbligazioni
  note?: string;
  // Quotazione automatica (opzionale)
  quote_symbol?: string;          // es. "SWDA.MI", "VWCE.DE", "bitcoin"
  quote_source?: 'yahoo' | 'coingecko' | 'ecb' | 'manual';
  quantity?: number;              // quote/azioni/unità possedute
  last_quote?: number;            // ultimo prezzo unitario fetchato
  last_quote_at?: string;         // ISO timestamp ultimo fetch riuscito
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

// === IMPOSTAZIONI (per spazio) ===
type SpaceSettings = {
  space_id: string;              // PK
  deepseek_api_key?: string;     // v2, salvata locale, mai trasmessa altrove
  ai_advisor_enabled: boolean;   // toggle generale
}

// === IMPOSTAZIONI APP (globali) ===
type AppSettings = {
  id: 'singleton';
  active_space_id: string;
  theme: 'light' | 'dark' | 'auto';
  onboarding_completed: boolean;
}
```

### 4.3 Indici Dexie

```typescript
db.version(1).stores({
  spaces: 'id, archived_at',
  floor_items: 'id, space_id, necessity_level, active, frequency, [space_id+active]',
  income_items: 'id, space_id, active, [space_id+active]',
  assets: 'id, space_id, type, patrimony_type, [space_id+patrimony_type]',
  space_settings: 'space_id',
  app_settings: 'id',
});
```

### 4.4 Relazioni

```
Space (1) ─┬─ (N) FloorItem
           ├─ (N) IncomeItem
           ├─ (N) Asset
           └─ (1) SpaceSettings
```

---

## 5. Insight automatici (Livello 0 advisor)

Sezione critica. Tutti gli insight sono **calcolati runtime** dalla dashboard, senza store separato. Aggiornati ogni volta che cambiano i dati.

### 5.1 Calcoli base normalizzati a mese

```typescript
function toMonthly(amount: number, frequency: Frequency): number {
  switch(frequency) {
    case 'monthly':    return amount;
    case 'bimonthly':  return amount / 2;
    case 'quarterly':  return amount / 3;
    case 'semiannual': return amount / 6;
    case 'annual':     return amount / 12;
  }
}
```

### 5.2 Floor mensile per livello

```typescript
function floorByLevel(items: FloorItem[]) {
  const active = items.filter(i => i.active && !i.archived_at);
  return {
    essential: active.filter(i => i.necessity_level === 'essential')
                     .reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0),
    baseline:  active.filter(i => i.necessity_level === 'baseline')
                     .reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0),
    lifestyle: active.filter(i => i.necessity_level === 'lifestyle')
                     .reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0),
  };
}
// Floor totale = essential + baseline + lifestyle
```

### 5.3 Triangolo dell'accumulo

```typescript
function accumulationCapacity(income: number, floor: { essential, baseline, lifestyle }) {
  return {
    real:       income - (floor.essential + floor.baseline + floor.lifestyle),
    compressed: income - (floor.essential + floor.baseline),
    extreme:    income - floor.essential,
  };
}
```

L'utente vede 3 numeri:
- **Reale**: il margine vero nel tuo stile di vita scelto.
- **Compresso**: quanto puoi tirare fuori comprimendo il lifestyle (riducibile rapidamente).
- **Estremo**: quanto puoi tirare fuori in emergenza comprimendo lifestyle E baseline.

Lo scarto tra "reale" ed "estremo" è il tuo **cuscinetto strategico**.

### 5.4 Health check del floor

```typescript
function floorHealth(income: number, floorTotal: number) {
  const ratio = floorTotal / income;
  if (ratio < 0.5)  return { level: 'healthy',  label: 'Sano',    color: 'emerald' };
  if (ratio < 0.7)  return { level: 'tense',    label: 'Teso',    color: 'amber' };
  if (ratio < 0.85) return { level: 'fragile',  label: 'Fragile', color: 'orange' };
  return                  { level: 'critical', label: 'Critico', color: 'rose' };
}
```

### 5.5 Insight patrimonio

**Concentrazione**: se un singolo asset > 70% del patrimonio totale → warning.

**Composizione strategica**:
```typescript
function patrimonyBreakdown(assets: Asset[]) {
  const total = assets.reduce((s, a) => s + a.current_value, 0);
  return {
    reserve:    sum(assets, 'reserve') / total,
    productive: sum(assets, 'productive') / total,
    parked:     sum(assets, 'parked') / total,
    total,
  };
}
```

**Reserve adequacy**: rapporto reserve totale / floor.essential mensile.
- < 1 mese: critical
- 1-3 mesi: insufficient
- 3-6 mesi: healthy
- 6-12 mesi: comfortable
- > 12 mesi: over-reserved (suggerimento: parte può migrare a productive)

**Parked alert**: se parked > 30% del patrimonio totale, segnalazione "Hai X€ fermi senza piano. Vuoi rivederli?"

### 5.6 Distanza dal patrimonio annuale

```typescript
function yearsToAnnualFloor(realAccumulation: number, annualFloor: number) {
  if (realAccumulation <= 0) return null; // non sta accumulando
  return annualFloor / (realAccumulation * 12);
}
```

"Al ritmo attuale, in X anni accumuli l'equivalente di 1 anno di vita."

### 5.7 Spese annuali in arrivo

Lista delle voci con `frequency: 'annual'` (e raggruppamento per altre frequenze ad alto impatto come semiannual). Visualizzazione a calendario semestrale. Aiuta a prevedere mesi pesanti.

### 5.8 Anomalia baseline > essential

Se `baseline > essential`, mostra observation neutra:
> "Il tuo baseline è superiore al tuo essential. Lo stile di vita stabile costa più della pura sopravvivenza — non è un giudizio, è un dato. In emergenza, il margine maggiore lo trovi rivedendo il baseline."

### 5.9 Anomalia reale negativo

Se `accumulationCapacity.real < 0` → warning forte. "Stai vivendo in deficit strutturale. Il tuo Floor supera le tue entrate stabili."

---

## 5bis. Quotazioni asset e catalogo strumenti

### 5bis.1 Filosofia

Per asset standard quotati (ETF, azioni, crypto, indici), l'app può fetchare il valore corrente da API pubbliche. Per asset non quotabili (immobili, fondi pensione strani, conti deposito), l'utente aggiorna manualmente.

Il pattern è **ibrido**: ogni asset può scegliere se essere quotato in automatico o manuale. L'utente vede sempre il valore corrente in EUR, indipendentemente da come è stato ottenuto.

### 5bis.2 Fonti dati

| Fonte | Cosa | Endpoint | Auth |
|---|---|---|---|
| Yahoo Finance | ETF, azioni, indici, valute | `query1.finance.yahoo.com/v8/finance/chart/SYMBOL` | No |
| CoinGecko | Crypto | `api.coingecko.com/api/v3/simple/price` | No (gratis) |
| ECB | Cambi valuta ufficiali | `data-api.ecb.europa.eu/...` | No |

### 5bis.3 Catalogo strumenti curato

File statico `data/instruments.json` nel repo. Lista curata di strumenti popolari per famiglie italiane (ETF, indici, crypto principali). Ogni voce:

```json
{
  "name": "iShares Core MSCI World UCITS ETF",
  "common_names": ["MSCI World", "World ETF", "iShares World"],
  "symbol": "SWDA.MI",
  "source": "yahoo",
  "currency": "EUR",
  "type": "etf_stocks",
  "education": {
    "what": "ETF che replica l'indice MSCI World, ~1500 aziende grandi globali sviluppate",
    "best_for": "Investimento di lungo periodo (10+ anni), diversificato",
    "risk_level": "medium",
    "cycle_sensitivity": "follows_global_cycle",
    "recommended_allocation": "core_position"
  }
}
```

Quando l'utente aggiunge un asset, vede dropdown con autocomplete sui nomi comuni. Se non trova quello che cerca, può inserire ticker custom (fallback libero).

### 5bis.4 Strategia di refresh

- **All'avvio app**: per tutti gli asset con `quote_symbol`, fetch in background. Indicator discreto di refresh accanto al valore.
- **Cache 1 ora** in IndexedDB. Riapertura app entro un'ora = usa cache.
- **Errore fetch**: mostra ultimo valore noto + età ("aggiornato 3 giorni fa") + tentativo silenzioso al prossimo avvio.
- **Asset manuali**: nessun fetch. Se `updated_at` è più vecchio di 90 giorni, banner "Valore da rivedere" sulla dashboard.

### 5bis.5 Fallback serverless (eccezione al pattern statico)

Una singola funzione serverless Vercel `/api/quote?symbol=X&source=Y` agisce da proxy per i casi in cui il fetch client-side fallisce per CORS. Tutto il resto resta statico.

---

## 5ter. Ciclo economico (v2.5)

### 5ter.1 Determinazione fase

La fase corrente del ciclo viene determinata dietro le quinte da 4 proxy quantitativi:

| Indicatore | Fonte | Frequenza | Auth |
|---|---|---|---|
| Yield curve USA (10Y - 2Y) | FRED API (Federal Reserve St. Louis) | Mensile | No (API key gratuita) |
| Tasso di interesse BCE | ECB Statistical Data Warehouse | Su variazione | No |
| Inflazione Eurozona (HICP) | Eurostat API | Mensile | No |
| PMI Eurozona o Italia | Da consolidare (fonte gratuita) | Mensile | TBD |

**Mapping fase:**

```typescript
function determineCyclePhase({ yield_curve, ecb_rate, inflation, pmi }): CyclePhase {
  // Logica deterministica semplificata, raffinabile nel tempo.
  if (yield_curve < 0 && pmi < 50) return 'late';
  if (yield_curve < 0 && pmi >= 50) return 'mid';
  if (yield_curve > 1 && pmi < 50) return 'recession';
  if (yield_curve > 1 && pmi >= 50) return 'early';
  return 'mid'; // fallback
}
```

La logica è **migliorabile nel tempo** senza toccare UI. UI dice solo "Siamo in: X".

### 5ter.2 File catalogo

`data/cycle_phases.json`:

```json
{
  "phases": {
    "early": {
      "label": "Early Cycle — Ripresa",
      "description": "Dopo una contrazione, l'economia riparte: tassi bassi, fiducia in crescita.",
      "favored_sectors": ["finanziari", "consumi_discrezionali", "tecnologia", "immobiliare"],
      "unfavored_sectors": ["utilities", "telecomunicazioni", "beni_essenziali"]
    },
    "mid": {
      "label": "Mid Cycle — Espansione",
      "description": "Economia in piena espansione, utili aziendali in crescita.",
      "favored_sectors": ["tecnologia", "industriali", "materiali", "energia"],
      "unfavored_sectors": ["difensivi_puri"]
    },
    "late": {
      "label": "Late Cycle — Fine espansione",
      "description": "Crescita rallenta, inflazione e tassi elevati, mercato selettivo.",
      "favored_sectors": ["energia", "materiali", "sanita", "beni_essenziali"],
      "unfavored_sectors": ["finanziari", "consumi_discrezionali"]
    },
    "recession": {
      "label": "Recession — Contrazione",
      "description": "Attività economica in calo, tassi in discesa, mercato difensivo.",
      "favored_sectors": ["beni_essenziali", "sanita", "utilities"],
      "unfavored_sectors": ["ciclici", "finanziari"]
    }
  }
}
```

`data/sectors.json`:

```json
{
  "finanziari": {
    "label": "Finanziari",
    "examples": ["banche", "assicurazioni"],
    "etf_examples": [
      { "name": "iShares STOXX Europe 600 Banks", "symbol": "EXX1.DE" }
    ]
  }
  // ...
}
```

`data/education/`: cartella markdown con articoli su ciclo economico, indicatori, settori. Linkati da piccoli "Approfondisci" opt-in nella UI.

### 5ter.3 UI Cicli

Una sola schermata. Sopra: cerchio con 4 fasi, fase corrente evidenziata. Sotto: lista settori favoriti come chip colorati. In fondo: link discreto "Cos'è il ciclo economico?" → markdown.

Nessun indicatore numerico in UI. La UI **non spiega**, fornisce.

---

## 6. Export contesto AI (Livello 1)

Pulsante in dashboard/advisor genera blocco markdown formattato, copiabile:

```markdown
# Contesto finanziario — Soldi_Lab
## Spazio: Casa Mia
## Data: 2026-05-13

## Floor (spese permanenti)
- Totale mensile normalizzato: €2.450
  - Essential: €1.680 (mutuo, utenze, alimentari, salute)
  - Baseline: €520 (abbonamenti, telefono, palestra)
  - Lifestyle: €250 (pranzi lavoro, hobby ricorrenti)

### Dettaglio voci
1. Mutuo casa — €720/mese — fixed — essential
2. Bolletta luce — €75/mese — variable — essential
[...]

## Entrate stabili
- Totale mensile: €2.800
- Stipendio: €2.400/mese
- [...]

## Capacità di accumulo
- Reale: €350/mese
- Compressa (no lifestyle): €600/mese
- Estrema (solo essential): €1.120/mese
- Cuscinetto strategico: 3.2x

## Health check floor
- Rapporto floor/entrate: 87.5%
- Stato: Critico

## Patrimonio
- Totale: €52.000
  - Reserve: €8.000 (15%) — copre 4.8 mesi di essential — HEALTHY
  - Productive: €35.000 (67%) — PAC ETF + BTP
  - Parked: €9.000 (17%) — conto deposito senza scadenza

### Dettaglio asset
[...]

## Regole operative
Soldi_Lab gestisce solo spese necessarie e stato patrimoniale.
Le spese discrezionali (caffè, cene fuori, regali) sono fuori scope
e si gestiscono sul margine "reale".

## Domanda
[L'utente scrive qui la sua domanda all'AI]
```

Pulsante "Copia negli appunti" → l'utente incolla dove vuole (Claude, ChatGPT, DeepSeek web).

---

## 7. Chat AI integrata (Livello 2, v3)

### 7.1 Setup

Pagina impostazioni → "Advisor AI" → input API key DeepSeek. Salvata in `SpaceSettings.deepseek_api_key` (IndexedDB locale, mai trasmessa a server tuoi).

### 7.2 Principio guida: "cosa NON fare"

L'AI advisor non dice cosa comprare, vendere o quando farlo. Identifica cosa l'utente **non dovrebbe fare** data la sua situazione: concentrazioni rischiose, incoerenze tra orizzonte e strumenti, mosse statisticamente sub-ottimali. Lascia all'utente la libertà di scegliere dentro lo spazio sicuro definito.

Esempi di output corretto:
- "Non concentrare oltre il 30% in un singolo asset" (osservazione su concentrazione)
- "Non investire la reserve in productive prima di averla coperta a 3 mesi"
- "In late cycle, attenzione ad aumentare l'esposizione ai ciclici sopra il 60%"
- "Un BTP a 30 anni con orizzonte di 5 anni espone a rischio duration importante"

Esempi di output da evitare:
- "Compra X"
- "Il mercato salirà"
- "Aumenta del 10% in tech"

### 7.3 System prompt

```
Sei l'advisor finanziario di Soldi_Lab, app personale per famiglie italiane.

Il tuo ruolo è identificare cosa l'utente NON dovrebbe fare data la sua situazione
(floor, patrimonio, fase del ciclo). Indichi rischi, concentrazioni sbagliate,
incoerenze tra orizzonte temporale e strumenti scelti, mosse statisticamente
sub-ottimali.

Regole:
- NON dare consigli su cosa comprare, vendere o quando
- NON fare previsioni di mercato o target di prezzo
- NON suggerire timing
- Spiega cosa evitare e perché, in linguaggio semplice
- Lascia all'utente la libertà di scegliere cosa fare nello spazio sicuro
- Le spese discrezionali (caffè, cene fuori, regali) sono fuori dal tuo scope
- Quando ti mancano dati strutturali, suggerisci di aggiornarli nell'app
- Risposte in italiano, accessibili, lunghe quanto serve
```

### 7.4 Tool calling

DeepSeek supporta tool calling nativo. L'AI ha accesso a:

| Tool | Cosa fa |
|---|---|
| `get_user_state()` | Stato completo: floor, income, patrimonio |
| `get_current_cycle()` | Fase ciclo corrente + indicatori sottostanti |
| `get_sector_performance(sector, period)` | Performance storica settore |
| `get_asset_info(symbol)` | Dettagli strumento dal catalogo |
| `simulate_what_if(change)` | Simula impatto di una modifica strutturale |

L'AI chiama autonomamente i tool che gli servono. Non gli si pre-carica tutto il contesto in input fisso.

### 7.5 Chat persistence

Conversazione persistente in IndexedDB. Tab dedicata. L'utente può cancellare cronologia in qualsiasi momento.

### 7.6 Privacy

- API key locale, mai inviata altrove.
- Chiamate dirette dal browser a DeepSeek API.
- Nessun backend EAR Lab vede i dati.

---

## 8. Multi-famiglia e sync via file

### 8.1 Spazi

Stesso pattern delle altre app dell'ecosistema. Spazio attivo, switch dal menu, isolamento totale tra spazi.

### 8.2 Backup/import

Formato JSON con schema_version. Merge per ID (last-write-wins su `updated_at`).

```typescript
type BackupFile = {
  schema_version: number;
  exported_at: string;
  exported_by_device?: string;
  app_version: string;
  spaces: Space[];
  floor_items: FloorItem[];
  income_items: IncomeItem[];
  assets: Asset[];
  space_settings: SpaceSettings[];
  // NB: app_settings NON viene esportato — è preferenza del device
}
```

Workflow merge:
- Per ogni record importato, cerca per ID nel DB locale.
- Se non esiste: inserisci.
- Se esiste e `updated_at` importato > locale: aggiorna.
- Altrimenti: ignora.

Per le entità minimaliste di Soldi_Lab il sync è banale: pochi record, conflitti rari.

---

## 9. UI/UX

### 9.1 Architettura informativa

```
/                    → Dashboard
/floor               → Lista spese permanenti
/floor/[id]          → Dettaglio voce (con edit inline)
/income              → Lista entrate stabili
/income/[id]         → Dettaglio entrata
/patrimony           → Lista asset
/patrimony/[id]      → Dettaglio asset
/cycle               → Ciclo economico (v2.5)
/advisor             → Insight + export contesto + (v3) chat AI
/settings            → Spazi, backup, tema, (v3) API key
```

### 9.2 Dashboard

Sezione 1 — Tre numeri grandi:
- **Floor mensile** (€/mese)
- **Margine reale** (€/mese, verde se positivo, rosso se negativo)
- **Patrimonio totale** (€)

Sezione 2 — Triangolo accumulo (3 numeri: reale / compresso / estremo)

Sezione 3 — Health check (3 indicatori a colori: floor health, reserve adequacy, parked alert se attivo)

Sezione 4 — Card "Spese annuali in arrivo" se ce ne sono nei prossimi 3 mesi

Sezione 5 — Pulsante grande "Chiedi all'AI" (v1: apre export contesto; v2: apre chat)

### 9.3 Pagina Floor

- Header: floor totale mensile + breakdown 3 colori (essential/baseline/lifestyle)
- Filtri: tutte | essential | baseline | lifestyle | dormienti
- Lista voci con edit inline su importo
- Tap su voce → dettaglio
- FAB "+" per aggiungere voce
- Onboarding tutorial visibile la prima volta

### 9.4 Pagina Income

- Header: entrate totali mensili
- Lista entrate
- Edit inline su importo
- FAB "+" per aggiungere

### 9.5 Pagina Patrimonio

- Header: patrimonio totale + breakdown 3 colori (reserve/productive/parked)
- Filtri: tutti | reserve | productive | parked | per tipo (liquid/deposit/etc.)
- Lista asset con valore corrente
- Tap su asset → dettaglio
- FAB "+" per aggiungere

### 9.6 Pagina Advisor (v1)

- Lista insight automatici, ciascuno con:
  - Titolo
  - Valore/indicatore
  - Spiegazione neutra
  - Eventuale call-to-action ("Rivedi il tuo parked", "Aumenta la reserve")
- In fondo: pulsante "Esporta contesto per AI"
- v2: tab "Chat" con conversazione DeepSeek

### 9.7 Form aggiunta voce Floor

Step minimi:
1. Nome
2. Importo
3. Frequenza (chip selector)
4. Tipo (fixed / variable)
5. Necessity level (chip selector con tooltip esplicativi)
6. Nota (opzionale)

Tempo target: <30 secondi per voce nuova.

---

## 10. Interazioni UI obbligatorie

### 10.1 Floor Items

- Edit inline su `amount` (tap sull'importo, input, conferma)
- Edit inline su `name`
- Cambio `necessity_level` (chip)
- Cambio `frequency` (chip)
- Cambio `type` (toggle fixed/variable)
- Mettere `active: false` (= dormiente)
- Riattivare voce dormiente
- Archiviare (caso d'uso raro: voce duplicata erroneamente)
- Aggiungere nuova voce

### 10.2 Income Items

Stesso pattern di Floor (no necessity_level).

### 10.3 Assets

- Edit inline su `current_value` (frequente — aggiorni il valore degli investimenti ogni tanto)
- Edit inline su `monthly_contribution`
- Edit inline su `expected_return_pct`
- Cambio `patrimony_type` (chip)
- Cambio `type` (raro, ma possibile)
- Archiviare asset venduto/chiuso (no hard delete)

### 10.4 Spaces

- Rinomina
- Cambia icona
- Creazione nuovo spazio
- Eliminazione spazio (eccezione: hard delete con conferma forte "ELIMINA")
- Switch attivo

### 10.5 Pattern di editing

Editing inline ovunque possibile. Pagine dedicate solo per creazione nuovi record o azioni distruttive (eliminazione spazio).

### 10.6 Conferme

| Azione | Conferma |
|---|---|
| Modifica amount/value | Nessuna, immediata |
| Modifica name | Nessuna, immediata |
| Cambio necessity_level / patrimony_type | Nessuna, immediata |
| Mettere voce a dormiente | Nessuna, è reversibile |
| Archivia voce/asset | Modal semplice "Verrà nascosto, recuperabile" |
| Elimina spazio | Modal con digitazione "ELIMINA" |
| Importa backup | Preview con conteggio + conferma |

---

## 11. Onboarding

### 11.1 Primo avvio

1. Schermata welcome con tre passi:
   - "Soldi_Lab gestisce solo le spese necessarie e il tuo patrimonio. Tutto il resto è tuo da gestire."
   - "Funziona offline. I dati restano sul tuo telefono. Backup via file."
   - "Più tieni aggiornati i dati, più l'app + AI ti aiutano."
2. Creazione primo spazio (default "Casa Mia").
3. Possibilità di aggiungere subito alcune voci iniziali (mutuo, stipendio, principale asset).

### 11.2 Onboarding contestuale

- Prima volta su `/floor`: banner con la regola operativa.
- Prima volta su `/patrimony`: banner con spiegazione reserve/productive/parked.
- Prima volta su `/advisor`: spiegazione cosa sono gli insight e come usare l'export.

---

## 12. Roadmap

### v1 — MVP
- Schema completo + Dexie
- CRUD spazi, floor items, income items, assets (con campi quote opzionali, ma fetch non implementato)
- Insight automatici (sezione 5 completa)
- Export contesto AI (Livello 1)
- Backup/import JSON
- PWA installabile
- Onboarding contestuale

### v2 — Quotazioni live
- Catalogo `data/instruments.json` curato
- Fetch quotazioni client-side (Yahoo, CoinGecko, ECB)
- Cache 1h in IndexedDB
- Promemoria asset manuali non aggiornati
- Funzione serverless fallback per CORS

### v2.5 — Cicli (formazione minimal)
- Catalogo `cycle_phases.json`, `sectors.json`, `education/`
- Pagina Cicli con fase corrente + settori favoriti
- Determinazione fase con indicatori (yield curve FRED, BCE rate, Eurostat inflation, PMI)
- Articoli markdown approfondimento (opt-in)

### v3 — Chat AI integrata
- Chat DeepSeek con API key locale
- System prompt "cosa NON fare"
- Tool calling per get_user_state, get_current_cycle, ecc.
- Cronologia chat persistente

### v4 — Refinement
- Simulazioni "what if"
- Storico mensile insight (trend nel tempo)
- Tema scuro
- Esportazione PDF report

### v5 — Estensioni (futuro)
- Calendario fiscale italiano integrato (scadenze tasse)
- Tracking obiettivi finanziari
- Eventuali nuove fonti dati per ciclo (es. Conference Board, output gap)

---

## 13. Regole di disciplina di sviluppo

- **Mai array hardcoded** di tipologie/livelli nel UI. Tutto da costanti tipate condivise.
- **Edit inline come default**. Pagine dedicate solo per creazione e azioni distruttive.
- **Nessun tracking di transazioni**, mai. Se viene la tentazione, la filosofia dice di no.
- **Il discrezionale è sacro**, fuori scope per sempre. L'app non lo guarda, non lo giudica, non lo conta.
- **Tutti gli insight runtime**. Niente store di calcoli precomputati in v1.
- **UUID lato client**. Sempre.
- **`updated_at` aggiornato a ogni modifica**.
- **Sempre filtrare per `space_id`** nelle query.

---

## 14. Glossario

| Termine | Significato |
|---|---|
| Floor | Spese necessarie strutturali. Quanto ti costa stare al mondo. |
| Essential | Sopravvivenza pura nel Floor. |
| Baseline | Standard di vita stabile scelto. |
| Lifestyle | Comportamenti ricorrenti riducibili. |
| Discrezionale | Tutto ciò che è fuori dal Floor. NON gestito dall'app. |
| Vita variabile mensile | Voce speciale di Floor per stima spesa quotidiana. |
| Reserve | Patrimonio per emergenze, liquido. |
| Productive | Patrimonio che lavora e rende. |
| Parked | Patrimonio fermo senza piano. |
| Triangolo accumulo | I tre margini: reale / compresso / estremo. |
| Cuscinetto strategico | Scarto tra margine reale ed estremo. |
| Floor health | Rapporto floor/entrate normalizzato. |
| Reserve adequacy | Mesi di essential coperti dalla reserve. |
| Insight | Lettura automatica calcolata runtime sui dati. |
| Spazio | Contenitore famiglia. Es. "Casa Nonni". |
| Advisor | Modulo AI dell'app (Livello 0, 1, 2). |
| Ciclo economico | Fase corrente del ciclo (early/mid/late/recession). |
| Quote symbol | Ticker per fetch automatico valore asset. |
| Catalogo strumenti | data/instruments.json — lista curata di asset suggeriti. |
| "Cosa non fare" | Principio guida dell'advisor AI: indica rischi, non comandi. |

---

*Documento di specifica per Soldi_Lab. Riferimento canonico per lo sviluppo.*
*Versione filosofica: l'app gestisce il necessario, l'utente gestisce il discrezionale, l'AI ragiona sull'intersezione.*
