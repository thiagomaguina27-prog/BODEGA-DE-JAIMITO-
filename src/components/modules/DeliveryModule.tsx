import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { DeliveryOrder, PaymentMethod, SaleItem } from '../../types';
import {
  Bike,
  Plus,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  X,
  MessageCircle,
  Truck,
  Trash2,
} from 'lucide-react';

export const DeliveryModule: React.FC = () => {
  const {
    deliveries,
    products,
    clients,
    createDeliveryOrder,
    updateDeliveryStatus,
    employees,
  } = useBodega();

  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Delivery Form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Yape');
  const [deliveryFee, setDeliveryFee] = useState<number>(2.00);
  const [deliveryPerson, setDeliveryPerson] = useState('Carlos Andrés Paredes');
  const [notes, setNotes] = useState('');

  // Items
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);

  const deliveryPersonnel = employees.filter((e) => e.role === 'Repartidor' || e.role === 'Administrador');

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterStatus === 'Todos') return true;
    return d.status === filterStatus;
  });

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setSelectedItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        unit: prod.unit,
        quantity: itemQty,
        unitPrice: prod.salePrice,
        costPrice: prod.costPrice,
        total: itemQty * prod.salePrice,
      },
    ]);

    setSelectedProductId('');
    setItemQty(1);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const subtotalItems = selectedItems.reduce((sum, it) => sum + it.total, 0);
  const totalOrder = subtotalItems + deliveryFee;

  const handleSelectClient = (clientId: string) => {
    const cli = clients.find((c) => c.id === clientId);
    if (cli) {
      setClientName(cli.name);
      setClientPhone(cli.phone);
      setAddress(cli.address);
    }
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !address.trim() || selectedItems.length === 0) return;

    createDeliveryOrder({
      clientName,
      clientPhone,
      address,
      reference,
      items: selectedItems,
      total: totalOrder,
      paymentMethod,
      deliveryFee,
      deliveryPerson,
      status: 'Pendiente',
      notes,
    });

    setIsModalOpen(false);
    setSelectedItems([]);
    setClientName('');
    setClientPhone('');
    setAddress('');
    setReference('');
  };

  const statusColors: Record<DeliveryOrder['status'], string> = {
    Pendiente: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    'En preparación': 'bg-blue-50 text-blue-800 border-blue-200',
    'En camino': 'bg-purple-50 text-purple-800 border-purple-200',
    Entregado: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Cancelado: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  const handleNextStatus = (order: DeliveryOrder) => {
    if (order.status === 'Pendiente') updateDeliveryStatus(order.id, 'En preparación');
    else if (order.status === 'En preparación') updateDeliveryStatus(order.id, 'En camino');
    else if (order.status === 'En camino') updateDeliveryStatus(order.id, 'Entregado');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Pedidos a Domicilio y Delivery Bodeguero
          </h2>
          <p className="text-xs text-slate-500">
            Atención vecinal en Covida y alrededores · Asignación de repartidor y cobros con Yape/Efectivo
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Pedido a Domicilio</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['Todos', 'Pendiente', 'En preparación', 'En camino', 'Entregado'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st} ({st === 'Todos' ? deliveries.length : deliveries.filter((d) => d.status === st).length})
          </button>
        ))}
      </div>

      {/* Delivery Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeliveries.map((order) => (
          <div
            key={order.id}
            className="flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200 shadow-xs space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-800">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">
                    {order.clientName}
                  </h3>
                </div>

                {order.clientPhone && (
                  <a
                    href={`https://wa.me/51${order.clientPhone.replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-medium"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-800 block">{order.address}</span>
                    {order.reference && (
                      <span className="text-[11px] text-slate-400">{order.reference}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Bike className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Repartidor: <strong className="font-semibold text-slate-700">{order.deliveryPerson || 'Sin asignar'}</strong></span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="my-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] space-y-0.5">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span className="truncate">{it.quantity} {it.unit} · {it.productName}</span>
                    <span className="font-mono text-slate-900 shrink-0">S/ {it.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                  <span>Envío delivery:</span>
                  <span className="font-mono">S/ {order.deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              {order.notes && (
                <div className="text-[11px] italic text-slate-500 bg-amber-50/50 p-1.5 rounded border border-amber-100">
                  Nota: {order.notes}
                </div>
              )}
            </div>

            {/* Total and Action buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Pago: <strong className="text-slate-900">{order.paymentMethod}</strong></span>
                <span className="font-mono text-base font-extrabold text-slate-900">
                  Total: S/ {order.total.toFixed(2)}
                </span>
              </div>

              {order.status !== 'Entregado' && order.status !== 'Cancelado' && (
                <button
                  onClick={() => handleNextStatus(order)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    Avanzar a:{' '}
                    {order.status === 'Pendiente'
                      ? 'En preparación'
                      : order.status === 'En preparación'
                      ? 'En camino'
                      : 'Entregado'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredDeliveries.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No hay pedidos a domicilio en el estado seleccionado.
          </div>
        )}
      </div>

      {/* Modal: New Delivery Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Registrar Nuevo Pedido Delivery
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-3.5 text-xs">
              {/* Client Quick Picker */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cargar Datos de Casero Registrado (Opcional)
                </label>
                <select
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                >
                  <option value="">-- Seleccionar de la libreta de caseros --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Lucía Fernández"
                    className="w-full rounded-lg border border-slate-300 p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono Celular *
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="945 612 890"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dirección de Entrega *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle / Av. / Mz. y Lote"
                  className="w-full rounded-lg border border-slate-300 p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Referencia de Ubicación
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Frente al parque, rejas verdes, timbre 201"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              {/* Items Selector */}
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 block text-[11px]">
                  Productos a Enviar:
                </span>
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 rounded border border-slate-300 p-1.5 bg-white text-xs"
                  >
                    <option value="">-- Elegir producto --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - S/ {p.salePrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                    className="w-16 rounded border border-slate-300 p-1.5 font-mono text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedProductId}
                    className="px-3 py-1.5 bg-emerald-600 disabled:opacity-50 text-white rounded font-semibold"
                  >
                    + Añadir
                  </button>
                </div>

                {selectedItems.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 text-xs"
                  >
                    <span>{it.quantity} {it.unit} x {it.productName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">S/ {it.total.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Costo Delivery (S/)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Forma de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Yape">Yape</option>
                    <option value="Plin">Plin</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta POS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Repartidor Asignado
                  </label>
                  <select
                    value={deliveryPerson}
                    onChange={(e) => setDeliveryPerson(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    {deliveryPersonnel.map((e) => (
                      <option key={e.id} value={e.fullName}>
                        {e.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notas / Cambio
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Llevar vuelto para S/ 50"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">
                  Total Pedido: S/ {totalOrder.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={selectedItems.length === 0}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
