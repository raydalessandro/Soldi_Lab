import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Advisor" };

export default function AdvisorPage() {
  return (
    <>
      <PageHeader title="Advisor" />
      <div className="px-4 pt-4">
        <p className="text-sm text-stone-500">
          Insight automatici + esporta contesto AI. Disponibile in F8.
        </p>
      </div>
    </>
  );
}
