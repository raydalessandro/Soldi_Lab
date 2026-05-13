"use client";

import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { buildBackupJson } from "@/lib/backup/export";
import {
  applyBackup,
  BackupParseError,
  parseBackup,
  previewBackup,
  type BackupImportResult,
  type BackupPreview,
} from "@/lib/backup/import";
import { cn } from "@/lib/cn";

const APP_VERSION = "0.1.0";

type ImportState =
  | { kind: "idle" }
  | { kind: "preview"; preview: BackupPreview; raw: string }
  | { kind: "applied"; result: BackupImportResult }
  | { kind: "error"; message: string };

// Sezione "Dati" delle Impostazioni: esporta tutto come file JSON,
// importa con preview + conferma. Merge last-write-wins (SPEC §8.2).
export function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importState, setImportState] = useState<ImportState>({ kind: "idle" });
  const [exporting, setExporting] = useState(false);

  const onExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const json = await buildBackupJson(APP_VERSION);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ts = new Date().toISOString().slice(0, 10);
      a.download = `soldi-lab-backup-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const raw = await file.text();
    e.target.value = ""; // permette di re-importare lo stesso file
    try {
      const parsed = parseBackup(raw);
      setImportState({
        kind: "preview",
        preview: previewBackup(parsed),
        raw,
      });
    } catch (err) {
      const message =
        err instanceof BackupParseError ? err.message : String(err);
      setImportState({ kind: "error", message });
    }
  };

  const onConfirmImport = async () => {
    if (importState.kind !== "preview") return;
    try {
      const parsed = parseBackup(importState.raw);
      const result = await applyBackup(parsed);
      setImportState({ kind: "applied", result });
    } catch (err) {
      setImportState({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const dismiss = () => setImportState({ kind: "idle" });

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        className="flex w-full items-center gap-3 border-b border-stone-100 p-3 text-left active:bg-stone-50 disabled:opacity-50"
      >
        <Download className="h-5 w-5 text-stone-600" />
        <div className="flex-1">
          <div className="text-sm font-medium">Esporta backup</div>
          <div className="text-xs text-stone-500">
            File JSON con tutti i tuoi dati
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onPickFile}
        className="flex w-full items-center gap-3 p-3 text-left active:bg-stone-50"
      >
        <Upload className="h-5 w-5 text-stone-600" />
        <div className="flex-1">
          <div className="text-sm font-medium">Importa backup</div>
          <div className="text-xs text-stone-500">
            Unisci dati da un file. Niente sovrascrive, fa merge.
          </div>
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="File backup"
        onChange={onFileChange}
      />

      {importState.kind === "preview" && (
        <PreviewModal
          preview={importState.preview}
          onCancel={dismiss}
          onConfirm={onConfirmImport}
        />
      )}
      {importState.kind === "applied" && (
        <AppliedModal result={importState.result} onClose={dismiss} />
      )}
      {importState.kind === "error" && (
        <ErrorModal message={importState.message} onClose={dismiss} />
      )}
    </div>
  );
}

function PreviewModal({
  preview,
  onCancel,
  onConfirm,
}: {
  preview: BackupPreview;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Sheet onClose={onCancel} title="Conferma import">
      <p className="mb-3 text-sm text-stone-600">Il file contiene:</p>
      <ul className="mb-4 space-y-1 text-sm">
        <CountRow label="Spazi" value={preview.counts.spaces} />
        <CountRow label="Voci Floor" value={preview.counts.floor_items} />
        <CountRow label="Voci Entrate" value={preview.counts.income_items} />
        <CountRow label="Asset Patrimonio" value={preview.counts.assets} />
      </ul>
      <p className="mb-4 text-xs leading-relaxed text-stone-500">
        I dati vengono uniti per ID: voci esistenti vengono aggiornate solo se
        l&apos;import è più recente, altrimenti restano quelle locali. Niente
        viene cancellato.
      </p>
      <p className="mb-4 text-[11px] text-stone-400">
        Esportato {preview.exported_by_device ?? "?"} ·{" "}
        {preview.exported_at.slice(0, 10)} · app {preview.app_version}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-medium text-stone-700"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white"
        >
          Importa
        </button>
      </div>
    </Sheet>
  );
}

function AppliedModal({
  result,
  onClose,
}: {
  result: BackupImportResult;
  onClose: () => void;
}) {
  const totalInserted = sumCounts(result.inserted);
  const totalUpdated = sumCounts(result.updated);
  const totalIgnored = sumCounts(result.ignored);

  return (
    <Sheet onClose={onClose} title="Import completato">
      <ul className="mb-4 space-y-1 text-sm">
        <CountRow label="Nuovi record" value={totalInserted} />
        <CountRow label="Aggiornati" value={totalUpdated} />
        <CountRow label="Ignorati (locale più recente)" value={totalIgnored} />
      </ul>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white"
      >
        OK
      </button>
    </Sheet>
  );
}

function ErrorModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <Sheet onClose={onClose} title="Import fallito">
      <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-900">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white"
      >
        Chiudi
      </button>
    </Sheet>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
        <h2 className="mb-3 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function CountRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-stone-600">{label}</span>
      <span
        className={cn(
          "rounded bg-stone-100 px-2 py-0.5 font-mono text-xs",
          value === 0 && "text-stone-400",
        )}
      >
        {value}
      </span>
    </li>
  );
}

function sumCounts(c: BackupImportResult["inserted"]): number {
  return (
    c.spaces + c.floor_items + c.income_items + c.assets + c.space_settings
  );
}
