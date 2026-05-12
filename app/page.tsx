'use client';

import { useEffect, useState } from 'react';
import { Cheque } from '@/types/cheque';
import { suscribirCheques, autoMarcarCobrados } from '@/lib/cheques';
import ModalCheque from '@/components/ModalCheque';
import TarjetaCheque from '@/components/TarjetaCheque';

type Pestana = 'por-cobrar' | 'cobrados' | 'todos';

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

export default function Home() {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [pestana, setPestana] = useState<Pestana>('por-cobrar');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [chequeEditar, setChequeEditar] = useState<Cheque | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = suscribirCheques(async (datos) => {
      await autoMarcarCobrados(datos);
      setCheques(datos);
      setCargando(false);
    });
    return unsub;
  }, []);

  const pendientes = cheques.filter((c) => !c.cobrado);
  const cobrados = cheques.filter((c) => c.cobrado);

  const totalPendiente = pendientes.reduce((s, c) => s + c.monto, 0);
  const totalCobrado = cobrados.reduce((s, c) => s + c.monto, 0);

  const porFecha = pendientes.reduce<Record<string, Cheque[]>>((acc, c) => {
    if (!acc[c.fechaCobro]) acc[c.fechaCobro] = [];
    acc[c.fechaCobro].push(c);
    return acc;
  }, {});

  const fechasOrdenadas = Object.keys(porFecha).sort();

  const listaActual =
    pestana === 'por-cobrar' ? pendientes : pestana === 'cobrados' ? cobrados : cheques;

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
                {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''} ·{' '}
                {formatMonto(totalPendiente)}
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
              { id: 'por-cobrar', label: `Por cobrar`, count: pendientes.length },
              { id: 'cobrados', label: `Cobrados`, count: cobrados.length },
              { id: 'todos', label: `Todos`, count: cheques.length },
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
        {/* === POR COBRAR === */}
        {pestana === 'por-cobrar' && (
          <div>
            {pendientes.length === 0 ? (
              <EmptyState
                emoji="🎉"
                titulo="Todo al día"
                subtitulo="No hay cheques pendientes de cobro"
              />
            ) : (
              <div className="space-y-7">
                {fechasOrdenadas.map((fecha) => {
                  const grupo = porFecha[fecha];
                  const totalGrupo = grupo.reduce((s, c) => s + c.monto, 0);
                  return (
                    <div key={fecha}>
                      {/* Date header */}
                      <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📅</span>
                          <div>
                            <p className="font-bold text-gray-900 text-xl leading-tight">
                              {formatFecha(fecha)}
                            </p>
                            <p className="text-gray-600 text-base">
                              {grupo.length} cheque{grupo.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-700 font-semibold">Sale del banco</p>
                          <p className="font-bold text-red-700 text-xl">
                            {formatMonto(totalGrupo)}
                          </p>
                        </div>
                      </div>
                      {/* Cards */}
                      <div className="space-y-3">
                        {grupo.map((c) => (
                          <TarjetaCheque key={c.id} cheque={c} onEditar={abrirEditar} />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Segmented total */}
                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 mt-4">
                  <p className="text-xl text-red-800 font-bold text-center mb-4">
                    Dinero por salir del banco
                  </p>
                  <ul className="divide-y-2 divide-red-200">
                    {fechasOrdenadas.map((fecha) => {
                      const total = porFecha[fecha].reduce((s, c) => s + c.monto, 0);
                      const cantidad = porFecha[fecha].length;
                      return (
                        <li
                          key={fecha}
                          className="flex items-center justify-between py-3.5 gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-red-900 text-xl">
                              {formatFecha(fecha)}
                            </p>
                            <p className="text-base text-red-700 font-medium">
                              {cantidad} cheque{cantidad !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <p className="font-bold text-red-800 text-2xl">{formatMonto(total)}</p>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="border-t-4 border-red-400 mt-3 pt-4 flex items-center justify-between">
                    <p className="text-xl font-bold text-red-900">Total</p>
                    <p className="text-3xl font-bold text-red-800">
                      {formatMonto(totalPendiente)}
                    </p>
                  </div>
                </div>
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
                subtitulo="Acá aparecerán los cheques que ya fueron cobrados"
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

        {/* === TODOS === */}
        {pestana === 'todos' && (
          <div>
            {cheques.length === 0 ? (
              <EmptyState
                emoji="📂"
                titulo="Sin cheques registrados"
                subtitulo='Tocá "Nuevo cheque" para empezar'
              />
            ) : (
              <div className="space-y-3">
                {listaActual.map((c) => (
                  <TarjetaCheque key={c.id} cheque={c} onEditar={abrirEditar} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
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
