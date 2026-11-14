import React, { useState, useMemo } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Product, ProductCategory } from '../../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  X,
  Check,
  TrendingUp,
  Tag,
} from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useBodega();

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'expiring'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    category: ProductCategory;
    unit: Product['unit'];
    stock: number;
    minStock: number;
    costPrice: number;
    salePrice: number;
    expirationDate: string;
    barcode: string;
  }>({
    code: '',
    name: '',
    category: 'Abarrotes',
    unit: 'unid',
    stock: 10,
    minStock: 5,
    costPrice: 2.00,
    salePrice: 3.00,
    expirationDate: '',
    barcode: '',
  });

  const categories: ProductCategory[] = [
    'Abarrotes',
    'Bebidas y Licores',
    'Lácteos y Embutidos',
    'Snacks y Golosinas',
    'Limpieza y Aseo',
    'Frutas y Verduras',
    'Panadería',
    'Cuidado Personal',
  ];

  // Expiration helper
  const getExpirationStatus = (expDate?: string) => {
    if (!expDate) return { label: 'Sin fecha', status: 'none', color: 'text-slate-400' };
    const now = new Date();
    const exp = new Date(expDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { label: `Vencido (${Math.abs(diffDays)}d)`, status: 'expired', color: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (diffDays <= 15) {
      return { label: `Por vencer (${diffDays}d)`, status: 'warning', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: `Óptimo (${expDate})`, status: 'ok', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm));

      const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;

      let matchesStatus = true;
      if (statusFilter === 'low_stock') {
        matchesStatus = p.stock <= p.minStock;
      } else if (statusFilter === 'expiring') {
        const expStatus = getExpirationStatus(p.expirationDate);
        matchesStatus = expStatus.status === 'warning' || expStatus.status === 'expired';
      }

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, statusFilter]);

  // Open modal for new product
  const handleOpenAddModal = () => {
    const nextCode = `PROD-${String(products.length + 1).padStart(3, '0')}`;
    setFormData({
      code: nextCode,
      name: '',
      category: 'Abarrotes',
      unit: 'unid',
      stock: 12,
      minStock: 5,
      costPrice: 3.00,
      salePrice: 4.20,
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      barcode: `7750${Math.floor(100000000 + Math.random() * 900000000)}`,
    });
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      unit: product.unit,
      stock: product.stock,
      minStock: product.minStock,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      expirationDate: product.expirationDate || '',
      barcode: product.barcode || '',
    });
    setIsModalOpen(true);
  };

  // Save product form
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  // Quick Stock Adjustment (+1 / -1)
  const handleQuickStockChange = (productId: string, delta: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const newStock = Math.max(0, target.stock + delta);
    updateProduct(productId, { stock: newStock });
  };

  return (
    <div className="space-y-5">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Catálogo y Control de Mercadería
          </h2>
          <p className="text-xs text-slate-500">
            Total en catálogo: <strong className="font-semibold text-slate-800">{products.length} productos</strong> · Gestión de costos, precios y alertas de vencimiento
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Producto Nuevo</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, código de producto o código de barras..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
          />
        </div>

        {/* Category Dropdown */}
        <div className="md:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
          >
            <option value="Todas">Todas las categorías ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Quick Filter */}
        <div className="md:col-span-3 flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-1 rounded font-medium transition-colors text-center ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('low_stock')}
            className={`flex-1 py-1 rounded font-medium transition-colors text-center ${
              statusFilter === 'low_stock' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bajo Stock
          </button>
          <button
            onClick={() => setStatusFilter('expiring')}
            className={`flex-1 py-1 rounded font-medium transition-colors text-center ${
              statusFilter === 'expiring' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vencimientos
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Código / Producto</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3 text-center">Stock Actual</th>
              <th className="py-3 px-3 text-right">Costo (S/)</th>
              <th className="py-3 px-3 text-right">Venta (S/)</th>
              <th className="py-3 px-3 text-right">Margen</th>
              <th className="py-3 px-3">Vencimiento</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock <= p.minStock;
              const isOut = p.stock <= 0;
              const profitMargin = p.salePrice - p.costPrice;
              const profitPercent = p.costPrice > 0 ? (profitMargin / p.costPrice) * 100 : 0;
              const expStatus = getExpirationStatus(p.expirationDate);

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name & Code */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>Cód: {p.code}</span>
                      {p.barcode && <span>· Barras: {p.barcode}</span>}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {p.category}
                  </td>

                  {/* Stock with quick buttons */}
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleQuickStockChange(p.id, -1)}
                        className="h-5 w-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold"
                        title="Restar 1"
                      >
                        -
                      </button>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          isOut
                            ? 'bg-red-100 text-red-800'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {p.stock} {p.unit}s
                      </span>
                      <button
                        onClick={() => handleQuickStockChange(p.id, 1)}
                        className="h-5 w-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold"
                        title="Sumar 1"
                      >
                        +
                      </button>
                    </div>
                    {isLowStock && (
                      <div className="text-[10px] text-rose-600 font-semibold text-center mt-0.5">
                        Mínimo: {p.minStock}
                      </div>
                    )}
                  </td>

                  {/* Cost */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    S/ {p.costPrice.toFixed(2)}
                  </td>

                  {/* Sale Price */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                    S/ {p.salePrice.toFixed(2)}
                  </td>

                  {/* Margin */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    <span className="font-semibold text-emerald-700">
                      +S/ {profitMargin.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({profitPercent.toFixed(0)}%)
                    </span>
                  </td>

                  {/* Expiration */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${expStatus.color}`}
                    >
                      {expStatus.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Desea eliminar "${p.name}" del inventario?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se encontraron productos con los filtros aplicados.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código de Producto *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código de Barras (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    placeholder="775..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo del Producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Arroz Costeño Extra 1kg"
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unidad de Medida *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as Product['unit'] })}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="unid">Unidad</option>
                    <option value="kg">Kilo (Kg)</option>
                    <option value="paquete">Paquete</option>
                    <option value="botella">Botella</option>
                    <option value="lata">Lata</option>
                    <option value="litro">Litro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stock Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Costo de Compra (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Precio de Venta al Público (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fecha de Vencimiento (Opcional)
                </label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
