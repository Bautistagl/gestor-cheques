'use client';

import { useEffect, useMemo, useState } from 'react';
import { Cheque } from '@/types/cheque';
import { suscribirCheques, autoMarcarVencidos, getEstado } from '@/lib/cheques';
import ModalCheque from '@/components/ModalCheque';
import TarjetaCheque from '@/components/TarjetaCheque';
import Calendario from '@/components/Calendario';
import ModalDia from '@/components/ModalDia';

type Pestana = 'calendario' | 'cobrados' | 'vencidos';

const formatMonto = (n: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(n);

export default function Home() {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [pestana, setPestana] = useState<Pestana>('calendario');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [chequeEditar, setChequeEditar] = useState<Cheque | null>(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = suscribirCheques(async (datos) => {
      // Auto-marcar vencidos (NO se marca nada como cobrado automáticamente)
      await autoMarcarVencidos(datos);
      setCheques(datos);
      setCargando(false);
    });
    return unsub;
  }, []);

  // Clasificar cheques según estado efectivo
  const { pendientes, cobrados, vencidos } = useMemo(() => {
    const pendientes: Cheque[] = [];
    const cobrados: Cheque[] = [];
    const vencidos: Cheque[] = [];
    for (const c of cheques) {
      const e = getEstado(c);
      if (e === 'cobrado') cobrados.push(c);
      else if (e === 'vencido') vencidos.push(c);
      else pendientes.push(c);
    }
    return { pendientes, cobrados, vencidos };
  }, [cheques]);

  const totalPendiente = pendientes.reduce((s, c) => s + c.monto, 0);
  const totalCobrado = cobrados.reduce((s, c) => s + c.monto, 0);
  const totalVencido = vencidos.reduce((s, c) => s + c.monto, 0);

  const chequesDelDia = useMemo(() => {
    if (!diaSeleccionado) return [];
    return pendientes
      .filter((c) => c.fechaCobro === diaSeleccionado)
      .sort((a, b) => b.monto - a.monto);
  }, [pendientes, diaSeleccionado]);

  const abrirEditar = (cheque: Cheque) => {
    setChequeEditar(cheque);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setChequeEditar(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-700 font-semibold text-lg">Cargando cheques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">Gestor de Cheques</h1>
            {pendientes.length > 0 && (
              <p className="text-blue-50 text-base mt-1 font-semibold">
                {pendientes.length} por cobrar · {formatMonto(totalPendiente)}
              </p>
            )}
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="shrink-0 bg-white text-blue-700 px-5 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md text-base"
          >
            + Nuevo cheque
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-gray-200 p-1.5 rounded-2xl">
          {(
            [
              { id: 'calendario', label: 'Calendario', count: pendientes.length },
              { id: 'cobrados', label: 'Cobrados', count: cobrados.length },
              { id: 'vencidos', label: 'Vencidos', count: vencidos.length },
            ] as { id: Pestana; label: string; count: number }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPestana(tab.id)}
              className={`flex-1 px-2 py-3 rounded-xl text-base font-bold transition-colors ${
                pestana === tab.id
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {tab.label}{' '}
              <span
                className={`text-sm font-bold ${
                  pestana === tab.id ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-12">
        {/* === CALENDARIO === */}
        {pestana === 'calendario' && (
          <div className="space-y-5">
            <Calendario
              cheques={pendientes}
              onSeleccionarDia={(f) => setDiaSeleccionado(f)}
            />

            {pendientes.length === 0 && (
              <EmptyState
                emoji="🎉"
                titulo="Todo al día"
                subtitulo="No hay cheques pendientes de cobro"
              />
            )}

            {pendientes.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5">
                <p className="text-lg text-red-800 font-bold text-center">
                  Total por cobrar
                </p>
                <p className="text-3xl font-bold text-red-800 text-center mt-2">
                  {formatMonto(totalPendiente)}
                </p>
                <p className="text-base text-red-700 font-semibold text-center mt-1">
                  Tocá un día del calendario para ver el detalle
                </p>
              </div>
            )}
          </div>
        )}

        {/* === COBRADOS === */}
        {pestana === 'cobrados' && (
          <div>
            {cobrados.length === 0 ? (
              <EmptyState
                emoji="📋"
                titulo="Sin cheques cobrados"
                subtitulo='Marcá un cheque como "cobrado" cuando lo confirmes manualmente'
              />
            ) : (
              <div className="space-y-3">
                {cobrados.map((c) => (
                  <TarjetaCheque key={c.id} cheque={c} onEditar={abrirEditar} />
                ))}
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 text-center mt-4">
                  <p className="text-xl text-green-900 font-bold">Total cobrado</p>
                  <p className="text-4xl font-bold text-green-800 mt-2">
                    {formatMonto(totalCobrado)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === VENCIDOS === */}
        {pestana === 'vencidos' && (
          <div>
            {vencidos.length === 0 ? (
              <EmptyState
                emoji="✅"
                titulo="Sin cheques vencidos"
                subtitulo="Acá aparecen los cheques cuya fecha pasó y no fueron marcados como cobrados"
              />
            ) : (
              <div className="space-y-3">
                {vencidos.map((c) => (
                  <TarjetaCheque key={c.id} cheque={c} onEditar={abrirEditar} />
                ))}
                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-center mt-4">
                  <p className="text-xl text-red-900 font-bold">Total vencido</p>
                  <p className="text-4xl font-bold text-red-800 mt-2">
                    {formatMonto(totalVencido)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de día */}
      {diaSeleccionado && (
        <ModalDia
          fecha={diaSeleccionado}
          cheques={chequesDelDia}
          onCerrar={() => setDiaSeleccionado(null)}
          onEditar={(c) => {
            setDiaSeleccionado(null);
            abrirEditar(c);
          }}
        />
      )}

      {/* Modal de cheque (alta/edición) */}
      {modalAbierto && <ModalCheque cheque={chequeEditar} onCerrar={cerrarModal} />}
    </div>
  );
}

function EmptyState({
  emoji,
  titulo,
  subtitulo,
}: {
  emoji: string;
  titulo: string;
  subtitulo: string;
}) {
  return (
    <div className="text-center py-20">
      <div className="text-7xl mb-4">{emoji}</div>
      <h3 className="text-2xl font-bold text-gray-800">{titulo}</h3>
      <p className="text-gray-600 text-lg mt-2">{subtitulo}</p>
    </div>
  );
}
