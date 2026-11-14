import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import {
  Settings,
  Building,
  Printer,
  RotateCcw,
  Download,
  Save,
  CheckCircle,
  QrCode,
  AlertTriangle,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { config, updateConfig, resetToDemoData, products, sales, clients, debts } = useBodega();

  const [formData, setFormData] = useState({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      config,
      products,
      sales,
      clients,
      debts,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bodega_jaimito_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (
      window.confirm(
        '¿Está seguro de que desea restaurar los datos de prueba iniciales de la bodega? Esta acción reestablecerá los productos, ventas y saldos predeterminados.'
      )
    ) {
      resetToDemoData();
      alert('¡Datos de demostración restaurados con éxito!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Configuración del Negocio y Sistema
          </h2>
          <p className="text-xs text-slate-500">
            Parámetros fiscales, comprobantes electrónicos, números de Yape/Plin y respaldo de información
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Descargar Respaldo JSON</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">
            ¡Configuración guardada exitosamente! Los cambios ya se reflejan en el sistema y en las boletas.
          </span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Business Identity */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Identidad Comercial y Fiscal (SUNAT)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre Comercial de la Bodega *
              </label>
              <input
                type="text"
                value={formData.commercialName}
                onChange={(e) => setFormData({ ...formData, commercialName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Razón Social Legal *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                RUC (11 dígitos) *
              </label>
              <input
                type="text"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Dirección del Local Físico *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ciudad / Distrito
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teléfono Fijo / Local
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Pedidos
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Payments & Digital Wallets */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <QrCode className="h-4 w-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Billeteras Digitales (Yape y Plin)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número de Celular para Yape
              </label>
              <input
                type="text"
                value={formData.yapeNumber}
                onChange={(e) => setFormData({ ...formData, yapeNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold text-purple-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número de Celular para Plin
              </label>
              <input
                type="text"
                value={formData.plinNumber}
                onChange={(e) => setFormData({ ...formData, plinNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold text-cyan-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Boleta & POS Configuration */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Printer className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Configuración de Boleta Electrónica y Alertas
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Serie de Boletas
              </label>
              <input
                type="text"
                value={formData.seriesBoleta}
                onChange={(e) => setFormData({ ...formData, seriesBoleta: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Próximo Correlativo
              </label>
              <input
                type="number"
                value={formData.nextBoletaNumber}
                onChange={(e) => setFormData({ ...formData, nextBoletaNumber: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tasa I.G.V.
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.igvRate}
                onChange={(e) => setFormData({ ...formData, igvRate: parseFloat(e.target.value) || 0.18 })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mensaje al Pie de Boleta / Agradecimiento
            </label>
            <input
              type="text"
              value={formData.printerTicketMessage}
              onChange={(e) => setFormData({ ...formData, printerTicketMessage: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Restore Demo Data */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Zona de Reinicio: Datos de Prueba</span>
            </h4>
            <p className="text-xs text-red-700">
              Restaura la base de datos inicial con los 22 productos peruanos, ventas simuladas, clientes y fiados de ejemplo.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar Datos Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
