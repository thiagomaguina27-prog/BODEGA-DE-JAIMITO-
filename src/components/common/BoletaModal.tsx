import React from 'react';
import { Sale, BusinessConfig } from '../../types';
import { Printer, X, Check, QrCode } from 'lucide-react';

interface BoletaModalProps {
  sale: Sale | null;
  config: BusinessConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const BoletaModal: React.FC<BoletaModalProps> = ({
  sale,
  config,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.date).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Modal actions bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-800">Boleta Generada Exitosamente</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Ticket Content */}
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 font-mono text-xs text-slate-700 printable-ticket shadow-inner">
          {/* Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3 mb-3">
            <h2 className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              {config.commercialName}
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">{config.name}</p>
            <p className="text-[11px] font-semibold text-slate-800">RUC: {config.ruc}</p>
            <p className="text-[10px] text-slate-500">{config.address}</p>
            <p className="text-[10px] text-slate-500">{config.city} · Telf: {config.phone}</p>
          </div>

          {/* Document Title */}
          <div className="text-center border-b border-dashed border-slate-300 pb-2 mb-2">
            <div className="font-bold text-xs uppercase tracking-wide text-slate-900">
              BOLETA DE VENTA ELECTRÓNICA
            </div>
            <div className="text-sm font-bold text-emerald-800 mt-0.5">
              {sale.correlative}
            </div>
          </div>

          {/* Client & Metadata */}
          <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha / Hora:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-semibold">{sale.clientName || 'Cliente Casual'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cajero:</span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Método de Pago:</span>
              <span className="font-semibold text-slate-900">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Item details */}
          <div className="border-b border-dashed border-slate-300 pb-2 mb-2">
            <div className="grid grid-cols-12 gap-1 font-bold text-[10px] text-slate-600 mb-1 border-b border-slate-200 pb-1">
              <span className="col-span-2">CANT</span>
              <span className="col-span-6">DESCRIPCIÓN</span>
              <span className="col-span-2 text-right">P.U.</span>
              <span className="col-span-2 text-right">TOTAL</span>
            </div>

            <div className="space-y-1">
              {sale.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1 text-[11px]">
                  <span className="col-span-2">{item.quantity} {item.unit}</span>
                  <span className="col-span-6 truncate font-sans text-[11px] text-slate-800">{item.productName}</span>
                  <span className="col-span-2 text-right tabular-nums">{item.unitPrice.toFixed(2)}</span>
                  <span className="col-span-2 text-right font-medium tabular-nums">{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Op. Gravada:</span>
              <span className="tabular-nums">S/ {sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">I.G.V. (18%):</span>
              <span className="tabular-nums">S/ {sale.igv.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Descuento aplicado:</span>
                <span className="tabular-nums">- S/ {sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 font-bold text-sm text-slate-900 border-t border-slate-200">
              <span>TOTAL A PAGAR:</span>
              <span className="tabular-nums">S/ {sale.total.toFixed(2)}</span>
            </div>

            {sale.paymentMethod === 'Efectivo' && (
              <>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Importe Pagado:</span>
                  <span className="tabular-nums">S/ {sale.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-emerald-800">
                  <span>Vuelto:</span>
                  <span className="tabular-nums">S/ {sale.change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* QR representation & Footer */}
          <div className="text-center pt-1 space-y-1.5">
            <div className="flex justify-center my-1">
              <div className="p-1.5 bg-white rounded border border-slate-200 inline-flex flex-col items-center">
                <QrCode className="h-14 w-14 text-slate-800" />
                <span className="text-[8px] text-slate-400 mt-0.5">SUNAT ELECTRÓNICO</span>
              </div>
            </div>
            <p className="text-[10px] italic text-slate-600 font-sans">
              "{config.printerTicketMessage}"
            </p>
            <p className="text-[9px] text-slate-400">
              Representación impresa de la Boleta de Venta Electrónica.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex items-center justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir Boleta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
