import React from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Menu, PlusCircle, Coins, Shield, Clock } from 'lucide-react';

export const Navbar: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { activeModule, setActiveModule, cashRegister, config, currentUser } = useBodega();

  const moduleTitles: Record<string, string> = {
    inicio: 'Panel de Control (Dashboard)',
    ventas: 'Punto de Venta (POS)',
    inventario: 'Control de Inventario y Stock',
    clientes: 'Directorio de Clientes Caseros',
    proveedores: 'Proveedores y Abastecimiento',
    caja: 'Control de Caja y Finanzas',
    reportes: 'Reportes y Analítica Avanzada',
    fiados: 'Control de Fiados y Créditos',
    promociones: 'Promociones y Ofertas',
    empleados: 'Personal y Control de Permisos',
    delivery: 'Pedidos a Domicilio (Delivery)',
    configuracion: 'Configuración del Negocio',
  };

  const currentTitle = moduleTitles[activeModule] || 'La Bodega de Jaimito';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Bodega Jaimito</span>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-emerald-700 capitalize">{activeModule}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Zone 2: Status Indicators */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          <Coins className="h-3.5 w-3.5 text-emerald-600" />
          <span>Caja:</span>
          <span className="font-semibold text-slate-900">
            {cashRegister.isOpen ? 'Abierta' : 'Cerrada'}
          </span>
          {cashRegister.isOpen && (
            <span className="text-slate-500 font-mono">
              (S/ {cashRegister.initialAmount.toFixed(2)})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono">
            {new Date().toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Action CTA */}
      <div className="flex items-center gap-3 shrink-0">
        {activeModule !== 'ventas' ? (
          <button
            onClick={() => setActiveModule('ventas')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4 text-yellow-300" />
            <span>Nueva Venta (POS)</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            <span>Cajero Activo:</span>
            <strong className="font-semibold">{currentUser?.fullName || 'Jaimito'}</strong>
          </div>
        )}
      </div>
    </header>
  );
};
