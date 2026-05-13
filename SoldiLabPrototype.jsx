import React, { useState, useMemo } from 'react';
import {
  Home, Wallet, TrendingUp, Sparkles, Settings,
  ArrowLeft, Plus, ChevronDown, ChevronRight, Check,
  Edit3, X, Info, AlertCircle, Copy, Download,
  Archive, RotateCcw, Shield, Zap, Anchor,
  Heart, Building, Coffee, MoreVertical, Search,
  Activity, BookOpen, Banknote, ExternalLink
} from 'lucide-react';

// Link all'app madre dell'ecosistema EAR Lab Famiglia
const PARENT_APP_URL = 'https://la-famiglia-alpha.vercel.app';

// ============= COSTANTI =============

const NECESSITY_META = {
  essential: {
    label: 'Essenziale',
    short: 'ESS',
    hint: 'Se la togli, la vita salta',
    color: 'rose',
    bg: 'bg-rose-50',
    bgDark: 'bg-rose-500',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: Heart,
  },
  baseline: {
    label: 'Standard',
    short: 'STD',
    hint: 'Stile di vita stabile scelto',
    color: 'indigo',
    bg: 'bg-indigo-50',
    bgDark: 'bg-indigo-500',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Anchor,
  },
  lifestyle: {
    label: 'Lifestyle',
    short: 'LIFE',
    hint: 'Comportamenti ricorrenti riducibili',
    color: 'amber',
    bg: 'bg-amber-50',
    bgDark: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Coffee,
  },
};

const PATRIMONY_META = {
  reserve: {
    label: 'Reserve',
    hint: 'Liquidità per emergenze',
    color: 'sky',
    bg: 'bg-sky-50',
    bgDark: 'bg-sky-500',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: Shield,
  },
  productive: {
    label: 'Productive',
    hint: 'Capitale che lavora',
    color: 'emerald',
    bg: 'bg-emerald-50',
    bgDark: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: Zap,
  },
  parked: {
    label: 'Parked',
    hint: 'Patrimonio fermo senza piano',
    color: 'stone',
    bg: 'bg-stone-100',
    bgDark: 'bg-stone-500',
    text: 'text-stone-700',
    border: 'border-stone-300',
    icon: Anchor,
  },
};

const FREQUENCY_META = {
  monthly:    { label: 'Mensile',    short: '/mese', divisor: 1 },
  bimonthly:  { label: 'Bimestrale', short: '/2mesi', divisor: 2 },
  quarterly:  { label: 'Trimestrale', short: '/3mesi', divisor: 3 },
  semiannual: { label: 'Semestrale', short: '/6mesi', divisor: 6 },
  annual:     { label: 'Annuale',    short: '/anno', divisor: 12 },
};

const ASSET_TYPE_META = {
  liquid:      { label: 'Liquido' },
  deposit:     { label: 'Deposito' },
  bonds:       { label: 'Obbligazioni' },
  etf_stocks:  { label: 'ETF/Azioni' },
  pension:     { label: 'Pensione' },
  real_estate: { label: 'Immobile' },
  other:       { label: 'Altro' },
};

// === CICLO ECONOMICO (placeholder statico v2.5) ===
const CYCLE_PHASES = {
  early: {
    label: 'Early Cycle',
    sublabel: 'Ripresa',
    short: 'Dopo una contrazione, l\'economia riparte: tassi bassi, fiducia in crescita.',
    favored: ['Finanziari', 'Consumi discrezionali', 'Tecnologia', 'Immobiliare'],
    color: 'emerald',
  },
  mid: {
    label: 'Mid Cycle',
    sublabel: 'Espansione',
    short: 'Economia in piena espansione, utili aziendali in crescita.',
    favored: ['Tecnologia', 'Industriali', 'Materiali', 'Energia'],
    color: 'sky',
  },
  late: {
    label: 'Late Cycle',
    sublabel: 'Fine espansione',
    short: 'Crescita rallenta, inflazione e tassi elevati, mercato selettivo.',
    favored: ['Energia', 'Materiali', 'Sanità', 'Beni essenziali'],
    color: 'amber',
  },
  recession: {
    label: 'Recession',
    sublabel: 'Contrazione',
    short: 'Attività economica in calo, tassi in discesa, mercato difensivo.',
    favored: ['Beni essenziali', 'Sanità', 'Utilities'],
    color: 'rose',
  },
};

// Placeholder: fase corrente impostata staticamente. In produzione viene calcolata.
const CURRENT_CYCLE_PHASE = 'late';

// ============= DATI FINTI =============

const initialSpaces = [
  { id: 'sp1', name: 'Casa Mia', icon: '🏠' },
  { id: 'sp2', name: 'Casa Genitori', icon: '👨‍👩‍👧' },
  { id: 'sp3', name: 'Casa Nonni', icon: '👴' },
];

const initialFloor = [
  // ESSENTIAL
  { id: 'f1', name: 'Rata mutuo', amount: 720, frequency: 'monthly', type: 'fixed', necessity_level: 'essential', active: true, is_variable_life: false },
  { id: 'f2', name: 'Spese condominiali', amount: 85, frequency: 'monthly', type: 'fixed', necessity_level: 'essential', active: true, is_variable_life: false },
  { id: 'f3', name: 'Bolletta luce', amount: 75, frequency: 'monthly', type: 'variable', necessity_level: 'essential', active: true, is_variable_life: false },
  { id: 'f4', name: 'Bolletta gas', amount: 90, frequency: 'bimonthly', type: 'variable', necessity_level: 'essential', active: true, is_variable_life: false },
  { id: 'f5', name: 'Internet', amount: 30, frequency: 'monthly', type: 'fixed', necessity_level: 'essential', active: true, is_variable_life: false },
  { id: 'f6', name: 'Telefoni cellulari', amount: 24, frequency: 'monthly', type: 'fixed', necessity_level: 'essential', active: true, is_variable_life: false },
  { id: 'f7', name: 'TARI', amount: 300, frequency: 'annual', type: 'fixed', necessity_level: 'essential', active: true, is_variable_life: false },
  { id: 'f8', name: 'Vita variabile mensile', amount: 550, frequency: 'monthly', type: 'variable', necessity_level: 'essential', active: true, is_variable_life: true, note: 'Spesa alimentare, benzina, piccole spese ricorrenti' },

  // BASELINE
  { id: 'f9', name: 'Palestra', amount: 45, frequency: 'monthly', type: 'fixed', necessity_level: 'baseline', active: true, is_variable_life: false },
  { id: 'f10', name: 'Netflix', amount: 13, frequency: 'monthly', type: 'fixed', necessity_level: 'baseline', active: true, is_variable_life: false },
  { id: 'f11', name: 'Spotify Family', amount: 17, frequency: 'monthly', type: 'fixed', necessity_level: 'baseline', active: true, is_variable_life: false },
  { id: 'f12', name: 'Assicurazione auto', amount: 600, frequency: 'annual', type: 'fixed', necessity_level: 'baseline', active: true, is_variable_life: false },
  { id: 'f13', name: 'Bollo auto', amount: 220, frequency: 'annual', type: 'fixed', necessity_level: 'baseline', active: true, is_variable_life: false },
  { id: 'f14', name: 'Polizza casa', amount: 280, frequency: 'annual', type: 'fixed', necessity_level: 'baseline', active: true, is_variable_life: false },

  // LIFESTYLE
  { id: 'f15', name: 'Pranzi al lavoro (qualità)', amount: 140, frequency: 'monthly', type: 'variable', necessity_level: 'lifestyle', active: true, is_variable_life: false, note: 'Pranzo medio sopra la media' },
  { id: 'f16', name: 'Aperitivo settimanale', amount: 80, frequency: 'monthly', type: 'variable', necessity_level: 'lifestyle', active: true, is_variable_life: false },

  // DORMIENTE
  { id: 'f17', name: 'DAZN', amount: 30, frequency: 'monthly', type: 'fixed', necessity_level: 'baseline', active: false, is_variable_life: false },
];

const initialIncome = [
  { id: 'i1', name: 'Stipendio', amount: 2400, frequency: 'monthly', active: true },
  { id: 'i2', name: 'Tredicesima', amount: 2100, frequency: 'annual', active: true },
];

const initialAssets = [
  // RESERVE
  { id: 'a1', name: 'Conto corrente Intesa', type: 'liquid', patrimony_type: 'reserve', current_value: 4500 },
  { id: 'a2', name: 'Conto deposito Illimity', type: 'deposit', patrimony_type: 'reserve', current_value: 8000, expected_return_pct: 3.5, maturity_date: '2027-03-15' },

  // PRODUCTIVE
  { id: 'a3', name: 'PAC ETF MSCI World', type: 'etf_stocks', patrimony_type: 'productive', current_value: 18500, expected_return_pct: 7.0, monthly_contribution: 300 },
  { id: 'a4', name: 'BTP 2032', type: 'bonds', patrimony_type: 'productive', current_value: 12000, expected_return_pct: 4.2 },
  { id: 'a5', name: 'Fondo pensione', type: 'pension', patrimony_type: 'productive', current_value: 7200, monthly_contribution: 80 },

  // PARKED
  { id: 'a6', name: 'Vecchio conto deposito', type: 'deposit', patrimony_type: 'parked', current_value: 5500, expected_return_pct: 1.0 },
  { id: 'a7', name: 'Liquidità in eccesso', type: 'liquid', patrimony_type: 'parked', current_value: 3000 },
];

// ============= HELPERS =============

const formatEUR = (n) => new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(n);

const formatEURPrecise = (n) => new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR'
}).format(n);

const toMonthly = (amount, frequency) => amount / FREQUENCY_META[frequency].divisor;

// ============= CALCOLI INSIGHT =============

function computeInsights(floor, income, assets) {
  const activeFloor = floor.filter(f => f.active);
  const activeIncome = income.filter(i => i.active);

  // Floor per livello
  const floorByLevel = {
    essential: activeFloor.filter(f => f.necessity_level === 'essential')
                          .reduce((s, f) => s + toMonthly(f.amount, f.frequency), 0),
    baseline:  activeFloor.filter(f => f.necessity_level === 'baseline')
                          .reduce((s, f) => s + toMonthly(f.amount, f.frequency), 0),
    lifestyle: activeFloor.filter(f => f.necessity_level === 'lifestyle')
                          .reduce((s, f) => s + toMonthly(f.amount, f.frequency), 0),
  };
  const floorTotal = floorByLevel.essential + floorByLevel.baseline + floorByLevel.lifestyle;

  // Entrate normalizzate mensili
  const incomeMonthly = activeIncome.reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0);

  // Triangolo accumulo
  const accumulation = {
    real:       incomeMonthly - floorTotal,
    compressed: incomeMonthly - (floorByLevel.essential + floorByLevel.baseline),
    extreme:    incomeMonthly - floorByLevel.essential,
  };

  // Floor health
  const floorRatio = incomeMonthly > 0 ? floorTotal / incomeMonthly : 1;
  let floorHealth;
  if (floorRatio < 0.5)        floorHealth = { level: 'healthy',  label: 'Sano',    color: 'emerald' };
  else if (floorRatio < 0.7)   floorHealth = { level: 'tense',    label: 'Teso',    color: 'amber' };
  else if (floorRatio < 0.85)  floorHealth = { level: 'fragile',  label: 'Fragile', color: 'orange' };
  else                          floorHealth = { level: 'critical', label: 'Critico', color: 'rose' };
  floorHealth.ratio = floorRatio;

  // Patrimonio
  const patrimonyByType = {
    reserve:    assets.filter(a => a.patrimony_type === 'reserve').reduce((s, a) => s + a.current_value, 0),
    productive: assets.filter(a => a.patrimony_type === 'productive').reduce((s, a) => s + a.current_value, 0),
    parked:     assets.filter(a => a.patrimony_type === 'parked').reduce((s, a) => s + a.current_value, 0),
  };
  const patrimonyTotal = patrimonyByType.reserve + patrimonyByType.productive + patrimonyByType.parked;

  // Reserve adequacy
  const reserveMonths = floorByLevel.essential > 0 ? patrimonyByType.reserve / floorByLevel.essential : 0;
  let reserveStatus;
  if (reserveMonths < 1)       reserveStatus = { level: 'critical',     label: 'Critica',     color: 'rose' };
  else if (reserveMonths < 3)  reserveStatus = { level: 'insufficient', label: 'Insufficiente', color: 'orange' };
  else if (reserveMonths < 6)  reserveStatus = { level: 'healthy',      label: 'Sana',        color: 'emerald' };
  else if (reserveMonths < 12) reserveStatus = { level: 'comfortable',  label: 'Comoda',      color: 'sky' };
  else                          reserveStatus = { level: 'over',         label: 'In eccesso',  color: 'amber' };
  reserveStatus.months = reserveMonths;

  // Parked alert
  const parkedRatio = patrimonyTotal > 0 ? patrimonyByType.parked / patrimonyTotal : 0;
  const parkedAlert = parkedRatio > 0.3;

  // Concentrazione
  const maxAsset = assets.length > 0 ? Math.max(...assets.map(a => a.current_value)) : 0;
  const concentration = patrimonyTotal > 0 ? maxAsset / patrimonyTotal : 0;
  const concentrationAlert = concentration > 0.7;

  // Distanza patrimonio annuale
  const yearsToAnnualFloor = accumulation.real > 0 ? (floorTotal * 12) / (accumulation.real * 12) : null;

  // Anomalia baseline > essential
  const baselineAnomaly = floorByLevel.baseline > floorByLevel.essential;

  return {
    floorByLevel,
    floorTotal,
    incomeMonthly,
    accumulation,
    floorHealth,
    patrimonyByType,
    patrimonyTotal,
    reserveStatus,
    parkedAlert,
    parkedRatio,
    concentration,
    concentrationAlert,
    yearsToAnnualFloor,
    baselineAnomaly,
  };
}

// ============= COMPONENTI BASE =============

const PageHeader = ({ title, onBack, action }) => (
  <div className="sticky top-[52px] z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-1 -ml-1 active:bg-stone-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </div>
    {action}
  </div>
);

// Header globale sticky: logo Soldi_Lab a sinistra + link diretto all'app madre La Famiglia Alpha.
// Il logo è anche l'icona PWA quando l'app viene installata sul telefono.
const AppHeader = () => (
  <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-2 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <img
        src="./assets/logo.png"
        alt="Soldi_Lab"
        className="w-9 h-9 rounded-lg object-cover"
      />
      <div className="leading-tight">
        <div className="text-[9px] uppercase tracking-widest text-stone-400 font-medium">Polo B</div>
        <div className="text-xs font-semibold tracking-tight">Soldi_Lab</div>
      </div>
    </div>
    <a
      href={PARENT_APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 active:bg-stone-200 text-stone-700"
      title="Apri La Famiglia Alpha"
    >
      <Building className="w-3.5 h-3.5" />
      <span className="text-[11px] font-semibold">La Famiglia</span>
      <ExternalLink className="w-3 h-3 opacity-60" />
    </a>
  </div>
);

const BottomNav = ({ current, onChange }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'floor', label: 'Floor', icon: Wallet },
    { id: 'income', label: 'Entrate', icon: Banknote },
    { id: 'patrimony', label: 'Patrimonio', icon: TrendingUp },
    { id: 'cycle', label: 'Ciclo', icon: Activity },
    { id: 'advisor', label: 'Advisor', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-1 py-2 z-20">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {items.map(item => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg transition-colors flex-1 ${active ? 'text-stone-900' : 'text-stone-400'}`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SpaceSwitcher = ({ spaces, activeSpace, onChange, onClose }) => (
  <div className="fixed inset-0 bg-black/40 z-30 flex items-end" onClick={onClose}>
    <div className="bg-white w-full rounded-t-3xl p-4 pb-8 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
      <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
      <h2 className="text-lg font-semibold mb-4">Cambia spazio</h2>
      <div className="space-y-2">
        {spaces.map(s => (
          <button
            key={s.id}
            onClick={() => { onChange(s.id); onClose(); }}
            className={`w-full flex items-center justify-between p-3 rounded-xl ${s.id === activeSpace ? 'bg-stone-900 text-white' : 'bg-stone-100'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="font-medium">{s.name}</span>
            </div>
            {s.id === activeSpace && <Check className="w-5 h-5" />}
          </button>
        ))}
        <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-50 border-2 border-dashed border-stone-300 text-stone-600">
          <Plus className="w-5 h-5" />
          <span className="font-medium">Nuovo spazio</span>
        </button>
      </div>
    </div>
  </div>
);

// ============= DASHBOARD =============

const Dashboard = ({ state, onNavigate, onOpenSpaceSwitcher }) => {
  const insights = useMemo(() => computeInsights(state.floor, state.income, state.assets), [state]);
  const activeSpace = state.spaces.find(s => s.id === state.activeSpaceId);

  const pctEss = (insights.floorByLevel.essential / insights.floorTotal) * 100;
  const pctBas = (insights.floorByLevel.baseline / insights.floorTotal) * 100;
  const pctLif = (insights.floorByLevel.lifestyle / insights.floorTotal) * 100;

  const pctRes = insights.patrimonyTotal > 0 ? (insights.patrimonyByType.reserve / insights.patrimonyTotal) * 100 : 0;
  const pctPro = insights.patrimonyTotal > 0 ? (insights.patrimonyByType.productive / insights.patrimonyTotal) * 100 : 0;
  const pctPar = insights.patrimonyTotal > 0 ? (insights.patrimonyByType.parked / insights.patrimonyTotal) * 100 : 0;

  const marginPositive = insights.accumulation.real >= 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <button onClick={onOpenSpaceSwitcher} className="flex items-center gap-2 active:opacity-70">
          <span className="text-2xl">{activeSpace?.icon}</span>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Spazio</div>
            <div className="text-sm font-semibold flex items-center gap-1">
              {activeSpace?.name}
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>
        <button onClick={() => onNavigate('settings')} className="p-2 -mr-2">
          <Settings className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      {/* Tre numeri grandi */}
      <div className="px-4 py-2 space-y-4">
        <BigNumber
          label="Floor mensile"
          value={formatEUR(insights.floorTotal)}
          hint="quanto ti costa stare al mondo"
          color="stone"
        />
        <BigNumber
          label="Margine reale"
          value={formatEUR(insights.accumulation.real)}
          hint={marginPositive ? "puoi accumulare ogni mese" : "deficit strutturale"}
          color={marginPositive ? "emerald" : "rose"}
          warning={!marginPositive}
        />
        <BigNumber
          label="Patrimonio totale"
          value={formatEUR(insights.patrimonyTotal)}
          hint="tutti gli asset registrati"
          color="stone"
        />
      </div>

      {/* Floor breakdown */}
      <div className="px-4 mt-6">
        <button
          onClick={() => onNavigate('floor')}
          className="w-full bg-white rounded-2xl border border-stone-200 p-4 active:bg-stone-50 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Composizione Floor</div>
            <ChevronRight className="w-4 h-4 text-stone-300" />
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden flex mb-3">
            <div className="bg-rose-500 h-full" style={{ width: `${pctEss}%` }} />
            <div className="bg-indigo-500 h-full" style={{ width: `${pctBas}%` }} />
            <div className="bg-amber-500 h-full" style={{ width: `${pctLif}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <BreakdownCell color="bg-rose-500" label="Essenziale" value={formatEUR(insights.floorByLevel.essential)} />
            <BreakdownCell color="bg-indigo-500" label="Standard" value={formatEUR(insights.floorByLevel.baseline)} />
            <BreakdownCell color="bg-amber-500" label="Lifestyle" value={formatEUR(insights.floorByLevel.lifestyle)} />
          </div>
        </button>
      </div>

      {/* Entrate mensili */}
      <div className="px-4 mt-3">
        <button
          onClick={() => onNavigate('income')}
          className="w-full bg-white rounded-2xl border border-stone-200 p-4 active:bg-stone-50 text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Entrate mensili</div>
            <ChevronRight className="w-4 h-4 text-stone-300" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold tracking-tight tabular-nums text-emerald-700">
                {formatEUR(insights.incomeMonthly)}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">flussi stabili normalizzati al mese</div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              <Banknote className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">
                {state.income.filter(i => i.active).length} attive
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Triangolo accumulo */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">Triangolo accumulo</div>
          <div className="space-y-2.5">
            <AccumulationRow label="Reale" hint="margine vero" value={insights.accumulation.real} highlight />
            <AccumulationRow label="Compresso" hint="senza lifestyle" value={insights.accumulation.compressed} />
            <AccumulationRow label="Estremo" hint="solo essenziale" value={insights.accumulation.extreme} />
          </div>
          {insights.accumulation.extreme > insights.accumulation.real && insights.accumulation.real > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
              Cuscinetto strategico:&nbsp;
              <span className="font-semibold text-stone-700">
                {(insights.accumulation.extreme / insights.accumulation.real).toFixed(1)}x
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Patrimonio breakdown */}
      <div className="px-4 mt-3">
        <button
          onClick={() => onNavigate('patrimony')}
          className="w-full bg-white rounded-2xl border border-stone-200 p-4 active:bg-stone-50 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Composizione Patrimonio</div>
            <ChevronRight className="w-4 h-4 text-stone-300" />
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden flex mb-3">
            <div className="bg-sky-500 h-full" style={{ width: `${pctRes}%` }} />
            <div className="bg-emerald-500 h-full" style={{ width: `${pctPro}%` }} />
            <div className="bg-stone-400 h-full" style={{ width: `${pctPar}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <BreakdownCell color="bg-sky-500" label="Reserve" value={formatEUR(insights.patrimonyByType.reserve)} />
            <BreakdownCell color="bg-emerald-500" label="Productive" value={formatEUR(insights.patrimonyByType.productive)} />
            <BreakdownCell color="bg-stone-400" label="Parked" value={formatEUR(insights.patrimonyByType.parked)} />
          </div>
        </button>
      </div>

      {/* Health checks compatti */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-2">
        <HealthBadge
          label="Floor health"
          status={insights.floorHealth.label}
          color={insights.floorHealth.color}
          detail={`${(insights.floorHealth.ratio * 100).toFixed(0)}% delle entrate`}
        />
        <HealthBadge
          label="Reserve"
          status={insights.reserveStatus.label}
          color={insights.reserveStatus.color}
          detail={`${insights.reserveStatus.months.toFixed(1)} mesi`}
        />
      </div>

      {/* Card Ciclo economico */}
      <div className="px-4 mt-4">
        <button
          onClick={() => onNavigate('cycle')}
          className="w-full bg-white rounded-2xl border border-stone-200 p-4 active:bg-stone-50 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${CYCLE_PHASES[CURRENT_CYCLE_PHASE].color === 'amber' ? 'bg-amber-100' : 'bg-stone-100'} flex items-center justify-center`}>
                <Activity className={`w-5 h-5 ${CYCLE_PHASES[CURRENT_CYCLE_PHASE].color === 'amber' ? 'text-amber-700' : 'text-stone-700'}`} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Ciclo economico</div>
                <div className="text-sm font-semibold">{CYCLE_PHASES[CURRENT_CYCLE_PHASE].label} — {CYCLE_PHASES[CURRENT_CYCLE_PHASE].sublabel}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-300" />
          </div>
        </button>
      </div>

      {/* CTA Advisor */}
      <div className="px-4 mt-4">
        <button
          onClick={() => onNavigate('advisor')}
          className="w-full bg-stone-900 text-white rounded-2xl p-4 flex items-center justify-between active:bg-stone-800"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold text-sm">Chiedi all'Advisor</div>
              <div className="text-xs text-stone-300">Insight + esporta contesto AI</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const BigNumber = ({ label, value, hint, color, warning }) => (
  <div>
    <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-0.5">{label}</div>
    <div className={`text-3xl font-bold tracking-tight tabular-nums ${warning ? 'text-rose-700' : color === 'emerald' ? 'text-emerald-700' : 'text-stone-900'}`}>
      {value}
    </div>
    <div className="text-xs text-stone-500 mt-0.5">{hint}</div>
  </div>
);

const BreakdownCell = ({ color, label, value }) => (
  <div>
    <div className="flex items-center justify-center gap-1 mb-0.5">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium">{label}</span>
    </div>
    <div className="text-sm font-semibold tabular-nums">{value}</div>
  </div>
);

const AccumulationRow = ({ label, hint, value, highlight }) => {
  const positive = value >= 0;
  return (
    <div className={`flex items-center justify-between ${highlight ? 'font-semibold' : ''}`}>
      <div className="flex flex-col">
        <span className="text-sm">{label}</span>
        <span className="text-[11px] text-stone-500">{hint}</span>
      </div>
      <span className={`text-base tabular-nums ${positive ? 'text-emerald-700' : 'text-rose-700'}`}>
        {formatEUR(value)}<span className="text-xs text-stone-400 font-normal">/mese</span>
      </span>
    </div>
  );
};

const HealthBadge = ({ label, status, color, detail }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sky:     'bg-sky-50 text-sky-700 border-sky-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    orange:  'bg-orange-50 text-orange-700 border-orange-200',
    rose:    'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-3 ${colorMap[color]}`}>
      <div className="text-[10px] uppercase tracking-wider font-medium opacity-70">{label}</div>
      <div className="text-sm font-bold mt-0.5">{status}</div>
      <div className="text-[11px] mt-0.5 opacity-80">{detail}</div>
    </div>
  );
};

// ============= FLOOR PAGE =============

const FloorPage = ({ state, onNavigate, onUpdate }) => {
  const [filter, setFilter] = useState('all'); // all | essential | baseline | lifestyle | dormant
  const [showInfo, setShowInfo] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const insights = useMemo(() => computeInsights(state.floor, state.income, state.assets), [state]);

  let items = [...state.floor];
  if (filter === 'dormant') items = items.filter(i => !i.active);
  else if (filter !== 'all') items = items.filter(i => i.active && i.necessity_level === filter);
  else items = items.filter(i => i.active);

  // Ordinamento: variable_life in cima, poi per importo mensile desc
  items.sort((a, b) => {
    if (a.is_variable_life !== b.is_variable_life) return a.is_variable_life ? -1 : 1;
    return toMonthly(b.amount, b.frequency) - toMonthly(a.amount, a.frequency);
  });

  const pctEss = (insights.floorByLevel.essential / insights.floorTotal) * 100;
  const pctBas = (insights.floorByLevel.baseline / insights.floorTotal) * 100;
  const pctLif = (insights.floorByLevel.lifestyle / insights.floorTotal) * 100;

  return (
    <div className="pb-24">
      <PageHeader
        title="Floor"
        onBack={() => onNavigate('dashboard')}
        action={
          <div className="flex gap-1">
            <button onClick={() => setShowInfo(true)} className="p-2 -mr-1">
              <Info className="w-5 h-5 text-stone-500" />
            </button>
            <button className="p-2 -mr-2">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {/* Header con totale e barra */}
      <div className="px-4 py-4">
        <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-1">Floor totale mensile</div>
        <div className="text-3xl font-bold tracking-tight tabular-nums mb-3">{formatEUR(insights.floorTotal)}</div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden flex mb-2">
          <div className="bg-rose-500 h-full" style={{ width: `${pctEss}%` }} />
          <div className="bg-indigo-500 h-full" style={{ width: `${pctBas}%` }} />
          <div className="bg-amber-500 h-full" style={{ width: `${pctLif}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span><span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1" />Ess {formatEUR(insights.floorByLevel.essential)}</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1" />Std {formatEUR(insights.floorByLevel.baseline)}</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />Life {formatEUR(insights.floorByLevel.lifestyle)}</span>
        </div>
      </div>

      {/* Filtri */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto sticky top-[104px] bg-stone-50 z-[5] py-2">
        {[
          { id: 'all', label: 'Tutte' },
          { id: 'essential', label: 'Essenziale' },
          { id: 'baseline', label: 'Standard' },
          { id: 'lifestyle', label: 'Lifestyle' },
          { id: 'dormant', label: 'Dormienti' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === f.id ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista voci */}
      <div className="px-4 pt-2 space-y-2">
        {items.map(item => (
          <FloorItemCard
            key={item.id}
            item={item}
            onEdit={() => setEditingItem(item)}
            onQuickAmountChange={(newAmount) => onUpdate('floor', item.id, { amount: newAmount })}
          />
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <Wallet className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <div className="text-sm">Nessuna voce in questa categoria</div>
          </div>
        )}
      </div>

      {/* Modal info / regola operativa */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end" onClick={() => setShowInfo(false)}>
          <div className="bg-white w-full rounded-t-3xl p-4 pb-8 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-3">La regola del Floor</h2>
            <p className="text-sm text-stone-700 leading-relaxed mb-4">
              Una spesa entra nel Floor se <strong>ricorre con regolarità prevedibile</strong> e se la sua interruzione cambierebbe in modo strutturale la tua vita o richiederebbe una decisione consapevole.
            </p>
            <p className="text-sm text-stone-700 leading-relaxed mb-4">
              Tutto il resto — caffè, cene fuori, regali improvvisati, viaggi extra — <strong>sta fuori</strong>. Quelle spese le gestisci tu sul margine che ti resta.
            </p>
            <div className="space-y-2.5 mb-4">
              <NecessityExplain level="essential" />
              <NecessityExplain level="baseline" />
              <NecessityExplain level="lifestyle" />
            </div>
            <button onClick={() => setShowInfo(false)} className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-medium">
              Ho capito
            </button>
          </div>
        </div>
      )}

      {/* Modal edit voce */}
      {editingItem && (
        <FloorItemEditor
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updates) => {
            onUpdate('floor', editingItem.id, updates);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

const NecessityExplain = ({ level }) => {
  const meta = NECESSITY_META[level];
  const Icon = meta.icon;
  return (
    <div className={`flex gap-3 p-3 rounded-xl ${meta.bg}`}>
      <Icon className={`w-5 h-5 ${meta.text} flex-shrink-0`} />
      <div>
        <div className={`text-sm font-semibold ${meta.text}`}>{meta.label}</div>
        <div className={`text-xs ${meta.text} opacity-90`}>{meta.hint}</div>
      </div>
    </div>
  );
};

const FloorItemCard = ({ item, onEdit, onQuickAmountChange }) => {
  const meta = NECESSITY_META[item.necessity_level];
  const monthly = toMonthly(item.amount, item.frequency);
  const isAnnual = item.frequency !== 'monthly';
  const [editingAmount, setEditingAmount] = useState(false);
  const [tempAmount, setTempAmount] = useState(item.amount.toString());

  const handleSaveAmount = () => {
    const n = parseFloat(tempAmount);
    if (!isNaN(n) && n >= 0) {
      onQuickAmountChange(n);
    }
    setEditingAmount(false);
  };

  return (
    <div className={`bg-white rounded-2xl border p-3 ${item.active ? 'border-stone-200' : 'border-stone-200 opacity-60'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${meta.bg} ${meta.text}`}>
              {meta.short}
            </span>
            {!item.active && (
              <span className="text-[9px] uppercase tracking-wider text-stone-400 font-medium">Dormiente</span>
            )}
            {item.is_variable_life && (
              <span className="text-[9px] uppercase tracking-wider text-stone-500 font-medium bg-stone-100 px-1.5 py-0.5 rounded">
                Vita variabile
              </span>
            )}
          </div>
          <div className="text-sm font-semibold">{item.name}</div>
          {item.note && (
            <div className="text-[11px] text-stone-500 mt-0.5">{item.note}</div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          {editingAmount ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={tempAmount}
                onChange={e => setTempAmount(e.target.value)}
                onBlur={handleSaveAmount}
                onKeyDown={e => e.key === 'Enter' && handleSaveAmount()}
                className="w-20 px-2 py-1 border border-stone-300 rounded-lg text-right text-sm font-semibold outline-none focus:border-stone-900"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => { setTempAmount(item.amount.toString()); setEditingAmount(true); }}
              className="text-right active:opacity-50"
            >
              <div className="text-base font-bold tabular-nums">{formatEUR(item.amount)}</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                {FREQUENCY_META[item.frequency].short}
              </div>
            </button>
          )}
          {isAnnual && (
            <div className="text-[10px] text-stone-500 tabular-nums mt-0.5">
              ≈ {formatEUR(monthly)}/mese
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-2 text-[11px] text-stone-500">
          <span>{FREQUENCY_META[item.frequency].label}</span>
          <span>·</span>
          <span>{item.type === 'fixed' ? 'Fissa' : 'Variabile'}</span>
        </div>
        <button onClick={onEdit} className="text-[11px] text-stone-600 font-medium px-2 py-0.5 active:bg-stone-100 rounded flex items-center gap-1">
          <Edit3 className="w-3 h-3" />
          Modifica
        </button>
      </div>
    </div>
  );
};

const FloorItemEditor = ({ item, onClose, onSave }) => {
  const [name, setName] = useState(item.name);
  const [necessity, setNecessity] = useState(item.necessity_level);
  const [frequency, setFrequency] = useState(item.frequency);
  const [type, setType] = useState(item.type);
  const [active, setActive] = useState(item.active);

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-4 pb-8 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-4">Modifica voce</h2>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-1">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-100 rounded-xl text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-2">Livello</label>
            <div className="grid grid-cols-3 gap-2">
              {(['essential', 'baseline', 'lifestyle']).map(l => {
                const meta = NECESSITY_META[l];
                return (
                  <button
                    key={l}
                    onClick={() => setNecessity(l)}
                    className={`p-2 rounded-xl text-xs font-medium border ${necessity === l ? `${meta.bg} ${meta.text} ${meta.border}` : 'bg-stone-50 text-stone-600 border-stone-200'}`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-stone-500 mt-1.5">{NECESSITY_META[necessity].hint}</div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-2">Frequenza</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(FREQUENCY_META).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFrequency(k)}
                  className={`p-2 rounded-xl text-xs font-medium ${frequency === k ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setType('fixed')}
                className={`p-2 rounded-xl text-xs font-medium ${type === 'fixed' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
              >
                Fissa
              </button>
              <button
                onClick={() => setType('variable')}
                className={`p-2 rounded-xl text-xs font-medium ${type === 'variable' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
              >
                Variabile
              </button>
            </div>
          </div>

          <button
            onClick={() => setActive(!active)}
            className="w-full p-3 rounded-xl border border-stone-200 flex items-center justify-between"
          >
            <span className="text-sm font-medium">{active ? 'Voce attiva' : 'Voce dormiente'}</span>
            <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${active ? 'bg-emerald-500' : 'bg-stone-300'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${active ? 'translate-x-4' : ''}`} />
            </div>
          </button>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium">
            Annulla
          </button>
          <button
            onClick={() => onSave({ name, necessity_level: necessity, frequency, type, active })}
            className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= INCOME PAGE =============

const IncomePage = ({ state, onNavigate, onUpdate }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const insights = useMemo(() => computeInsights(state.floor, state.income, state.assets), [state]);

  const activeItems = [...state.income].filter(i => i.active)
    .sort((a, b) => toMonthly(b.amount, b.frequency) - toMonthly(a.amount, a.frequency));
  const dormantItems = state.income.filter(i => !i.active);

  return (
    <div className="pb-24">
      <PageHeader
        title="Entrate"
        onBack={() => onNavigate('dashboard')}
        action={
          <div className="flex gap-1">
            <button onClick={() => setShowInfo(true)} className="p-2 -mr-1">
              <Info className="w-5 h-5 text-stone-500" />
            </button>
            <button className="p-2 -mr-2">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {/* Header con totale */}
      <div className="px-4 py-4">
        <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-1">Entrate totali mensili</div>
        <div className="text-3xl font-bold tracking-tight tabular-nums text-emerald-700">{formatEUR(insights.incomeMonthly)}</div>
        <div className="text-xs text-stone-500 mt-0.5">flussi stabili normalizzati al mese</div>
      </div>

      {/* Lista entrate attive */}
      <div className="px-4 pt-2 space-y-2">
        {activeItems.map(item => (
          <IncomeItemCard
            key={item.id}
            item={item}
            onEdit={() => setEditingItem(item)}
            onQuickAmountChange={(newAmount) => onUpdate('income', item.id, { amount: newAmount })}
          />
        ))}

        {activeItems.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <Banknote className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <div className="text-sm">Nessuna entrata registrata</div>
            <div className="text-xs mt-1">Tap + per aggiungere stipendio, pensione o affitto attivo</div>
          </div>
        )}

        {dormantItems.length > 0 && (
          <>
            <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium pt-4 pb-1 px-1">Dormienti</div>
            {dormantItems.map(item => (
              <IncomeItemCard
                key={item.id}
                item={item}
                onEdit={() => setEditingItem(item)}
                onQuickAmountChange={(newAmount) => onUpdate('income', item.id, { amount: newAmount })}
              />
            ))}
          </>
        )}
      </div>

      {/* Modal info */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end" onClick={() => setShowInfo(false)}>
          <div className="bg-white w-full rounded-t-3xl p-4 pb-8 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-3">Cosa entra nelle Entrate</h2>
            <p className="text-sm text-stone-700 leading-relaxed mb-3">
              Solo <strong>flussi stabili e ricorrenti</strong>: stipendio, pensione, affitti attivi, consulenze regolari, rendite.
            </p>
            <p className="text-sm text-stone-700 leading-relaxed mb-4">
              <strong>Fuori scope:</strong> bonus una tantum, vendite occasionali, rimborsi. Quelli sono extra e si gestiscono sul margine.
            </p>
            <button onClick={() => setShowInfo(false)} className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-medium">
              Ho capito
            </button>
          </div>
        </div>
      )}

      {/* Modal edit voce */}
      {editingItem && (
        <IncomeItemEditor
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updates) => {
            onUpdate('income', editingItem.id, updates);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

const IncomeItemCard = ({ item, onEdit, onQuickAmountChange }) => {
  const monthly = toMonthly(item.amount, item.frequency);
  const isNotMonthly = item.frequency !== 'monthly';
  const [editingAmount, setEditingAmount] = useState(false);
  const [tempAmount, setTempAmount] = useState(item.amount.toString());

  const handleSaveAmount = () => {
    const n = parseFloat(tempAmount);
    if (!isNaN(n) && n >= 0) {
      onQuickAmountChange(n);
    }
    setEditingAmount(false);
  };

  return (
    <div className={`bg-white rounded-2xl border p-3 ${item.active ? 'border-stone-200' : 'border-stone-200 opacity-60'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
              Entrata
            </span>
            {!item.active && (
              <span className="text-[9px] uppercase tracking-wider text-stone-400 font-medium">Dormiente</span>
            )}
          </div>
          <div className="text-sm font-semibold">{item.name}</div>
          {item.note && (
            <div className="text-[11px] text-stone-500 mt-0.5">{item.note}</div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          {editingAmount ? (
            <input
              type="number"
              value={tempAmount}
              onChange={e => setTempAmount(e.target.value)}
              onBlur={handleSaveAmount}
              onKeyDown={e => e.key === 'Enter' && handleSaveAmount()}
              className="w-24 px-2 py-1 border border-stone-300 rounded-lg text-right text-sm font-semibold outline-none focus:border-stone-900"
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setTempAmount(item.amount.toString()); setEditingAmount(true); }}
              className="text-right active:opacity-50"
            >
              <div className="text-base font-bold tabular-nums">{formatEUR(item.amount)}</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                {FREQUENCY_META[item.frequency].short}
              </div>
            </button>
          )}
          {isNotMonthly && (
            <div className="text-[10px] text-stone-500 tabular-nums mt-0.5">
              ≈ {formatEUR(monthly)}/mese
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-2 text-[11px] text-stone-500">
          <span>{FREQUENCY_META[item.frequency].label}</span>
        </div>
        <button onClick={onEdit} className="text-[11px] text-stone-600 font-medium px-2 py-0.5 active:bg-stone-100 rounded flex items-center gap-1">
          <Edit3 className="w-3 h-3" />
          Modifica
        </button>
      </div>
    </div>
  );
};

const IncomeItemEditor = ({ item, onClose, onSave }) => {
  const [name, setName] = useState(item.name);
  const [amount, setAmount] = useState(item.amount.toString());
  const [frequency, setFrequency] = useState(item.frequency);
  const [active, setActive] = useState(item.active);
  const [note, setNote] = useState(item.note || '');

  const handleSave = () => {
    const n = parseFloat(amount);
    if (isNaN(n) || n < 0) return;
    onSave({ name, amount: n, frequency, active, note: note || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-4 pb-8 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-4">Modifica entrata</h2>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-1">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Stipendio, pensione, affitto attivo..."
              className="w-full px-3 py-2 bg-stone-100 rounded-xl text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-1">Importo (€)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-stone-100 rounded-xl text-sm outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-2">Frequenza</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(FREQUENCY_META).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFrequency(k)}
                  className={`p-2 rounded-xl text-xs font-medium ${frequency === k ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-1">Nota (opzionale)</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-stone-100 rounded-xl text-sm outline-none"
            />
          </div>

          <button
            onClick={() => setActive(!active)}
            className="w-full p-3 rounded-xl border border-stone-200 flex items-center justify-between"
          >
            <span className="text-sm font-medium">{active ? 'Entrata attiva' : 'Entrata dormiente'}</span>
            <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${active ? 'bg-emerald-500' : 'bg-stone-300'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${active ? 'translate-x-4' : ''}`} />
            </div>
          </button>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium">
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= PATRIMONY PAGE =============

const PatrimonyPage = ({ state, onNavigate, onUpdate }) => {
  const [filter, setFilter] = useState('all');
  const [showInfo, setShowInfo] = useState(false);
  const insights = useMemo(() => computeInsights(state.floor, state.income, state.assets), [state]);

  let assets = [...state.assets];
  if (filter !== 'all') assets = assets.filter(a => a.patrimony_type === filter);
  assets.sort((a, b) => b.current_value - a.current_value);

  const pctRes = insights.patrimonyTotal > 0 ? (insights.patrimonyByType.reserve / insights.patrimonyTotal) * 100 : 0;
  const pctPro = insights.patrimonyTotal > 0 ? (insights.patrimonyByType.productive / insights.patrimonyTotal) * 100 : 0;
  const pctPar = insights.patrimonyTotal > 0 ? (insights.patrimonyByType.parked / insights.patrimonyTotal) * 100 : 0;

  return (
    <div className="pb-24">
      <PageHeader
        title="Patrimonio"
        onBack={() => onNavigate('dashboard')}
        action={
          <div className="flex gap-1">
            <button onClick={() => setShowInfo(true)} className="p-2 -mr-1">
              <Info className="w-5 h-5 text-stone-500" />
            </button>
            <button className="p-2 -mr-2">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4">
        <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-1">Patrimonio totale</div>
        <div className="text-3xl font-bold tracking-tight tabular-nums mb-3">{formatEUR(insights.patrimonyTotal)}</div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden flex mb-2">
          <div className="bg-sky-500 h-full" style={{ width: `${pctRes}%` }} />
          <div className="bg-emerald-500 h-full" style={{ width: `${pctPro}%` }} />
          <div className="bg-stone-400 h-full" style={{ width: `${pctPar}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span><span className="inline-block w-2 h-2 rounded-full bg-sky-500 mr-1" />Res {formatEUR(insights.patrimonyByType.reserve)}</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />Pro {formatEUR(insights.patrimonyByType.productive)}</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-stone-400 mr-1" />Park {formatEUR(insights.patrimonyByType.parked)}</span>
        </div>
      </div>

      <div className="px-4 pb-2 flex gap-2 overflow-x-auto sticky top-[104px] bg-stone-50 z-[5] py-2">
        {[
          { id: 'all', label: 'Tutti' },
          { id: 'reserve', label: 'Reserve' },
          { id: 'productive', label: 'Productive' },
          { id: 'parked', label: 'Parked' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === f.id ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-2 space-y-2">
        {assets.map(asset => (
          <AssetCard key={asset.id} asset={asset} onUpdate={(updates) => onUpdate('assets', asset.id, updates)} />
        ))}
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end" onClick={() => setShowInfo(false)}>
          <div className="bg-white w-full rounded-t-3xl p-4 pb-8 max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-3">Le tre funzioni del Patrimonio</h2>
            <p className="text-sm text-stone-700 leading-relaxed mb-4">
              Ogni asset ha una <strong>funzione strategica</strong> nella tua vita, indipendente dalla sua natura tecnica.
            </p>
            <div className="space-y-2.5 mb-4">
              <PatrimonyExplain level="reserve" />
              <PatrimonyExplain level="productive" />
              <PatrimonyExplain level="parked" />
            </div>
            <button onClick={() => setShowInfo(false)} className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-medium">
              Ho capito
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PatrimonyExplain = ({ level }) => {
  const meta = PATRIMONY_META[level];
  const Icon = meta.icon;
  return (
    <div className={`flex gap-3 p-3 rounded-xl ${meta.bg}`}>
      <Icon className={`w-5 h-5 ${meta.text} flex-shrink-0`} />
      <div>
        <div className={`text-sm font-semibold ${meta.text}`}>{meta.label}</div>
        <div className={`text-xs ${meta.text} opacity-90`}>{meta.hint}</div>
      </div>
    </div>
  );
};

const AssetCard = ({ asset, onUpdate }) => {
  const meta = PATRIMONY_META[asset.patrimony_type];
  const typeLabel = ASSET_TYPE_META[asset.type].label;
  const [editingValue, setEditingValue] = useState(false);
  const [tempValue, setTempValue] = useState(asset.current_value.toString());

  const handleSave = () => {
    const n = parseFloat(tempValue);
    if (!isNaN(n) && n >= 0) onUpdate({ current_value: n });
    setEditingValue(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${meta.bg} ${meta.text}`}>
              {meta.label}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-stone-500 font-medium">{typeLabel}</span>
          </div>
          <div className="text-sm font-semibold">{asset.name}</div>
        </div>

        <div className="text-right flex-shrink-0">
          {editingValue ? (
            <input
              type="number"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-24 px-2 py-1 border border-stone-300 rounded-lg text-right text-sm font-bold outline-none focus:border-stone-900"
              autoFocus
            />
          ) : (
            <button onClick={() => { setTempValue(asset.current_value.toString()); setEditingValue(true); }} className="text-right active:opacity-50">
              <div className="text-base font-bold tabular-nums">{formatEUR(asset.current_value)}</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Valore</div>
            </button>
          )}
        </div>
      </div>

      {(asset.expected_return_pct || asset.monthly_contribution || asset.maturity_date) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
          {asset.expected_return_pct !== undefined && (
            <span>Rend: <strong className="text-stone-700">{asset.expected_return_pct}%</strong>/anno</span>
          )}
          {asset.monthly_contribution !== undefined && (
            <span>PAC: <strong className="text-stone-700">{formatEUR(asset.monthly_contribution)}</strong>/mese</span>
          )}
          {asset.maturity_date && (
            <span>Scad: <strong className="text-stone-700">{new Date(asset.maturity_date).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}</strong></span>
          )}
        </div>
      )}
    </div>
  );
};

// ============= ADVISOR PAGE =============

const AdvisorPage = ({ state, onNavigate }) => {
  const insights = useMemo(() => computeInsights(state.floor, state.income, state.assets), [state]);
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const md = generateAIContext(state, insights);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const insightCards = [];

  // Floor health
  insightCards.push({
    title: 'Health check del Floor',
    value: insights.floorHealth.label,
    color: insights.floorHealth.color,
    detail: `Il tuo floor rappresenta il ${(insights.floorHealth.ratio * 100).toFixed(0)}% delle entrate stabili.`,
    explain:
      insights.floorHealth.level === 'healthy' ? 'Hai ampio margine di manovra. Ottima base per accumulare.' :
      insights.floorHealth.level === 'tense'   ? 'Margine decente, ma poca elasticità. Ogni nuova spesa fissa va valutata bene.' :
      insights.floorHealth.level === 'fragile' ? 'Il floor è alto rispetto alle entrate. Una spesa imprevista può creare problemi.' :
                                                  'Floor critico. Il margine reale è quasi nullo, valuta riduzione baseline/lifestyle.',
  });

  // Reserve
  insightCards.push({
    title: 'Adeguatezza Reserve',
    value: insights.reserveStatus.label,
    color: insights.reserveStatus.color,
    detail: `La tua reserve copre ${insights.reserveStatus.months.toFixed(1)} mesi di spese essenziali.`,
    explain:
      insights.reserveStatus.level === 'critical'     ? 'Reserve sotto un mese: priorità assoluta rafforzarla prima di tutto il resto.' :
      insights.reserveStatus.level === 'insufficient' ? 'Reserve sotto i 3 mesi consigliati. Continua ad accumulare in liquidità prima di investire.' :
      insights.reserveStatus.level === 'healthy'      ? 'Reserve nella zona sana (3-6 mesi). Puoi destinare il margine a productive.' :
      insights.reserveStatus.level === 'comfortable'  ? 'Reserve comoda. Spostare una parte verso productive può rendere di più.' :
                                                         'Reserve molto sopra il necessario. Probabile sub-ottimalità: parte può migrare a productive.',
  });

  // Parked alert
  if (insights.parkedAlert) {
    insightCards.push({
      title: 'Patrimonio parked elevato',
      value: `${(insights.parkedRatio * 100).toFixed(0)}%`,
      color: 'amber',
      detail: `${formatEUR(insights.patrimonyByType.parked)} sono fermi senza piano chiaro.`,
      explain: 'Soldi parked non proteggono (non sono accessibili come reserve) e non producono. Valuta di riallocarli verso reserve o productive.',
    });
  }

  // Concentrazione
  if (insights.concentrationAlert) {
    insightCards.push({
      title: 'Concentrazione patrimoniale',
      value: `${(insights.concentration * 100).toFixed(0)}%`,
      color: 'orange',
      detail: 'Un singolo asset rappresenta oltre il 70% del patrimonio.',
      explain: 'Concentrazione elevata = rischio elevato. Diversificare riduce la fragilità rispetto a eventi singoli.',
    });
  }

  // Triangolo
  if (insights.accumulation.real > 0) {
    const cushion = insights.accumulation.extreme / insights.accumulation.real;
    insightCards.push({
      title: 'Cuscinetto strategico',
      value: `${cushion.toFixed(1)}x`,
      color: cushion > 3 ? 'emerald' : cushion > 2 ? 'sky' : 'amber',
      detail: `In emergenza puoi tirare fuori ${cushion.toFixed(1)} volte il tuo margine attuale.`,
      explain: 'Comprimendo lifestyle e baseline il tuo margine cresce. Sapere quanto si può comprimere è una forma di sicurezza.',
    });
  }

  // Anomalia baseline > essential
  if (insights.baselineAnomaly) {
    insightCards.push({
      title: 'Standard sopra Essenziale',
      value: 'Osservazione',
      color: 'sky',
      detail: `Standard (${formatEUR(insights.floorByLevel.baseline)}) > Essenziale (${formatEUR(insights.floorByLevel.essential)}).`,
      explain: 'Il tuo stile di vita stabile costa più della pura sopravvivenza. In emergenza, il margine maggiore lo trovi rivedendo lo standard.',
    });
  }

  // Anni al floor annuale
  if (insights.yearsToAnnualFloor) {
    insightCards.push({
      title: 'Distanza dal floor annuale',
      value: `${insights.yearsToAnnualFloor.toFixed(1)} anni`,
      color: 'stone',
      detail: `Al ritmo attuale accumuli l'equivalente di 1 anno di vita in ${insights.yearsToAnnualFloor.toFixed(1)} anni.`,
      explain: 'È una misura di indipendenza finanziaria: ogni anno di vita accumulato è un anno in cui potresti fare scelte diverse.',
    });
  }

  return (
    <div className="pb-24">
      <PageHeader title="Advisor" onBack={() => onNavigate('dashboard')} />

      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-stone-500" />
          <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Insight automatici</div>
        </div>
        <div className="text-sm text-stone-600">{insightCards.length} osservazioni dai tuoi dati attuali</div>
      </div>

      <div className="px-4 space-y-2">
        {insightCards.map((card, i) => (
          <InsightCard key={i} {...card} />
        ))}
      </div>

      <div className="px-4 mt-6">
        <div className="bg-stone-900 text-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Copy className="w-4 h-4" />
            <div className="text-sm font-semibold">Esporta contesto AI</div>
          </div>
          <div className="text-xs text-stone-300 mb-3">
            Genera un report completo da incollare in Claude, ChatGPT o DeepSeek per ricevere consigli personalizzati basati sui tuoi dati reali.
          </div>
          <button
            onClick={handleExport}
            className="w-full bg-white text-stone-900 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            {copied ? (
              <><Check className="w-4 h-4" />Copiato negli appunti</>
            ) : (
              <><Copy className="w-4 h-4" />Copia contesto</>
            )}
          </button>
        </div>

        <div className="mt-3 p-3 bg-stone-100 rounded-xl flex gap-2 items-start">
          <Sparkles className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-stone-600">
            <span className="font-semibold">Prossimamente:</span> chat AI integrata con DeepSeek API. Configura la tua API key dalle impostazioni.
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightCard = ({ title, value, color, detail, explain }) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', value: 'text-emerald-900' },
    sky:     { bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     value: 'text-sky-900' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   value: 'text-amber-900' },
    orange:  { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  value: 'text-orange-900' },
    rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    value: 'text-rose-900' },
    stone:   { bg: 'bg-stone-50',   border: 'border-stone-200',   text: 'text-stone-600',   value: 'text-stone-900' },
  };
  const c = colorMap[color];

  return (
    <div className={`rounded-2xl border ${c.bg} ${c.border} p-4`}>
      <div className="flex items-center justify-between mb-1">
        <div className={`text-[10px] uppercase tracking-widest font-semibold ${c.text}`}>{title}</div>
        <div className={`text-base font-bold ${c.value}`}>{value}</div>
      </div>
      <div className={`text-sm ${c.value} mb-1.5`}>{detail}</div>
      <div className={`text-xs ${c.text} opacity-90 leading-relaxed`}>{explain}</div>
    </div>
  );
};

function generateAIContext(state, insights) {
  const space = state.spaces.find(s => s.id === state.activeSpaceId);
  const today = new Date().toISOString().slice(0, 10);

  const floorActive = state.floor.filter(f => f.active);
  const floorByLvl = (lvl) => floorActive.filter(f => f.necessity_level === lvl);

  const lines = [];
  lines.push(`# Contesto finanziario — Soldi_Lab`);
  lines.push(`## Spazio: ${space?.name}`);
  lines.push(`## Data: ${today}`);
  lines.push(``);

  lines.push(`## Floor (spese permanenti)`);
  lines.push(`- Totale mensile normalizzato: ${formatEUR(insights.floorTotal)}`);
  lines.push(`  - Essential: ${formatEUR(insights.floorByLevel.essential)}`);
  lines.push(`  - Baseline: ${formatEUR(insights.floorByLevel.baseline)}`);
  lines.push(`  - Lifestyle: ${formatEUR(insights.floorByLevel.lifestyle)}`);
  lines.push(``);

  for (const lvl of ['essential', 'baseline', 'lifestyle']) {
    const items = floorByLvl(lvl);
    if (items.length === 0) continue;
    lines.push(`### ${NECESSITY_META[lvl].label}`);
    items.forEach(it => {
      lines.push(`- ${it.name} — ${formatEUR(it.amount)} ${FREQUENCY_META[it.frequency].short} — ${it.type} — mensile ≈ ${formatEUR(toMonthly(it.amount, it.frequency))}`);
    });
    lines.push(``);
  }

  lines.push(`## Entrate stabili`);
  lines.push(`- Totale mensile normalizzato: ${formatEUR(insights.incomeMonthly)}`);
  state.income.filter(i => i.active).forEach(i => {
    lines.push(`- ${i.name} — ${formatEUR(i.amount)} ${FREQUENCY_META[i.frequency].short}`);
  });
  lines.push(``);

  lines.push(`## Capacità di accumulo`);
  lines.push(`- Reale (margine attuale): ${formatEUR(insights.accumulation.real)}/mese`);
  lines.push(`- Compressa (senza lifestyle): ${formatEUR(insights.accumulation.compressed)}/mese`);
  lines.push(`- Estrema (solo essential): ${formatEUR(insights.accumulation.extreme)}/mese`);
  lines.push(``);

  lines.push(`## Health check`);
  lines.push(`- Floor health: ${insights.floorHealth.label} (rapporto floor/entrate ${(insights.floorHealth.ratio * 100).toFixed(0)}%)`);
  lines.push(`- Reserve adequacy: ${insights.reserveStatus.label} (${insights.reserveStatus.months.toFixed(1)} mesi di essential coperti)`);
  lines.push(``);

  lines.push(`## Patrimonio`);
  lines.push(`- Totale: ${formatEUR(insights.patrimonyTotal)}`);
  lines.push(`  - Reserve: ${formatEUR(insights.patrimonyByType.reserve)} (${(insights.patrimonyByType.reserve / insights.patrimonyTotal * 100).toFixed(0)}%)`);
  lines.push(`  - Productive: ${formatEUR(insights.patrimonyByType.productive)} (${(insights.patrimonyByType.productive / insights.patrimonyTotal * 100).toFixed(0)}%)`);
  lines.push(`  - Parked: ${formatEUR(insights.patrimonyByType.parked)} (${(insights.patrimonyByType.parked / insights.patrimonyTotal * 100).toFixed(0)}%)`);
  lines.push(``);

  lines.push(`### Dettaglio asset`);
  state.assets.forEach(a => {
    let line = `- ${a.name} — ${formatEUR(a.current_value)} — ${ASSET_TYPE_META[a.type].label} — ${PATRIMONY_META[a.patrimony_type].label}`;
    if (a.expected_return_pct !== undefined) line += ` — rend ${a.expected_return_pct}%`;
    if (a.monthly_contribution) line += ` — PAC ${formatEUR(a.monthly_contribution)}/mese`;
    if (a.maturity_date) line += ` — scad ${a.maturity_date}`;
    lines.push(line);
  });
  lines.push(``);

  lines.push(`## Regole operative`);
  lines.push(`Soldi_Lab gestisce solo spese necessarie strutturali e stato patrimoniale.`);
  lines.push(`Le spese discrezionali (caffè, cene fuori, regali, viaggi extra) sono fuori scope e si gestiscono sul margine "reale".`);
  lines.push(`Le tre categorie di Floor sono: essential (sopravvivenza), baseline (standard scelto), lifestyle (riducibile).`);
  lines.push(`Le tre funzioni di Patrimonio sono: reserve (emergenza), productive (rende), parked (fermo senza piano).`);
  lines.push(``);

  lines.push(`## Domanda`);
  lines.push(`[Scrivi qui la tua domanda all'AI]`);

  return lines.join('\n');
}

// ============= CYCLE PAGE (v2.5 placeholder) =============

const CyclePage = ({ onNavigate }) => {
  const [showInfo, setShowInfo] = useState(false);
  const phaseKey = CURRENT_CYCLE_PHASE;
  const phase = CYCLE_PHASES[phaseKey];

  const phases = ['early', 'mid', 'late', 'recession'];
  const currentIndex = phases.indexOf(phaseKey);

  // Posizioni del cerchio (4 punti)
  const positions = [
    { angle: -90, label: 'Early', key: 'early' },   // top
    { angle: 0, label: 'Mid', key: 'mid' },          // right
    { angle: 90, label: 'Late', key: 'late' },       // bottom
    { angle: 180, label: 'Recession', key: 'recession' }, // left
  ];

  const colorMap = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-200' },
    sky:     { bg: 'bg-sky-500',     text: 'text-sky-700',     bgLight: 'bg-sky-50',     border: 'border-sky-200' },
    amber:   { bg: 'bg-amber-500',   text: 'text-amber-700',   bgLight: 'bg-amber-50',   border: 'border-amber-200' },
    rose:    { bg: 'bg-rose-500',    text: 'text-rose-700',    bgLight: 'bg-rose-50',    border: 'border-rose-200' },
  };
  const c = colorMap[phase.color];

  return (
    <div className="pb-24">
      <PageHeader
        title="Ciclo economico"
        onBack={() => onNavigate('dashboard')}
        action={
          <button onClick={() => setShowInfo(true)} className="p-2 -mr-2">
            <Info className="w-5 h-5 text-stone-500" />
          </button>
        }
      />

      {/* Card principale: Siamo in */}
      <div className="px-4 pt-4">
        <div className={`rounded-2xl border ${c.bgLight} ${c.border} p-5 text-center`}>
          <div className="text-[10px] uppercase tracking-widest font-medium text-stone-500 mb-2">Siamo in</div>
          <div className={`text-3xl font-bold ${c.text} mb-1`}>{phase.label}</div>
          <div className={`text-sm ${c.text} opacity-80`}>{phase.sublabel}</div>
        </div>
      </div>

      {/* Cerchio 4 fasi */}
      <div className="px-4 pt-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-stone-500 mb-4 text-center">Le quattro fasi</div>

          <div className="relative w-64 h-64 mx-auto">
            {/* Cerchio centrale */}
            <div className="absolute inset-0 rounded-full border-2 border-stone-200" />

            {/* Linea di progresso che evidenzia la fase corrente */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%" cy="50%" r="50%"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className={c.text}
                strokeDasharray={`${(currentIndex + 1) * 25}% 100%`}
                style={{ transformOrigin: 'center' }}
              />
            </svg>

            {/* Punti delle 4 fasi */}
            {positions.map((pos, i) => {
              const angleRad = (pos.angle * Math.PI) / 180;
              const radius = 128; // raggio del cerchio in px
              const x = Math.cos(angleRad) * radius + radius;
              const y = Math.sin(angleRad) * radius + radius;
              const isActive = pos.key === phaseKey;
              const isPassed = phases.indexOf(pos.key) < currentIndex;

              return (
                <div
                  key={pos.key}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${x}px`, top: `${y}px` }}
                >
                  <div className={`w-5 h-5 rounded-full border-2 ${isActive ? `${c.bg} border-white shadow-lg scale-125` : isPassed ? 'bg-stone-400 border-white' : 'bg-white border-stone-300'}`} />
                  <div className={`text-[10px] font-semibold uppercase tracking-wider mt-1 ${isActive ? c.text : 'text-stone-400'}`}>
                    {pos.label}
                  </div>
                </div>
              );
            })}

            {/* Label centrale */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Fase</div>
                <div className={`text-lg font-bold ${c.text}`}>{currentIndex + 1}/4</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-stone-600 text-center mt-4 leading-relaxed">
            {phase.short}
          </div>
        </div>
      </div>

      {/* Settori favoriti */}
      <div className="px-4 pt-3">
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-stone-500 mb-3">Settori favoriti in questa fase</div>
          <div className="flex flex-wrap gap-2">
            {phase.favored.map(sector => (
              <span
                key={sector}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${c.bgLight} ${c.text} ${c.border} border`}
              >
                {sector}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Link approfondimento */}
      <div className="px-4 pt-3">
        <button
          onClick={() => setShowInfo(true)}
          className="w-full bg-white rounded-2xl border border-stone-200 p-3 flex items-center gap-3 active:bg-stone-50"
        >
          <BookOpen className="w-5 h-5 text-stone-500" />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">Cos'è il ciclo economico?</div>
            <div className="text-xs text-stone-500">Approfondimento opzionale</div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300" />
        </button>
      </div>

      {/* Modal approfondimento */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end" onClick={() => setShowInfo(false)}>
          <div className="bg-white w-full rounded-t-3xl p-4 pb-8 max-w-md mx-auto max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-3">Il ciclo economico</h2>
            <div className="space-y-3 text-sm text-stone-700 leading-relaxed">
              <p>
                L'economia si muove in <strong>cicli</strong> che si ripetono nel tempo: dopo una fase di crescita arriva un picco, poi una contrazione, poi una nuova ripresa. Ogni ciclo dura mediamente 5-10 anni.
              </p>
              <p>
                Sapere in che fase siamo aiuta a capire cosa aspettarsi. Non è una scienza esatta, ma è una bussola.
              </p>
              <div className="space-y-2 mt-4">
                {Object.entries(CYCLE_PHASES).map(([key, p]) => (
                  <div key={key} className="p-3 bg-stone-50 rounded-xl">
                    <div className={`text-sm font-semibold ${colorMap[p.color].text}`}>{p.label} — {p.sublabel}</div>
                    <div className="text-xs text-stone-600 mt-1">{p.short}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4">
                <strong>I settori</strong> si comportano diversamente in ogni fase. In ripresa tendono a salire i ciclici (finanziari, tech), in espansione matura i settori industriali, in fine ciclo l'energia e i materiali, in contrazione i difensivi (sanità, utilities, beni essenziali).
              </p>
              <p>
                Soldi_Lab ti mostra la fase corrente — calcolata da indicatori economici — e i settori storicamente favoriti. <strong>Non sono consigli di acquisto</strong>, sono solo strumenti per orientarti.
              </p>
            </div>
            <button onClick={() => setShowInfo(false)} className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-medium mt-6">
              Ho capito
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsPage = ({ state, onNavigate }) => {
  return (
    <div className="pb-24">
      <PageHeader title="Impostazioni" onBack={() => onNavigate('dashboard')} />

      <div className="px-4 pt-4 space-y-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 px-1">Spazi</h2>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            {state.spaces.map((s, i) => (
              <div key={s.id} className={`p-3 flex items-center gap-3 ${i < state.spaces.length - 1 ? 'border-b border-stone-100' : ''}`}>
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{s.name}</div>
                  {s.id === state.activeSpaceId && (
                    <div className="text-xs text-emerald-700 font-medium">Attivo</div>
                  )}
                </div>
                <button className="text-stone-400">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 px-1">Dati</h2>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <button className="w-full p-3 flex items-center gap-3 active:bg-stone-50 border-b border-stone-100">
              <Download className="w-5 h-5 text-stone-600" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Esporta backup</div>
                <div className="text-xs text-stone-500">JSON con tutti i tuoi dati</div>
              </div>
            </button>
            <button className="w-full p-3 flex items-center gap-3 active:bg-stone-50">
              <Plus className="w-5 h-5 text-stone-600" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Importa backup</div>
                <div className="text-xs text-stone-500">Unisci dati da un file</div>
              </div>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 px-1">Advisor AI</h2>
          <div className="bg-white rounded-2xl border border-stone-200 p-3 flex items-center gap-3 opacity-60">
            <Sparkles className="w-5 h-5 text-stone-600" />
            <div className="flex-1">
              <div className="text-sm font-medium flex items-center gap-2">
                DeepSeek API
                <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">v2</span>
              </div>
              <div className="text-xs text-stone-500">Configura API key per chat integrata</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 px-1">App</h2>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="p-3 flex items-center justify-between border-b border-stone-100">
              <span className="text-sm">Versione</span>
              <span className="text-sm text-stone-500">0.2.0 (prototipo)</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm">Privacy</span>
              <span className="text-sm text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Solo locale
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-stone-400 pt-4 pb-2">
          Soldi_Lab · EAR Lab Famiglia
        </div>
      </div>
    </div>
  );
};

// ============= APP =============

export default function SoldiLabPrototype() {
  const [activeSpaceId, setActiveSpaceId] = useState('sp1');
  const [spaces] = useState(initialSpaces);
  const [floor, setFloor] = useState(initialFloor);
  const [income, setIncome] = useState(initialIncome);
  const [assets, setAssets] = useState(initialAssets);
  const [page, setPage] = useState('dashboard');
  const [showSpaceSwitcher, setShowSpaceSwitcher] = useState(false);

  const state = { spaces, floor, income, assets, activeSpaceId };

  const handleUpdate = (entity, id, updates) => {
    if (entity === 'floor') {
      setFloor(floor.map(f => f.id === id ? { ...f, ...updates } : f));
    } else if (entity === 'income') {
      setIncome(income.map(i => i.id === id ? { ...i, ...updates } : i));
    } else if (entity === 'assets') {
      setAssets(assets.map(a => a.id === id ? { ...a, ...updates } : a));
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard state={state} onNavigate={setPage} onOpenSpaceSwitcher={() => setShowSpaceSwitcher(true)} />;
      case 'floor':
        return <FloorPage state={state} onNavigate={setPage} onUpdate={handleUpdate} />;
      case 'income':
        return <IncomePage state={state} onNavigate={setPage} onUpdate={handleUpdate} />;
      case 'patrimony':
        return <PatrimonyPage state={state} onNavigate={setPage} onUpdate={handleUpdate} />;
      case 'cycle':
        return <CyclePage onNavigate={setPage} />;
      case 'advisor':
        return <AdvisorPage state={state} onNavigate={setPage} />;
      case 'settings':
        return <SettingsPage state={state} onNavigate={setPage} />;
      default:
        return <Dashboard state={state} onNavigate={setPage} onOpenSpaceSwitcher={() => setShowSpaceSwitcher(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans antialiased">
      <div className="max-w-md mx-auto bg-stone-50 min-h-screen relative">
        <AppHeader />
        {renderPage()}
        <BottomNav current={page} onChange={setPage} />
        {showSpaceSwitcher && (
          <SpaceSwitcher
            spaces={spaces}
            activeSpace={activeSpaceId}
            onChange={setActiveSpaceId}
            onClose={() => setShowSpaceSwitcher(false)}
          />
        )}
      </div>
    </div>
  );
}
