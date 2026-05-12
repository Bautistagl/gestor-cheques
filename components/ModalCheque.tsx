'use client';

import { useState, useEffect } from 'react';
import { Cheque, ChequeFormData } from '@/types/cheque';
import { agregarCheque, actualizarCheque } from '@/lib/cheques';

interface Props {
  cheque?: Cheque | null;
  onCerrar: () => void;
}

const fechaHoyISO = (): string => {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const FORM_INICIAL: ChequeFormData = {
  fechaCreacion: fechaHoyISO(),
  fechaCobro: '',
  empresa: '',
  monto: 0,
};

const INPUT_CLASS =
  'w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-gray-900 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition';

const LABEL_CLASS = 'block text-base font-bold text-gray-800 mb-2';

export default function ModalCheque({ cheque, onCerrar }: Props) {
  const [form, setForm] = useState<ChequeFormData>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cheque) {
      setForm({
        fechaCreacion: cheque.fechaCreacion,
        fechaCobro: cheque.fechaCobro,
        empresa: cheque.empresa,
        monto: cheque.monto,
      });
    } else {
      setForm({ ...FORM_INICIAL, fechaCreacion: fechaHoyISO() });
    }
  }, [cheque]);

  const validar = (): boolean => {
    if (!form.empresa.trim()) {
      setError('Ingresá el nombre de la empresa');
      return false;
    }
    if (!form.fechaCobro) {
      setError('Ingresá la fecha de cobro');
      return false;
    }
    if (!form.monto || form.monto <= 0) {
      setError('El monto debe ser mayor a $0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validar()) return;

    setGuardando(true);
    try {
      if (cheque) {
        await actualizarCheque(cheque.id, form);
      } else {
        await agregarCheque(form);
      }
      onCerrar();
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.');
      setGuardando(false);
    }
  };

  const set = (campo: keyof ChequeFormData, valor: string | number) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b-2 border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {cheque ? 'Editar cheque' : 'Nuevo cheque'}
          </h2>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-gray-500 hover:text-gray-800 text-4xl leading-none w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className={LABEL_CLASS}>Empresa / A quién se le hizo el cheque</label>
            <input
              type="text"
              value={form.empresa}
              onChange={(e) => set('empresa', e.target.value)}
              placeholder="Ej: Distribuidora López"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Monto del cheque ($)</label>
            <input
              type="number"
              value={form.monto || ''}
              onChange={(e) => set('monto', parseFloat(e.target.value) || 0)}
              placeholder="Ej: 150000"
              min="0.01"
              step="0.01"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Fecha de creación</label>
            <input
              type="date"
              value={form.fechaCreacion}
              onChange={(e) => set('fechaCreacion', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Fecha de cobro</label>
            <input
              type="date"
              value={form.fechaCobro}
              onChange={(e) => set('fechaCobro', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3">
              <p className="text-red-800 text-base font-bold">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-4 border-2 border-gray-300 text-gray-800 rounded-xl hover:bg-gray-50 font-bold text-base transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-4 py-4 bg-blue-700 text-white rounded-xl hover:bg-blue-800 font-bold text-base transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : cheque ? 'Guardar cambios' : 'Agregar cheque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
