import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Promotion, ProductCategory } from '../../types';
import {
  Percent,
  Plus,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  X,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const PromotionsModule: React.FC = () => {
  const { promotions, togglePromotion, addPromotion, deletePromotion } = useBodega();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: Promotion['type'];
    value: number;
    applicableCategory: ProductCategory | 'Todas';
    minPurchaseAmount: number;
    validUntil: string;
  }>({
    title: '',
    description: '',
    type: 'Porcentaje',
    value: 10,
    applicableCategory: 'Todas',
    minPurchaseAmount: 20,
    validUntil: '2026-12-31',
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Porcentaje',
      value: 5,
      applicableCategory: 'Abarrotes',
      minPurchaseAmount: 30,
      validUntil: '2026-12-31',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addPromotion({
      ...formData,
      active: true,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Promociones, Combos y Descuentos
          </h2>
          <p className="text-xs text-slate-500">
            Incentiva la venta rápida con combos bodegueros, ofertas y descuentos aplicables en el POS
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Nueva Oferta</span>
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className={`flex flex-col justify-between rounded-xl p-4 border transition-all ${
              promo.active
                ? 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-800 font-bold text-xs">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                      {promo.type}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {promo.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => deletePromotion(promo.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 my-2 leading-relaxed">
                {promo.description}
              </p>

              <div className="space-y-1 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="flex justify-between">
                  <span>Beneficio:</span>
                  <span className="font-bold text-emerald-700">
                    {promo.type === 'Porcentaje'
                      ? `${promo.value}% de descuento`
                      : `S/ ${promo.value.toFixed(2)} de rebaja`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Aplica a:</span>
                  <span className="text-slate-700 font-sans">{promo.applicableCategory || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vigencia:</span>
                  <span>Hasta {promo.validUntil}</span>
                </div>
              </div>
            </div>

            {/* Toggle Status */}
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-slate-500">
                Estado: {promo.active ? 'Activa en POS' : 'Inactiva'}
              </span>
              <button
                type="button"
                onClick={() => togglePromotion(promo.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-colors ${
                  promo.active
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {promo.active ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>Habilitada</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    <span>Deshabilitada</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Crear Nueva Promoción Bodeguera
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Título de la Oferta *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Combo Desayuno Casero"
                  className="w-full rounded-lg border border-slate-300 p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción para el cliente
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Lleva 10 panes + Leche con descuento"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Rebaja
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Porcentaje">Porcentaje (%)</option>
                    <option value="Monto Fijo">Monto Fijo (S/)</option>
                    <option value="Combo">Combo Especial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor del Beneficio
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoría Aplicable
                  </label>
                  <select
                    value={formData.applicableCategory}
                    onChange={(e) => setFormData({ ...formData, applicableCategory: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Todas">Todas</option>
                    <option value="Abarrotes">Abarrotes</option>
                    <option value="Bebidas y Licores">Bebidas</option>
                    <option value="Lácteos y Embutidos">Lácteos</option>
                    <option value="Limpieza y Aseo">Limpieza</option>
                    <option value="Panadería">Panadería</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vigente Hasta
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Crear Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
