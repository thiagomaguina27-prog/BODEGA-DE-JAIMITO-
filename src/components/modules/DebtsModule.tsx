import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { DebtRecord, PaymentMethod } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  Receipt,
  X,
} from 'lucide-react';

export const DebtsModule: React.FC = () => {
  const { debts, clients, addDebtPayment, addDebtRecord, currentUser } = useBodega();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pendiente' | 'Vencido' | 'Pagado'>('all');

  // Payment Modal
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<DebtRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [paymentNotes, setPaymentNotes] = useState('');

  // New Debt Modal
  const [isNewDebtModalOpen, setIsNewDebtModalOpen] = useState(false);
  const [newDebtClientId, setNewDebtClientId] = useState('');
  const [newDebtAmount, setNewDebtAmount] = useState('');
  const [newDebtDays, setNewDebtDays] = useState(15);
  const [newDebtDescription, setNewDebtDescription] = useState('Víveres y abarrotes del hogar');

  const filteredDebts = debts.filter((d) => {
    const matchesSearch =
      d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Pendiente' && (d.status === 'Pendiente' || d.status === 'Parcial')) ||
      d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Totals
  const totalPorCobrar = debts
    .filter((d) => d.status !== 'Pagado')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalVencido = debts
    .filter((d) => d.status === 'Vencido')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  // Submit payment
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPayment) return;

    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0 || amount > selectedDebtForPayment.remainingAmount) {
      alert('El monto ingresado debe ser mayor a 0 y no mayor al saldo restante.');
      return;
    }

    addDebtPayment(selectedDebtForPayment.id, {
      amount,
      paymentMethod,
      receivedBy: currentUser?.fullName || 'Jaimito',
      notes: paymentNotes || 'Abono a cuenta',
    });

    setSelectedDebtForPayment(null);
    setPaymentAmount('');
    setPaymentNotes('');
  };

  // Submit new debt
  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === newDebtClientId);
    if (!client) return;

    const amount = parseFloat(newDebtAmount) || 0;
    if (amount <= 0) return;

    const dueDate = new Date(Date.now() + newDebtDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    addDebtRecord({
      clientId: client.id,
      clientName: client.name,
      dueDate,
      originalAmount: amount,
      description: newDebtDescription,
    });

    setIsNewDebtModalOpen(false);
    setNewDebtAmount('');
    setNewDebtClientId('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Libreta Digital de Fiados y Cuentas por Cobrar
          </h2>
          <p className="text-xs text-slate-500">
            Control de confianza de los caseros · Registro de abonos, fechas de vencimiento y saldos
          </p>
        </div>

        <button
          onClick={() => setIsNewDebtModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Anotar Nuevo Fiado</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Total Saldo en la Calle (Por Cobrar)</span>
          <div className="font-mono text-2xl font-bold text-amber-800">
            S/ {totalPorCobrar.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {debts.filter((d) => d.status !== 'Pagado').length} cuentas activas
          </span>
        </div>

        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Cuentas Vencidas o Urgentes</span>
          <div className="font-mono text-2xl font-bold text-rose-600">
            S/ {totalVencido.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {debts.filter((d) => d.status === 'Vencido').length} caseros con fecha límite pasada
          </span>
        </div>

        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Caseros con Crédito Activo</span>
          <div className="font-mono text-2xl font-bold text-slate-900">
            {clients.filter((c) => c.currentDebt > 0).length} de {clients.length} caseros
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            {clients.filter((c) => c.currentDebt === 0).length} caseros al día
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de casero o descripción de compra..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded font-medium ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('Pendiente')}
            className={`px-3 py-1 rounded font-medium ${
              statusFilter === 'Pendiente' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatusFilter('Vencido')}
            className={`px-3 py-1 rounded font-medium ${
              statusFilter === 'Vencido' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Vencidos
          </button>
          <button
            onClick={() => setStatusFilter('Pagado')}
            className={`px-3 py-1 rounded font-medium ${
              statusFilter === 'Pagado' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Pagados
          </button>
        </div>
      </div>

      {/* Debts Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Casero / Detalle</th>
              <th className="py-3 px-3">Fecha Anotado</th>
              <th className="py-3 px-3">Fecha Límite</th>
              <th className="py-3 px-3 text-right">Monto Original</th>
              <th className="py-3 px-3 text-right">Saldo Restante</th>
              <th className="py-3 px-3 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDebts.map((debt) => {
              const isOverdue = debt.status === 'Vencido';
              const isPaid = debt.status === 'Pagado';

              return (
                <tr key={debt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{debt.clientName}</div>
                    <div className="text-[11px] text-slate-500">{debt.description}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {debt.date}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className={isOverdue ? 'font-bold text-rose-600' : 'text-slate-700'}>
                      {debt.dueDate}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                    S/ {debt.originalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                    <span className={isPaid ? 'text-slate-400' : 'text-rose-600 text-sm'}>
                      S/ {debt.remainingAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isOverdue
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {debt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {!isPaid ? (
                      <button
                        onClick={() => {
                          setSelectedDebtForPayment(debt);
                          setPaymentAmount(debt.remainingAmount.toFixed(2));
                        }}
                        className="flex items-center gap-1 mx-auto px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Abonar</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-medium">Cancelado</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredDebts.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se encontraron registros de fiados en esta sección.
          </div>
        )}
      </div>

      {/* Modal: Registrar Abono */}
      {selectedDebtForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Registrar Abono de Fiado
                </h3>
                <span className="text-xs text-slate-500">
                  Casero: {selectedDebtForPayment.clientName}
                </span>
              </div>
              <button
                onClick={() => setSelectedDebtForPayment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 mb-3 text-xs border border-amber-200 text-amber-900">
              <div className="flex justify-between">
                <span>Saldo pendiente actual:</span>
                <strong className="font-mono text-sm">
                  S/ {selectedDebtForPayment.remainingAmount.toFixed(2)}
                </strong>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monto a Abonar (S/) *
                </label>
                <input
                  type="number"
                  step="0.50"
                  max={selectedDebtForPayment.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-base font-bold text-emerald-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Forma de Cobro
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                >
                  <option value="Efectivo">Efectivo en Tienda</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nota / Detalle
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ej. Pago parcial quincena"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDebtForPayment(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Anotar Nuevo Fiado */}
      {isNewDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Anotar Nuevo Fiado en Libreta
              </h3>
              <button
                onClick={() => setIsNewDebtModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Seleccionar Casero *
                </label>
                <select
                  value={newDebtClientId}
                  onChange={(e) => setNewDebtClientId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  required
                >
                  <option value="">-- Seleccionar cliente registrado --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Límite: S/ {c.creditLimit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monto del Fiado (S/) *
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={newDebtAmount}
                  onChange={(e) => setNewDebtAmount(e.target.value)}
                  placeholder="35.00"
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Plazo para Pagar (Días)
                </label>
                <select
                  value={newDebtDays}
                  onChange={(e) => setNewDebtDays(parseInt(e.target.value) || 15)}
                  className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                >
                  <option value="7">7 días (1 semana)</option>
                  <option value="15">15 días (Quincenal)</option>
                  <option value="30">30 días (Fin de mes)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Concepto / Mercadería
                </label>
                <input
                  type="text"
                  value={newDebtDescription}
                  onChange={(e) => setNewDebtDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDebtModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Anotar en Libreta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
