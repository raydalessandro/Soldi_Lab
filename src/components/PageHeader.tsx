"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  // Quando true mostra il pulsante back e fa router.back().
  // Usato dalle pagine secondarie (es. dettaglio /floor/[id]).
  // Le pagine top-level raggiungibili dal BottomNav non mostrano back.
  back?: boolean;
  action?: ReactNode;
}

export function PageHeader({ title, back, action }: PageHeaderProps) {
  const router = useRouter();
  return (
    <div className="sticky top-[52px] z-10 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {back && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Indietro"
            className="-ml-1 rounded-lg p-1 active:bg-stone-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  );
}
