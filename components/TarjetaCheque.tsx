'use client';

import { Cheque } from '@/types/cheque';
import { marcarComoCobrado, eliminarCheque } from '@/lib/cheques';

interface Props {
  cheque: Cheque;
  onEditar: (cheque: Cheque) => void;
}

const formatFecha = (f: string): string => {
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
};

const formatMonto = (n: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(n);

const fechaHoy = (): string => {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const diasHasta = (fecha: string): number => {
  const hoy = new Date(fechaHoy());
  const objetivo = new Date(fecha);
  return Math.round((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

export default function TarjetaCheque({ cheque, onEditar }: Props) {
  const dias = diasHasta(cheque.fechaCobro);
  const esHoy = dias === 0;

  const labelDias = (): string => {
    if (dias > 1) return `En ${dias} días`;
    if (dias === 1) return 'Mañana';
    if (esHoy) return 'Hoy';
    return `Hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
  };

  const handleCobrar = async () => {
    if (
      confirm(
        `¿Marcar como cobrado el cheque de ${cheque.empresa} por ${formatMonto(cheque.monto)}?`
      )
    ) {
      await marcarComoCobrado(cheque.id);
    }
  };

  const handleEliminar = async () => {
    if (
      confirm(
        `¿Eliminar el cheque de ${cheque.empresa} por ${formatMonto(cheque.monto)}?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      await eliminarCheque(cheque.id);
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-all ${
        cheque.cobrado
          ? 'bg-green-50 border-green-300'
          : esHoy
          ? 'bg-amber-50 border-amber-400 shadow-md'
          : 'bg-white border-gray-300 shadow-sm'
      }`}
    >
      {/* Badges row */}
      <div className="mb-3 flex flex-wrap gap-2">
        {cheque.cobrado ? (
          <span className="inline-block text-base px-3 py-1.5 rounded-full font-bold bg-green-200 text-green-900">
            ✓ Cobrado
          </span>
        ) : esHoy ? (
          <span className="inline-block text-base px-3 py-1.5 rounded-full font-bold bg-amber-200 text-amber-900">
            ⚡ Se cobra hoy
          </span>
        ) : (
          <span className="inline-block text-base px-3 py-1.5 rounded-full font-bold bg-blue-200 text-blue-900">
            Pendiente · {labelDias()}
          </span>
        )}
        <span className="inline-block text-base px-3 py-1.5 rounded-full font-bold bg-gray-200 text-gray-900">
          {cheque.tipo === 'electronico' ? '💻 Electrónico' : '📄 Físico'}
        </span>
      </div>

      {/* Empresa */}
      <h3 className="font-bold text-gray-900 text-2xl leading-tight break-words">
        {cheque.empresa}
      </h3>

      {cheque.numero && (
        <p className="text-gray-700 text-base font-semibold mt-1">
          N° {cheque.numero}
        </p>
      )}

      {/* Monto */}
      <p className="text-4xl font-bold text-gray-900 mt-2 break-words">
        {formatMonto(cheque.monto)}
      </p>

      {/* Dates */}
      <div className="mt-4 pt-4 border-t-2 border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-gray-600 text-base font-semibold">Fecha de creación</p>
          <p className="font-bold text-gray-900 text-xl mt-0.5">
            {formatFecha(cheque.fechaCreacion)}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-base font-semibold">
            {cheque.cobrado ? 'Fue cobrado el' : 'Se cobra el'}
          </p>
          <p
            className={`font-bold text-xl mt-0.5 ${
              cheque.cobrado
                ? 'text-green-800'
                : esHoy
                ? 'text-amber-800'
                : 'text-gray-900'
            }`}
          >
            {formatFecha(cheque.fechaCobro)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {!cheque.cobrado && (
          <>
            <button
              onClick={() => onEditar(cheque)}
              className="flex-1 min-w-[110px] px-4 py-3.5 text-base border-2 border-gray-300 text-gray-800 rounded-xl hover:bg-gray-50 font-bold transition-colors"
            >
              Editar
            </button>
            <button
              onClick={handleCobrar}
              className="flex-1 min-w-[140px] px-4 py-3.5 text-base bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-colors"
            >
              ✓ Marcar cobrado
            </button>
          </>
        )}
        <button
          onClick={handleEliminar}
          aria-label="Eliminar cheque"
          className={`${
            cheque.cobrado ? 'flex-1' : 'flex-1 min-w-[110px] sm:flex-none sm:min-w-0 sm:w-auto'
          } px-4 py-3.5 text-base border-2 border-red-300 text-red-700 bg-white rounded-xl hover:bg-red-50 font-bold transition-colors`}
        >
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
}
