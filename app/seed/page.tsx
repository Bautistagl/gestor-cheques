'use client';

import { useState } from 'react';
import { agregarCheque } from '@/lib/cheques';
import { ChequeFormData } from '@/types/cheque';

// 15 cheques distribuidos en distintas fechas posteriores al 19/05/2026.
const CHEQUES_SEED: ChequeFormData[] = [
  // 20/05/2026 — 2 cheques
  { numero: '00010234', tipo: 'fisico',      fechaCreacion: '2026-04-20', fechaCobro: '2026-05-20', empresa: 'Distribuidora López',     monto: 450000 },
  { numero: '00010235', tipo: 'electronico', fechaCreacion: '2026-04-22', fechaCobro: '2026-05-20', empresa: 'Ferretería El Tornillo',  monto: 120000 },
  // 22/05/2026 — 1 cheque
  { numero: '00018821', tipo: 'fisico',      fechaCreacion: '2026-04-22', fechaCobro: '2026-05-22', empresa: 'Carnicería Don Pedro',    monto:  85000 },
  // 25/05/2026 — 3 cheques
  { numero: '00022001', tipo: 'fisico',      fechaCreacion: '2026-04-25', fechaCobro: '2026-05-25', empresa: 'Panadería La Esquina',    monto:  65000 },
  { numero: '00022002', tipo: 'electronico', fechaCreacion: '2026-04-26', fechaCobro: '2026-05-25', empresa: 'Imprenta Gráfica Sur',    monto: 230000 },
  { numero: '00022003', tipo: 'fisico',      fechaCreacion: '2026-04-27', fechaCobro: '2026-05-25', empresa: 'Almacén Don Juan',        monto: 340000 },
  // 28/05/2026 — 1 cheque
  { numero: '00030010', tipo: 'electronico', fechaCreacion: '2026-04-28', fechaCobro: '2026-05-28', empresa: 'Constructora Andina',     monto: 1250000 },
  // 02/06/2026 — 2 cheques
  { numero: '00041122', tipo: 'fisico',      fechaCreacion: '2026-05-02', fechaCobro: '2026-06-02', empresa: 'Verdulería La Huerta',    monto:  95000 },
  { numero: '00041123', tipo: 'electronico', fechaCreacion: '2026-05-03', fechaCobro: '2026-06-02', empresa: 'Lácteos Tres Arroyos',    monto: 410000 },
  // 05/06/2026 — 1 cheque
  { numero: '00052200', tipo: 'fisico',      fechaCreacion: '2026-05-05', fechaCobro: '2026-06-05', empresa: 'Vidriería Cristal',       monto: 580000 },
  // 10/06/2026 — 1 cheque
  { numero: '00063300', tipo: 'electronico', fechaCreacion: '2026-05-10', fechaCobro: '2026-06-10', empresa: 'Heladería Polo Norte',    monto: 175000 },
  // 15/06/2026 — 2 cheques
  { numero: '00074410', tipo: 'fisico',      fechaCreacion: '2026-05-12', fechaCobro: '2026-06-15', empresa: 'Pinturería Color Total',  monto: 295000 },
  { numero: '00074411', tipo: 'electronico', fechaCreacion: '2026-05-14', fechaCobro: '2026-06-15', empresa: 'Forrajería El Campo',     monto: 720000 },
  // 30/06/2026 — 1 cheque
  { numero: '00085500', tipo: 'fisico',      fechaCreacion: '2026-05-15', fechaCobro: '2026-06-30', empresa: 'Repuestos Don Auto',      monto: 890000 },
  // 15/07/2026 — 1 cheque
  { numero: '00099001', tipo: 'electronico', fechaCreacion: '2026-05-16', fechaCobro: '2026-07-15', empresa: 'Textil Hilados SA',       monto: 1580000 },
];

const formatMonto = (n: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);

const formatFecha = (f: string): string => {
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
};

export default function SeedPage() {
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'ok' | 'error'>('idle');
  const [progreso, setProgreso] = useState(0);
  const [errores, setErrores] = useState<string[]>([]);

  const total = CHEQUES_SEED.reduce((s, c) => s + c.monto, 0);

  const cargar = async () => {
    if (
      !confirm(
        `Se van a crear ${CHEQUES_SEED.length} cheques de prueba en Firestore (total ${formatMonto(total)}).\n\n¿Continuar?`
      )
    ) {
      return;
    }
    setEstado('cargando');
    setProgreso(0);
    const fallos: string[] = [];

    for (let i = 0; i < CHEQUES_SEED.length; i++) {
      try {
        await agregarCheque(CHEQUES_SEED[i]);
        setProgreso(i + 1);
      } catch (err: any) {
        fallos.push(`${CHEQUES_SEED[i].empresa}: ${err?.message ?? 'error'}`);
      }
    }

    setErrores(fallos);
    setEstado(fallos.length > 0 ? 'error' : 'ok');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seed de cheques</h1>
        <p className="text-gray-700 text-base mb-6">
          Carga manual de {CHEQUES_SEED.length} cheques de prueba distribuidos en distintas
          fechas posteriores al 19/05/2026.
        </p>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-gray-900">Resumen</p>
            <p className="text-xl font-bold text-red-800">{formatMonto(total)}</p>
          </div>
          <ul className="divide-y divide-gray-100">
            {CHEQUES_SEED.map((c, i) => (
              <li key={i} className="py-2 flex justify-between gap-3 text-sm">
                <span className="text-gray-700">
                  <strong className="text-gray-900">{formatFecha(c.fechaCobro)}</strong> · {c.empresa}
                </span>
                <span className="font-bold text-gray-900 whitespace-nowrap">
                  {formatMonto(c.monto)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={cargar}
          disabled={estado === 'cargando' || estado === 'ok'}
          className="w-full px-5 py-4 bg-blue-700 text-white rounded-xl hover:bg-blue-800 font-bold text-lg transition-colors disabled:opacity-50"
        >
          {estado === 'cargando'
            ? `Cargando... (${progreso}/${CHEQUES_SEED.length})`
            : estado === 'ok'
            ? '✓ Cheques cargados'
            : 'Cargar 15 cheques en Firestore'}
        </button>

        {estado === 'ok' && (
          <div className="mt-5 bg-green-50 border-2 border-green-300 rounded-xl p-4">
            <p className="text-green-900 font-bold text-lg">
              ✓ Se cargaron {progreso} cheques correctamente
            </p>
            <a href="/" className="text-blue-700 font-bold underline mt-2 inline-block">
              Ir al calendario →
            </a>
          </div>
        )}

        {estado === 'error' && (
          <div className="mt-5 bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <p className="text-red-900 font-bold text-lg mb-2">
              Se cargaron {progreso}/{CHEQUES_SEED.length}. Errores:
            </p>
            <ul className="list-disc list-inside text-red-800 text-sm">
              {errores.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
