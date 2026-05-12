import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Cheque, ChequeFormData } from '@/types/cheque';

const COLECCION = 'cheques';

const fechaHoy = (): string => {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const suscribirCheques = (callback: (cheques: Cheque[]) => void) => {
  const q = query(collection(db, COLECCION), orderBy('fechaCobro', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const cheques = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as Cheque));
    callback(cheques);
  });
};

export const agregarCheque = async (datos: ChequeFormData) => {
  await addDoc(collection(db, COLECCION), {
    ...datos,
    cobrado: false,
    creadoEn: serverTimestamp(),
  });
};

export const actualizarCheque = async (id: string, datos: Partial<ChequeFormData>) => {
  await updateDoc(doc(db, COLECCION, id), datos);
};

export const marcarComoCobrado = async (id: string) => {
  await updateDoc(doc(db, COLECCION, id), { cobrado: true });
};

export const eliminarCheque = async (id: string) => {
  await deleteDoc(doc(db, COLECCION, id));
};

export const autoMarcarCobrados = async (cheques: Cheque[]) => {
  const hoy = fechaHoy();
  const pendientes = cheques.filter((c) => !c.cobrado && c.fechaCobro <= hoy);
  if (pendientes.length === 0) return;

  const batch = writeBatch(db);
  pendientes.forEach((c) => {
    batch.update(doc(db, COLECCION, c.id), { cobrado: true });
  });
  await batch.commit();
};
