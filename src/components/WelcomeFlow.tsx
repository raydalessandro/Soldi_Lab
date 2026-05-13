"use client";

import { useState } from "react";
import { ChevronRight, Heart, Shield, Sparkles } from "lucide-react";
import { completeFirstSpaceSetup } from "@/lib/bootstrap";
import { cn } from "@/lib/cn";

// Onboarding del primo avvio (SPEC §11.1).
// Tre slide informative + creazione del primo spazio.
//
// Quando l'utente termina lo step 4 chiamiamo completeFirstSpaceSetup
// che crea Space + AppSettings; il watcher useAppInitState in
// AppBootstrap rileva la transizione e smonta la WelcomeFlow.

const SLIDES = [
  {
    icon: Heart,
    title: "Solo ciò che pesa davvero",
    body: "Soldi_Lab gestisce solo le spese permanenti e il tuo patrimonio. Caffè, cene, regali — tutto il resto è tuo da gestire sul margine.",
  },
  {
    icon: Shield,
    title: "I dati restano con te",
    body: "Funziona offline. Niente account, niente cloud forzato. Il backup è un file JSON che salvi dove vuoi.",
  },
  {
    icon: Sparkles,
    title: "Aggiorna poco, capisci molto",
    body: "Cinque minuti al mese bastano. Più i dati sono freschi, più l'app e l'AI possono dirti qualcosa di sensato.",
  },
] as const;

export function WelcomeFlow() {
  const [step, setStep] = useState(0);
  const [spaceName, setSpaceName] = useState("Casa Mia");
  const [submitting, setSubmitting] = useState(false);

  const onSlideNext = () => setStep((s) => s + 1);
  const onCreate = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await completeFirstSpaceSetup({ name: spaceName });
    } catch (err) {
      setSubmitting(false);
      // Per ora un'eccezione viene mostrata in console; UX d'errore arriva
      // in F10 con i banner contestuali.
      console.error("welcome bootstrap failed", err);
    }
  };

  if (step < SLIDES.length) {
    const slide = SLIDES[step];
    const Icon = slide.icon;
    return (
      <div className="flex flex-1 flex-col px-6 pt-8 pb-10">
        <div className="mb-6 flex items-center justify-between">
          <Dots total={SLIDES.length + 1} current={step} />
          {step < SLIDES.length - 1 && (
            <button
              type="button"
              onClick={() => setStep(SLIDES.length)}
              className="text-xs font-medium text-stone-500"
            >
              Salta
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-900 text-white">
            <Icon className="h-9 w-9" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{slide.title}</h1>
          <p className="max-w-xs text-sm leading-relaxed text-stone-600">
            {slide.body}
          </p>
        </div>

        <button
          type="button"
          onClick={onSlideNext}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3 text-sm font-semibold text-white active:bg-stone-800"
        >
          Avanti
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-8 pb-10">
      <div className="mb-6">
        <Dots total={SLIDES.length + 1} current={SLIDES.length} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="text-3xl">🏠</div>
        <h1 className="text-2xl font-bold tracking-tight">
          Crea il tuo primo spazio
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-stone-600">
          Uno spazio è una famiglia o una unità economica separata. Puoi
          aggiungerne altri in qualsiasi momento dalle impostazioni.
        </p>

        <div className="mt-2 w-full max-w-xs">
          <label
            htmlFor="welcome-space-name"
            className="mb-1 block text-[11px] font-medium tracking-wider text-stone-500 uppercase"
          >
            Nome dello spazio
          </label>
          <input
            id="welcome-space-name"
            value={spaceName}
            onChange={(e) => setSpaceName(e.target.value)}
            className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm outline-none focus:bg-stone-50 focus:ring-2 focus:ring-stone-900"
            placeholder="Casa Mia"
            autoFocus
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onCreate}
        disabled={submitting || spaceName.trim().length === 0}
        className={cn(
          "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors",
          submitting || spaceName.trim().length === 0
            ? "bg-stone-200 text-stone-400"
            : "bg-stone-900 text-white active:bg-stone-800",
        )}
      >
        {submitting ? "Creo lo spazio…" : "Inizia"}
      </button>
    </div>
  );
}

function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-6 bg-stone-900" : "w-1.5 bg-stone-300",
          )}
        />
      ))}
    </div>
  );
}
