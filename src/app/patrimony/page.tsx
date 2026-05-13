import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Patrimonio" };

export default function PatrimonyPage() {
  return (
    <>
      <PageHeader title="Patrimonio" />
      <div className="px-4 pt-4">
        <p className="text-sm text-stone-500">
          Asset reserve / productive / parked. Disponibile in F6.
        </p>
      </div>
    </>
  );
}
