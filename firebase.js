import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore, collection, doc, onSnapshot, addDoc, setDoc, updateDoc,
  increment, serverTimestamp, query, orderBy,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Projeto Firebase da Feira de Empreendedorismo (feira-emp-80153).
const app = initializeApp({
  apiKey: 'AIzaSyBCwzr8jwf_jCrtPEMLq-9EbuILucVNvRc',
  authDomain: 'feira-emp-80153.firebaseapp.com',
  projectId: 'feira-emp-80153',
  storageBucket: 'feira-emp-80153.firebasestorage.app',
  messagingSenderId: '326475709947',
  appId: '1:326475709947:web:6ed654e98d89e75f2ddf5e',
});

export const db = getFirestore(app);
export {
  collection, doc, onSnapshot, addDoc, setDoc, updateDoc,
  increment, serverTimestamp, query, orderBy,
};

export const reais = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Escapa texto vindo do banco antes de montar HTML.
export const esc = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
