import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Impostazioni" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Impostazioni" back />
      <div className="px-4 pt-4">
        <p className="text-sm text-stone-500">
          Spazi, backup, tema. Costruita in F3 / F9.
        </p>
      </div>
    </>
  );
}
