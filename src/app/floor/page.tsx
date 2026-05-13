import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Floor" };

export default function FloorPage() {
  return (
    <>
      <PageHeader title="Floor" />
      <div className="px-4 pt-4">
        <p className="text-sm text-stone-500">
          Spese permanenti — lista, filtri ed edit inline arriveranno in F4.
        </p>
      </div>
    </>
  );
}
