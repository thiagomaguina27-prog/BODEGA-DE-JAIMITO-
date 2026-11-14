import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Client, Sale } from '../../types';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  CreditCard,
  History,
  X,
  Edit2,
  Receipt,
  FileText,
} from 'lucide-react';

export const ClientsModule: React.FC = () => {
  const { clients, sales, addClient, updateClient, setActiveModule } = useBodega();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    docType: Client['docType'];
    docNumber: string;
    phone: string;
    address: string;
    creditLimit: number;
    notes: string;
  }>({
    name: '',
    docType: 'DNI',
    docNumber: '',
    phone: '',
    address: '',
    creditLimit: 100.0,
    notes: '',
  });

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.docNumber.includes(searchTerm)
    );
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      docType: 'DNI',
      docNumber: '',
      phone: '',
      address: '',
      creditLimit: 120.0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      docType: client.docType,
      docNumber: client.docNumber,
      phone: client.phone,
      address: client.address,
      creditLimit: client.creditLimit,
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    setIsModalOpen(false);
  };

  // Get purchases for history modal
  const clientPurchases = selectedClientForHistory
    ? sales.filter((s) => s.clientId === selectedClientForHistory.id || s.clientName === selectedClientForHistory.name)
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Directorio de Clientes Caseros
          </h2>
          <p className="text-xs text-slate-500">
            {clients.length} clientes registrados · Control de límites de crédito y libreta de fiados
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Nuevo Casero</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <Search className="absolute left-6 top-5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente por nombre, DNI o teléfono..."
          className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
        />
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const hasDebt = client.currentDebt > 0;

          return (
            <div
              key={client.id}
              className="flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-slate-300 shadow-xs transition-all space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {client.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {client.docType}: {client.docNumber || 'S/D'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(client)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Editar datos"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{client.phone || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address || 'Los Olivos, Lima'}</span>
                  </div>
                  {client.notes && (
                    <div className="text-[11px] italic text-slate-400 pt-1 line-clamp-2">
                      "{client.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Debt & Credit balance */}
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500">Saldo Pendiente (Fiado):</span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      hasDebt ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    S/ {client.currentDebt.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Límite de crédito:</span>
                  <span className="font-mono">S/ {client.creditLimit.toFixed(2)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setSelectedClientForHistory(client)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Historial ({sales.filter(s => s.clientId === client.id || s.clientName === client.name).length})</span>
                </button>
                {hasDebt && (
                  <button
                    onClick={() => setActiveModule('fiados')}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Ver Fiado</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* History Modal */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Historial de Compras de {selectedClientForHistory.name}
                </h3>
                <span className="text-xs text-slate-500">
                  Total de compras registradas: {clientPurchases.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedClientForHistory(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {clientPurchases.map((sale) => (
                <div
                  key={sale.id}
                  className="rounded-lg border border-slate-200 p-3 bg-slate-50 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-emerald-800">
                      {sale.correlative}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(sale.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-[11px] text-slate-600">
                    {sale.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.quantity} {it.unit} x {it.productName}</span>
                        <span className="font-mono">S/ {it.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 font-semibold">
                    <span className="text-slate-500">Pago: {sale.paymentMethod}</span>
                    <span className="font-mono text-slate-900">Total: S/ {sale.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              {clientPurchases.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No hay compras registradas a nombre de este cliente aún.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingClient ? 'Editar Datos del Cliente' : 'Registrar Nuevo Casero'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo / Casero *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Don Carlos Benites"
                  className="w-full rounded-lg border border-slate-300 p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Doc.
                  </label>
                  <select
                    value={formData.docType}
                    onChange={(e) => setFormData({ ...formData, docType: e.target.value as Client['docType'] })}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="Sin Documento">S/D</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Número de Documento
                  </label>
                  <input
                    type="text"
                    value={formData.docNumber}
                    onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                    placeholder="08745210"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="987 654 321"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Límite Crédito (S/)
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dirección o Referencia
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Av. Las Palmeras 412, Covida"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notas / Observaciones
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Vecino de confianza, paga quincenalmente..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
