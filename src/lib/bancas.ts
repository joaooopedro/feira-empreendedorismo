import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Banca } from "./tipos";

export const ordenar = (bancas: Banca[]) => [...bancas].sort((a, b) => a.numero - b.numero);

// Usado no servidor para a página já chegar com as bancas.
export async function buscarBancas() {
  try {
    const snap = await getDocs(collection(db, "bancas"));
    return ordenar(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Banca));
  } catch {
    return [];
  }
}
