import React from 'react';
import { useBodega } from '../../context/BodegaContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  Coins,
  BarChart3,
  BookOpen,
  Percent,
  ShieldCheck,
  Bike,
  Settings,
  LogOut,
  Store,
  ChevronRight,
  CircleAlert,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onCloseMobile?: () => void }> = ({
  isOpen,
  onCloseMobile,
}) => {
  const {
    activeModule,
    setActiveModule,
    currentUser,
    logout,
    products,
    deliveries,
    debts,
    cashRegister,
  } = useBodega();

  // Badges calculation
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const pendingDeliveriesCount = deliveries.filter(
    (d) => d.status === 'Pendiente' || d.status === 'En camino'
  ).length;
  const overdueDebtsCount = debts.filter(
    (d) => d.status === 'Vencido' || d.status === 'Pendiente'
  ).length;

  const menuItems = [
    {
      id: 'inicio',
      label: 'Inicio (Dashboard)',
      icon: LayoutDashboard,
      badge: lowStockCount > 0 ? `${lowStockCount} alertas` : undefined,
      badgeColor: 'text-amber-700 bg-amber-50',
    },
    {
      id: 'ventas',
      label: 'Ventas (POS)',
      icon: ShoppingCart,
      highlight: true,
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: Package,
      badge: lowStockCount > 0 ? String(lowStockCount) : undefined,
      badgeColor: 'text-red-700 bg-red-50',
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'proveedores',
      label: 'Proveedores',
      icon: Truck,
    },
    {
      id: 'caja',
      label: 'Caja y Finanzas',
      icon: Coins,
      badge: cashRegister.isOpen ? 'Abierta' : 'Cerrada',
      badgeColor: cashRegister.isOpen ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100',
    },
    {
      id: 'reportes',
      label: 'Reportes y Analítica',
      icon: BarChart3,
    },
    {
      id: 'fiados',
      label: 'Fiados (Créditos)',
      icon: BookOpen,
      badge: overdueDebtsCount > 0 ? String(overdueDebtsCount) : undefined,
      badgeColor: 'text-amber-700 bg-amber-50',
    },
    {
      id: 'promociones',
      label: 'Promociones',
      icon: Percent,
    },
    {
      id: 'empleados',
      label: 'Empleados y Permisos',
      icon: ShieldCheck,
    },
    {
      id: 'delivery',
      label: 'Delivery y Pedidos',
      icon: Bike,
      badge: pendingDeliveriesCount > 0 ? String(pendingDeliveriesCount) : undefined,
      badgeColor: 'text-emerald-700 bg-emerald-50',
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveModule(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-yellow-300 shadow-md">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-white uppercase truncate">
              BODEGA DE JAIMITO
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Gestión & POS Perú</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs">
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Módulos del Sistema
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-yellow-300' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Current user card & logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/60 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-300 shrink-0">
                {currentUser?.fullName.charAt(0) || 'J'}
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-semibold text-white truncate">
                  {currentUser?.fullName || 'Jaimito (Admin)'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {currentUser?.role || 'Administrador'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/50 rounded-lg transition-colors border border-rose-900/30"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
