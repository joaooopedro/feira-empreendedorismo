"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Escuta uma coleção do Firestore em tempo real. Começa com o que veio do servidor, se houver.
export function useColecao<T>(nome: string, inicial: T[] = []) {
  const [itens, setItens] = useState<T[]>(inicial);
  const [erro, setErro] = useState(false);

  useEffect(
    () =>
      onSnapshot(
        collection(db, nome),
        (snap) => {
          setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
          setErro(false);
        },
        () => setErro(true),
      ),
    [nome],
  );

  return { itens, erro };
}
