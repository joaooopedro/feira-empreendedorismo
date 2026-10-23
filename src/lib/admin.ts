import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Conta de serviço só no servidor (variável FIREBASE_SA). O navegador não grava nada direto no banco.
const app = getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SA ?? "{}")) });

export const adminDb = getFirestore(app);
