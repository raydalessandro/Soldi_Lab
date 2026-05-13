import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Entrate" };

export default function IncomePage() {
  return (
    <>
      <PageHeader title="Entrate" />
      <div className="px-4 pt-4">
        <p className="text-sm text-stone-500">
          Flussi stabili — stipendio, pensione, affitti attivi. Disponibile in
          F5.
        </p>
      </div>
    </>
  );
}
