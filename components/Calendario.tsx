'use client';

import { useMemo, useState } from 'react';
import { Cheque } from '@/types/cheque';

interface Props {
  cheques: Cheque[];                       // cheques a mostrar en el calendario (pendientes)
  onSeleccionarDia: (fecha: string) => void;
}

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const NOMBRES_DIA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const pad2 = (n: number) => String(n).padStart(2, '0');

const fechaHoyISO = (): string => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${pad2(hoy.getMonth() + 1)}-${pad2(hoy.getDate())}`;
};

const formatMontoCorto = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
};

interface Celda {
  iso: string;          // YYYY-MM-DD
  dia: number;          // día del mes
  delMes: boolean;      // pertenece al mes activo
  cantidad: number;
  total: number;
}

export default function Calendario({ cheques, onSeleccionarDia }: Props) {
  const hoyISO = fechaHoyISO();
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth()); // 0..11

  // Agrupar cheques por fecha de cobro
  const porFecha = useMemo(() => {
    const map = new Map<string, { cantidad: number; total: number }>();
    for (const c of cheques) {
      const prev = map.get(c.fechaCobro) ?? { cantidad: 0, total: 0 };
      map.set(c.fechaCobro, {
        cantidad: prev.cantidad + 1,
        total: prev.total + c.monto,
      });
    }
    return map;
  }, [cheques]);

  // Generar celdas del mes (semana arranca en lunes)
  const celdas: Celda[] = useMemo(() => {
    const primerDia = new Date(anio, mes, 1);
    const diaSemanaPrimero = (primerDia.getDay() + 6) % 7; // 0=Lun..6=Dom
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const diasMesAnterior = new Date(anio, mes, 0).getDate();

    const resultado: Celda[] = [];

    // Días del mes anterior para rellenar
    for (let i = diaSemanaPrimero - 1; i >= 0; i--) {
      const d = diasMesAnterior - i;
      const mAnt = mes === 0 ? 11 : mes - 1;
      const aAnt = mes === 0 ? anio - 1 : anio;
      const iso = `${aAnt}-${pad2(mAnt + 1)}-${pad2(d)}`;
      const info = porFecha.get(iso);
      resultado.push({
        iso,
        dia: d,
        delMes: false,
        cantidad: info?.cantidad ?? 0,
        total: info?.total ?? 0,
      });
    }

    // Días del mes actual
    for (let d = 1; d <= diasEnMes; d++) {
      const iso = `${anio}-${pad2(mes + 1)}-${pad2(d)}`;
      const info = porFecha.get(iso);
      resultado.push({
        iso,
        dia: d,
        delMes: true,
        cantidad: info?.cantidad ?? 0,
        total: info?.total ?? 0,
      });
    }

    // Completar última semana con días del mes siguiente
    while (resultado.length % 7 !== 0) {
      const d = resultado.length - diaSemanaPrimero - diasEnMes + 1;
      const mSig = mes === 11 ? 0 : mes + 1;
      const aSig = mes === 11 ? anio + 1 : anio;
      const iso = `${aSig}-${pad2(mSig + 1)}-${pad2(d)}`;
      const info = porFecha.get(iso);
      resultado.push({
        iso,
        dia: d,
        delMes: false,
        cantidad: info?.cantidad ?? 0,
        total: info?.total ?? 0,
      });
    }

    return resultado;
  }, [anio, mes, porFecha]);

  // Total del mes (solo de los cheques del mes activo)
  const totalMes = useMemo(() => {
    let acum = 0;
    let cantidad = 0;
    for (const c of celdas) {
      if (c.delMes) {
        acum += c.total;
        cantidad += c.cantidad;
      }
    }
    return { total: acum, cantidad };
  }, [celdas]);

  const irMesAnterior = () => {
    if (mes === 0) {
      setMes(11);
      setAnio(anio - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const irMesSiguiente = () => {
    if (mes === 11) {
      setMes(0);
      setAnio(anio + 1);
    } else {
      setMes(mes + 1);
    }
  };

  const irHoy = () => {
    const h = new Date();
    setAnio(h.getFullYear());
    setMes(h.getMonth());
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header navegación */}
      <div className="flex items-center justify-between gap-2 p-4 bg-gray-50 border-b-2 border-gray-200">
        <button
          onClick={irMesAnterior}
          aria-label="Mes anterior"
          className="w-11 h-11 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-100 font-bold text-xl text-gray-800 flex items-center justify-center transition-colors"
        >
          ‹
        </button>
        <div className="text-center min-w-0 flex-1">
          <p className="text-xl font-bold text-gray-900 capitalize">
            {NOMBRES_MES[mes]} {anio}
          </p>
          <button
            onClick={irHoy}
            className="text-sm font-bold text-blue-700 hover:underline mt-0.5"
          >
            Ir a hoy
          </button>
        </div>
        <button
          onClick={irMesSiguiente}
          aria-label="Mes siguiente"
          className="w-11 h-11 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-100 font-bold text-xl text-gray-800 flex items-center justify-center transition-colors"
        >
          ›
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-gray-100 border-b-2 border-gray-200">
        {NOMBRES_DIA.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-sm font-bold text-gray-700 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7">
        {celdas.map((c, idx) => {
          const esHoy = c.iso === hoyISO;
          const conCheques = c.cantidad > 0;
          const clickable = conCheques || c.delMes;

          let clases = 'min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 border-r border-b border-gray-100 text-left flex flex-col transition-colors';

          if (!c.delMes) {
            clases += ' bg-gray-50 text-gray-400';
          } else if (esHoy) {
            clases += ' bg-amber-50';
          } else if (conCheques) {
            clases += ' bg-red-50 hover:bg-red-100';
          } else {
            clases += ' bg-white hover:bg-gray-50';
          }

          return (
            <button
              key={c.iso + idx}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSeleccionarDia(c.iso)}
              className={clases}
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold mb-1 ${
                  esHoy
                    ? 'bg-amber-500 text-white'
                    : c.delMes
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {c.dia}
              </span>
              {conCheques && (
                <div className="flex flex-col items-start gap-0.5 mt-auto">
                  <span className="inline-block text-[11px] sm:text-xs font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                    {c.cantidad} cheque{c.cantidad !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-red-800 truncate w-full">
                    {formatMontoCorto(c.total)}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Resumen del mes */}
      <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Total del mes
            </p>
            <p className="text-base text-gray-700 font-semibold">
              {totalMes.cantidad} cheque{totalMes.cantidad !== 1 ? 's' : ''} por cobrar
            </p>
          </div>
          <p className="text-2xl font-bold text-red-800">
            {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              maximumFractionDigits: 0,
            }).format(totalMes.total)}
          </p>
        </div>
      </div>
    </div>
  );
}
