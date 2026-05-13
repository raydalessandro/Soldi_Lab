import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Ciclo" };

export default function CyclePage() {
  return (
    <>
      <PageHeader title="Ciclo economico" />
      <div className="px-4 pt-4">
        <p className="text-sm text-stone-500">
          Fase corrente e settori favoriti. Modulo educativo v2.5.
        </p>
      </div>
    </>
  );
}
