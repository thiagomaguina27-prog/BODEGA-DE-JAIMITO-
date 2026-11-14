import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Supplier, PurchaseItem } from '../../types';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  FilePlus,
  PackagePlus,
  X,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export const SuppliersModule: React.FC = () => {
  const { suppliers, purchases, products, addSupplier, addPurchase } = useBodega();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'purchases'>('directory');

  // New Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierFormData, setSupplierFormData] = useState<{
    companyName: string;
    ruc: string;
    contactPerson: string;
    phone: string;
    email: string;
    category: string;
    address: string;
    paymentTermDays: number;
  }>({
    companyName: '',
    ruc: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: '',
    address: '',
    paymentTermDays: 7,
  });

  // New Purchase Modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Crédito Proveedor'>('Efectivo');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [purchaseQty, setPurchaseQty] = useState(12);
  const [purchaseUnitCost, setPurchaseUnitCost] = useState(3.0);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState('');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ruc.includes(searchTerm) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddSupplier = () => {
    setSupplierFormData({
      companyName: '',
      ruc: '',
      contactPerson: '',
      phone: '',
      email: '',
      category: 'Abarrotes y Bebidas',
      address: '',
      paymentTermDays: 7,
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormData.companyName.trim()) return;

    addSupplier(supplierFormData);
    setIsSupplierModalOpen(false);
  };

  const handleOpenAddPurchase = (supplier?: Supplier) => {
    if (supplier) {
      setSelectedSupplierId(supplier.id);
    } else if (suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].id);
    }
    setInvoiceNumber(`F001-${Math.floor(100000 + Math.random() * 900000)}`);
    setPurchaseItems([]);
    setPurchaseSuccessMessage('');
    setIsPurchaseModalOpen(true);
  };

  const handleAddItemToPurchase = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const newItem: PurchaseItem = {
      productId: prod.id,
      productName: prod.name,
      quantity: purchaseQty,
      unitCost: purchaseUnitCost,
      total: purchaseQty * purchaseUnitCost,
    };

    setPurchaseItems((prev) => [...prev, newItem]);
    setSelectedProductId('');
    setPurchaseQty(12);
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalPurchase = purchaseItems.reduce((sum, it) => sum + it.total, 0);

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    if (!sup || purchaseItems.length === 0) return;

    addPurchase({
      invoiceNumber,
      supplierId: sup.id,
      supplierName: sup.companyName,
      items: purchaseItems,
      total: totalPurchase,
      paymentMethod,
      status: 'Recibido',
      notes: 'Ingreso directo al almacén de la bodega.',
    });

    setPurchaseSuccessMessage(
      `¡Compra registrada! Se incrementó el stock de ${purchaseItems.length} productos y se registró el egreso de S/ ${totalPurchase.toFixed(2)}.`
    );

    setTimeout(() => {
      setIsPurchaseModalOpen(false);
      setActiveTab('purchases');
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Proveedores y Compras de Mercadería
          </h2>
          <p className="text-xs text-slate-500">
            {suppliers.length} distribuidores oficiales · Abastecimiento directo con incremento automático de stock
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAddPurchase()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <PackagePlus className="h-4 w-4" />
            <span>Registrar Compra</span>
          </button>
          <button
            onClick={handleOpenAddSupplier}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-3 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'directory'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Directorio de Proveedores ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-3 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'purchases'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Historial de Facturas y Compras ({purchases.length})
        </button>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Search */}
          <div className="relative bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <Search className="absolute left-6 top-5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por empresa proveedora, RUC o rubro (Alicorp, Gloria, Backus...)"
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Supplier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs shrink-0 border border-emerald-100">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">
                          {supplier.companyName}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400">
                          RUC: {supplier.ruc}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{supplier.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{supplier.contactPerson} ({supplier.phone})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Crédito: {supplier.paymentTermDays === 0 ? 'Al contado' : `${supplier.paymentTermDays} días`}
                  </span>
                  <button
                    onClick={() => handleOpenAddPurchase(supplier)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors"
                  >
                    <PackagePlus className="h-3.5 w-3.5" />
                    <span>Registrar Compra</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Purchases History Table */
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Factura / Fecha</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4">Ítems Abastecidos</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
                <th className="py-3 px-4">Forma de Pago</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{purchase.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(purchase.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {purchase.supplierName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="space-y-0.5">
                      {purchase.items.map((it, idx) => (
                        <div key={idx} className="text-[11px]">
                          {it.quantity} x {it.productName} (S/ {it.unitCost.toFixed(2)})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    S/ {purchase.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {purchase.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Registrar Nuevo Proveedor
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Razón Social / Distribuidora *
                </label>
                <input
                  type="text"
                  value={supplierFormData.companyName}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, companyName: e.target.value })}
                  placeholder="Ej. Distribuidora Gloria S.A."
                  className="w-full rounded-lg border border-slate-300 p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    RUC (11 dígitos) *
                  </label>
                  <input
                    type="text"
                    value={supplierFormData.ruc}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, ruc: e.target.value })}
                    placeholder="20100055237"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rubro de Suministros
                  </label>
                  <input
                    type="text"
                    value={supplierFormData.category}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, category: e.target.value })}
                    placeholder="Lácteos, Abarrotes..."
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    value={supplierFormData.contactPerson}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, contactPerson: e.target.value })}
                    placeholder="Renato Preventista"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={supplierFormData.phone}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                    placeholder="994 881 200"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={supplierFormData.address}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
                  placeholder="Av. Argentina 4793, Callao"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Purchase / Restock Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Registrar Compra y Entrada de Mercadería
                </h3>
                <p className="text-xs text-slate-500">
                  Incrementa stock automáticamente en inventario y deduce egreso en finanzas
                </p>
              </div>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {purchaseSuccessMessage && (
              <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{purchaseSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSavePurchase} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Proveedor *
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    N° de Factura / Guía *
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Add item to purchase subform */}
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Seleccionar Producto a Abastecer:
                </span>
                <div>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedProductId(id);
                      const prod = products.find((p) => p.id === id);
                      if (prod) setPurchaseUnitCost(prod.costPrice);
                    }}
                    className="w-full rounded border border-slate-300 p-1.5 bg-white text-xs"
                  >
                    <option value="">-- Seleccionar producto del catálogo --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock actual: {p.stock} {p.unit}s)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Cantidad a ingresar
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={purchaseQty}
                      onChange={(e) => setPurchaseQty(parseInt(e.target.value) || 1)}
                      className="w-full rounded border border-slate-300 p-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Costo Unitario (S/)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={purchaseUnitCost}
                      onChange={(e) => setPurchaseUnitCost(parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-slate-300 p-1.5 font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={!selectedProductId}
                      onClick={handleAddItemToPurchase}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded font-medium"
                    >
                      + Añadir a Lista
                    </button>
                  </div>
                </div>
              </div>

              {/* Items in this purchase */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 block">
                  Ítems a recibir ({purchaseItems.length}):
                </span>
                {purchaseItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-white border border-slate-200"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{item.productName}</span>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        +{item.quantity} unid · S/ {item.unitCost.toFixed(2)} c/u
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        S/ {item.total.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {purchaseItems.length === 0 && (
                  <div className="py-4 text-center text-slate-400 border border-dashed border-slate-200 rounded">
                    Aún no ha añadido ítems a la factura.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Forma de Pago del Egreso
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Efectivo">Efectivo de Caja</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Crédito Proveedor">Crédito del Proveedor</option>
                  </select>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <span className="text-slate-500 text-[11px]">Total Factura:</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">
                    S/ {totalPurchase.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={purchaseItems.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50"
                >
                  Confirmar Entrada de Mercadería
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
