import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Projeto Firebase da Feira de Empreendedorismo (feira-emp-80153).
// A apiKey do Firebase Web é pública por desenho; quem protege os dados são as regras em firestore.rules.
const app =
  getApps()[0] ??
  initializeApp({
    apiKey: "AIzaSyBCwzr8jwf_jCrtPEMLq-9EbuILucVNvRc",
    authDomain: "feira-emp-80153.firebaseapp.com",
    projectId: "feira-emp-80153",
    storageBucket: "feira-emp-80153.firebasestorage.app",
    messagingSenderId: "326475709947",
    appId: "1:326475709947:web:6ed654e98d89e75f2ddf5e",
  });

export const db = getFirestore(app);
