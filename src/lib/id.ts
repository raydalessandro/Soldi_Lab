// Generazione UUID lato client (SPEC §13: "UUID lato client. Sempre.").
// crypto.randomUUID() è supportato nativamente in tutti i runtime moderni
// (browser e Node 22+). Il pacchetto `uuid` è installato come fallback
// se in futuro dovessimo girare in ambienti senza crypto globale.

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
