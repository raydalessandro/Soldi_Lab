import { PageHeader } from "@/components/PageHeader";
import { SpaceListEditor } from "@/components/SpaceListEditor";

export const metadata = { title: "Impostazioni" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Impostazioni" back />
      <div className="space-y-6 px-4 pt-4">
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold tracking-widest text-stone-400 uppercase">
            Spazi
          </h2>
          <SpaceListEditor />
        </section>

        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold tracking-widest text-stone-400 uppercase">
            Dati
          </h2>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-500">
            Backup e import JSON arrivano in F9.
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold tracking-widest text-stone-400 uppercase">
            App
          </h2>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-100 p-3 text-sm">
              <span>Versione</span>
              <span className="text-stone-500">0.1.0 (v1 in costruzione)</span>
            </div>
            <div className="flex items-center justify-between p-3 text-sm">
              <span>Privacy</span>
              <span className="font-medium text-emerald-700">Solo locale</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
