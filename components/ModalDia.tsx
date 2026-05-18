'use client';

import { Cheque } from '@/types/cheque';
import TarjetaCheque from './TarjetaCheque';

interface Props {
  fecha: string; // YYYY-MM-DD
  cheques: Cheque[];
  onCerrar: () => void;
  onEditar: (cheque: Cheque) => void;
}

const formatFechaLarga = (f: string): string => {
  const [y, m, d] = f.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  return fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatMonto = (n: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(n);

export default function ModalDia({ fecha, cheques, onCerrar, onEditar }: Props) {
  const total = cheques.reduce((s, c) => s + c.monto, 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b-2 border-gray-100 flex items-start justify-between sticky top-0 bg-white z-10 gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">
              Cheques del día
            </p>
            <h2 className="text-xl font-bold text-gray-900 capitalize leading-tight mt-1">
              {formatFechaLarga(fecha)}
            </h2>
            <p className="text-gray-700 text-base font-semibold mt-1">
              {cheques.length} cheque{cheques.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="shrink-0 text-gray-500 hover:text-gray-800 text-4xl leading-none w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Lista */}
        <div className="p-5 space-y-3">
          {cheques.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-3">📭</div>
              <p className="text-gray-700 text-lg font-semibold">
                No hay cheques en esta fecha
              </p>
            </div>
          ) : (
            cheques.map((c) => (
              <TarjetaCheque key={c.id} cheque={c} onEditar={onEditar} />
            ))
          )}
        </div>

        {/* Total */}
        {cheques.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t-2 border-gray-100 p-5">
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-center justify-between gap-3">
              <p className="text-lg font-bold text-red-900">Total del día</p>
              <p className="text-2xl font-bold text-red-800">{formatMonto(total)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
