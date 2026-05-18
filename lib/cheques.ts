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
import { Cheque, ChequeFormData, EstadoCheque } from '@/types/cheque';

const COLECCION = 'cheques';

const fechaHoy = (): string => {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Devuelve el estado efectivo de un cheque manejando datos legacy.
 * - Si tiene `estado`, lo respeta.
 * - Si no, asume 'cobrado' cuando cobrado===true, sino 'pendiente'.
 *   (los pendientes que ya vencieron se actualizan por autoMarcarVencidos).
 */
export const getEstado = (c: Cheque): EstadoCheque => {
  if (c.estado === 'cobrado' || c.estado === 'vencido' || c.estado === 'pendiente') {
    return c.estado;
  }
  return c.cobrado ? 'cobrado' : 'pendiente';
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
    estado: 'pendiente' as EstadoCheque,
    creadoEn: serverTimestamp(),
  });
};

export const actualizarCheque = async (id: string, datos: Partial<ChequeFormData>) => {
  await updateDoc(doc(db, COLECCION, id), datos);
};

/**
 * Marca un cheque como cobrado (solo manualmente).
 */
export const marcarComoCobrado = async (id: string) => {
  await updateDoc(doc(db, COLECCION, id), {
    cobrado: true,
    estado: 'cobrado' as EstadoCheque,
  });
};

/**
 * Revierte un cheque cobrado o vencido a pendiente.
 */
export const marcarComoPendiente = async (id: string) => {
  await updateDoc(doc(db, COLECCION, id), {
    cobrado: false,
    estado: 'pendiente' as EstadoCheque,
  });
};

export const eliminarCheque = async (id: string) => {
  await deleteDoc(doc(db, COLECCION, id));
};

/**
 * Auto-marca como VENCIDO todo cheque pendiente cuya fecha de cobro
 * sea anterior a HOY (es decir, al día siguiente del vencimiento).
 * Ya NO se marca nada como cobrado automáticamente.
 */
export const autoMarcarVencidos = async (cheques: Cheque[]) => {
  const hoy = fechaHoy();
  const aVencer = cheques.filter((c) => {
    const estado = getEstado(c);
    return estado === 'pendiente' && c.fechaCobro < hoy;
  });
  if (aVencer.length === 0) return;

  const batch = writeBatch(db);
  aVencer.forEach((c) => {
    batch.update(doc(db, COLECCION, c.id), {
      estado: 'vencido' as EstadoCheque,
      cobrado: false,
    });
  });
  await batch.commit();
};
