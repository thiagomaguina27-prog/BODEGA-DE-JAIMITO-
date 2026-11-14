import React, { useState, useMemo } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { CashMovement, PaymentMethod } from '../../types';
import {
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Plus,
  Lock,
  Unlock,
  AlertCircle,
  X,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

export const CashFinancesModule: React.FC = () => {
  const {
    cashRegister,
    cashMovements,
    openCashRegister,
    closeCashRegister,
    addCashMovement,
    sales,
    currentUser,
  } = useBodega();

  // Modals
  const [isOpenRegisterModalOpen, setIsOpenRegisterModalOpen] = useState(false);
  const [isCloseRegisterModalOpen, setIsCloseRegisterModalOpen] = useState(false);
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);

  // Forms
  const [initialAmountInput, setInitialAmountInput] = useState('150.00');
  const [countedAmountInput, setCountedAmountInput] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  const [movementForm, setMovementForm] = useState<{
    type: 'Ingreso' | 'Egreso';
    category: CashMovement['category'];
    description: string;
    amount: number;
    paymentMethod: PaymentMethod | 'Transferencia';
  }>({
    type: 'Egreso',
    category: 'Gasto Operativo',
    description: '',
    amount: 15.00,
    paymentMethod: 'Efectivo',
  });

  // Calculate totals
  const totalIngresos = useMemo(() => {
    return cashMovements
      .filter((m) => m.type === 'Ingreso')
      .reduce((sum, m) => sum + m.amount, 0);
  }, [cashMovements]);

  const totalEgresos = useMemo(() => {
    return cashMovements
      .filter((m) => m.type === 'Egreso')
      .reduce((sum, m) => sum + m.amount, 0);
  }, [cashMovements]);

  const saldoEnCajaEfectivo = useMemo(() => {
    const cashIn = cashMovements
      .filter((m) => m.type === 'Ingreso' && m.paymentMethod === 'Efectivo')
      .reduce((sum, m) => sum + m.amount, 0);
    const cashOut = cashMovements
      .filter((m) => m.type === 'Egreso' && m.paymentMethod === 'Efectivo')
      .reduce((sum, m) => sum + m.amount, 0);
    return cashIn - cashOut;
  }, [cashMovements]);

  // Total sales net profit
  const totalVentasGananciaNeta = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.netProfit, 0);
  }, [sales]);

  // Open Register
  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(initialAmountInput) || 0;
    openCashRegister(val, 'Apertura de turno');
    setIsOpenRegisterModalOpen(false);
  };

  // Close Register
  const handleCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(countedAmountInput) || 0;
    closeCashRegister(val, closingNotes);
    setIsCloseRegisterModalOpen(false);
  };

  // Save Manual Movement
  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementForm.description.trim() || movementForm.amount <= 0) return;

    addCashMovement({
      ...movementForm,
      registeredBy: currentUser?.fullName || 'Jaimito',
    });
    setIsNewMovementModalOpen(false);
    setMovementForm({
      type: 'Egreso',
      category: 'Gasto Operativo',
      description: '',
      amount: 10.0,
      paymentMethod: 'Efectivo',
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Control de Caja y Finanzas
          </h2>
          <p className="text-xs text-slate-500">
            Estado de caja: <strong className="font-semibold">{cashRegister.isOpen ? 'Abierta' : 'Cerrada'}</strong> · Arqueos, egresos operativos y flujo de dinero
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewMovementModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Movimiento</span>
          </button>

          {cashRegister.isOpen ? (
            <button
              onClick={() => {
                setCountedAmountInput(saldoEnCajaEfectivo.toFixed(2));
                setIsCloseRegisterModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all"
            >
              <Lock className="h-3.5 w-3.5 text-yellow-400" />
              <span>Cierre de Caja (Arqueo)</span>
            </button>
          ) : (
            <button
              onClick={() => setIsOpenRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all"
            >
              <Unlock className="h-3.5 w-3.5 text-yellow-300" />
              <span>Apertura de Caja</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo en Efectivo Físico */}
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Efectivo Físico en Caja</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            S/ {saldoEnCajaEfectivo.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Monto disponible en gaveta
          </div>
        </div>

        {/* Card 2: Ingresos Totales */}
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Ingresos Brutos</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            S/ {totalIngresos.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ventas + cobro de fiados
          </div>
        </div>

        {/* Card 3: Total Egresos */}
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Egresos y Gastos</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-rose-600 tabular-nums">
            S/ {totalEgresos.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Compras de mercadería + gastos
          </div>
        </div>

        {/* Card 4: Ganancia Neta Calculada */}
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Ganancia Neta Estimada</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-amber-900 tabular-nums">
            S/ {totalVentasGananciaNeta.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Margen neto tras costo de reposición
          </div>
        </div>
      </div>

      {/* Discrepancy Alert if closed with difference */}
      {!cashRegister.isOpen && cashRegister.difference !== undefined && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            cashRegister.difference === 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : cashRegister.difference > 0
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold block">
                Último Cierre de Caja ({new Date(cashRegister.closedAt || '').toLocaleDateString('es-PE')})
              </span>
              <span>
                Esperado: S/ {cashRegister.expectedAmount?.toFixed(2)} · Contado: S/{' '}
                {cashRegister.actualAmount?.toFixed(2)} · Diferencia:{' '}
                <strong className="font-mono">
                  {cashRegister.difference > 0 ? '+' : ''}S/{' '}
                  {cashRegister.difference?.toFixed(2)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Movements Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            Libro de Movimientos de Dinero ({cashMovements.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Registro cronológico en tiempo real
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-4">Fecha / Hora</th>
                <th className="py-2.5 px-4">Tipo</th>
                <th className="py-2.5 px-4">Categoría</th>
                <th className="py-2.5 px-4">Descripción</th>
                <th className="py-2.5 px-4">Método</th>
                <th className="py-2.5 px-4 text-right">Monto (S/)</th>
                <th className="py-2.5 px-4">Registrado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashMovements.map((mov) => {
                const isIncome = mov.type === 'Ingreso';

                return (
                  <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(mov.date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })}{' '}
                      {new Date(mov.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[10px] px-2 py-0.5 rounded ${
                          isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {mov.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-700">
                      {mov.category}
                    </td>
                    <td className="py-2.5 px-4 text-slate-900">
                      {mov.description}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                      {mov.paymentMethod}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums ${
                        isIncome ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} S/ {mov.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {mov.registeredBy}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Apertura de Caja */}
      {isOpenRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Apertura de Caja de Turno
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingrese el monto en efectivo (sencillo / monedas) con el que se inicia la atención.
            </p>

            <form onSubmit={handleOpenRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monto Inicial en Efectivo (S/) *
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={initialAmountInput}
                  onChange={(e) => setInitialAmountInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-base font-bold text-emerald-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenRegisterModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Abrir Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cierre de Caja */}
      {isCloseRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Cierre de Caja y Arqueo
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Efectivo teórico calculado según el sistema: <strong className="font-mono text-slate-800">S/ {saldoEnCajaEfectivo.toFixed(2)}</strong>
            </p>

            <form onSubmit={handleCloseRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monto Físico Contado en Gaveta (S/) *
                </label>
                <input
                  type="number"
                  step="0.10"
                  value={countedAmountInput}
                  onChange={(e) => setCountedAmountInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-base font-bold text-slate-900"
                  required
                />
              </div>

              {countedAmountInput && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                  <span>Diferencia de Caja:</span>
                  <span
                    className={`font-mono font-bold ${
                      parseFloat(countedAmountInput) - saldoEnCajaEfectivo === 0
                        ? 'text-emerald-700'
                        : 'text-rose-600'
                    }`}
                  >
                    S/ {(parseFloat(countedAmountInput) - saldoEnCajaEfectivo).toFixed(2)}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observaciones de Cierre
                </label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Turno completado sin novedad..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseRegisterModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  Finalizar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Movimiento Manual */}
      {isNewMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Registrar Movimiento de Caja
              </h3>
              <button
                onClick={() => setIsNewMovementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Movimiento
                  </label>
                  <select
                    value={movementForm.type}
                    onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white font-bold"
                  >
                    <option value="Egreso">Egreso / Gasto</option>
                    <option value="Ingreso">Ingreso Extra</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={movementForm.category}
                    onChange={(e) => setMovementForm({ ...movementForm, category: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Gasto Operativo">Gasto Operativo (Bolsas, limpieza)</option>
                    <option value="Pago Servicios">Pago Servicios (Luz, agua)</option>
                    <option value="Sueldo Empleado">Pago de Personal</option>
                    <option value="Ajuste de Caja">Ajuste / Retiro Dueño</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción o Concepto *
                </label>
                <input
                  type="text"
                  value={movementForm.description}
                  onChange={(e) => setMovementForm({ ...movementForm, description: e.target.value })}
                  placeholder="Ej. Compra de bolsas plásticas x ciento"
                  className="w-full rounded-lg border border-slate-300 p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Monto (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={movementForm.amount}
                    onChange={(e) => setMovementForm({ ...movementForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Método
                  </label>
                  <select
                    value={movementForm.paymentMethod}
                    onChange={(e) => setMovementForm({ ...movementForm, paymentMethod: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Yape">Yape</option>
                    <option value="Plin">Plin</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewMovementModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
