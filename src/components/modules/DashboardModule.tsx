import React, { useMemo, useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import {
  ModernAreaChart,
  ModernDualBarChart,
  ModernDonutChart,
  TopProductsRanking,
} from '../common/Charts';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  ShoppingCart,
  BookOpen,
  ArrowRight,
  Package,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const {
    sales,
    products,
    clients,
    debts,
    setActiveModule,
    cashRegister,
    config,
  } = useBodega();

  const [timeRange, setTimeRange] = useState<'7days' | 'monthly'>('7days');

  // Today's metrics
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySales = useMemo(() => {
    return sales.filter((s) => s.date.startsWith(todayStr));
  }, [sales, todayStr]);

  const totalSalesToday = todaySales.reduce((acc, curr) => acc + curr.total, 0);
  const totalProfitToday = todaySales.reduce((acc, curr) => acc + curr.netProfit, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Products expiring within 15 days or already expired
  const expiringProducts = products.filter((p) => {
    if (!p.expirationDate) return false;
    const diff = (new Date(p.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diff <= 15;
  });

  // Calculate 7-day trend
  const last7DaysData = useMemo(() => {
    const days: { label: string; value: number; secondaryValue: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('es-PE', { weekday: 'short' });

      const daySales = sales.filter((s) => s.date.startsWith(dateStr));
      const income = daySales.reduce((sum, s) => sum + s.total, 0);
      const profit = daySales.reduce((sum, s) => sum + s.netProfit, 0);

      days.push({
        label: `${dayName} ${d.getDate()}`,
        value: income,
        secondaryValue: profit,
      });
    }
    return days;
  }, [sales]);

  // Payment methods breakdown
  const paymentMethodsData = useMemo(() => {
    const totals: Record<string, number> = {
      Efectivo: 0,
      Yape: 0,
      Plin: 0,
      Tarjeta: 0,
      Fiado: 0,
    };

    sales.forEach((s) => {
      totals[s.paymentMethod] = (totals[s.paymentMethod] || 0) + s.total;
    });

    return [
      { label: 'Efectivo', value: totals['Efectivo'] || 0, color: '#10b981' },
      { label: 'Yape', value: totals['Yape'] || 0, color: '#8b5cf6' },
      { label: 'Plin', value: totals['Plin'] || 0, color: '#06b6d4' },
      { label: 'Tarjeta', value: totals['Tarjeta'] || 0, color: '#f59e0b' },
      { label: 'Fiado', value: totals['Fiado'] || 0, color: '#ef4444' },
    ].filter((item) => item.value > 0);
  }, [sales]);

  // Top products sold
  const topProducts = useMemo(() => {
    const map = new Map<string, { id: string; name: string; category: string; quantitySold: number; totalRevenue: number; unit: string }>();

    sales.forEach((s) => {
      s.items.forEach((item) => {
        const existing = map.get(item.productId);
        if (existing) {
          existing.quantitySold += item.quantity;
          existing.totalRevenue += item.total;
        } else {
          map.set(item.productId, {
            id: item.productId,
            name: item.productName,
            category: item.category,
            quantitySold: item.quantity,
            totalRevenue: item.total,
            unit: item.unit,
          });
        }
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [sales]);

  // Total pending fiados / debts
  const totalPendingFiados = debts
    .filter((d) => d.status !== 'Pagado')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Status */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-200 mb-1">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span>Sistema Operativo Bodeguero 100% Sincronizado</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            ¡Buen día, Don Jaimito! La Bodega está en marcha.
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Caja actual: <strong className="font-semibold text-white">{cashRegister.isOpen ? 'Abierta' : 'Cerrada'}</strong> · Moneda: Soles Peruanos (S/) · {config.address}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveModule('ventas')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Abrir Terminal POS</span>
          </button>
          <button
            onClick={() => setActiveModule('fiados')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white/15 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>Ver Fiados</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas Hoy */}
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Ventas del Día</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              S/ {totalSalesToday.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {todaySales.length} {todaySales.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Total facturado hoy en la tienda
          </div>
        </div>

        {/* Card 2: Ganancia Neta Hoy */}
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Ganancia Neta Hoy</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-amber-900 tabular-nums">
              S/ {totalProfitToday.toFixed(2)}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              {totalSalesToday > 0 ? ((totalProfitToday / totalSalesToday) * 100).toFixed(0) : 0}% margen
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Margen neto tras costo de reposición
          </div>
        </div>

        {/* Card 3: Clientes & Fiados */}
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Clientes Caseros</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {clients.length}
            </span>
            <span className="text-xs text-rose-600 font-medium font-mono">
              S/ {totalPendingFiados.toFixed(2)} fiado
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Cuentas activas en la libreta
          </div>
        </div>

        {/* Card 4: Alertas de Stock */}
        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Alertas de Inventario</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-rose-600 tabular-nums">
              {lowStockProducts.length + expiringProducts.length}
            </span>
            <span className="text-xs text-slate-500">
              ({lowStockProducts.length} stock · {expiringProducts.length} venc)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Requiere atención de reposición
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner if any items are low or expiring */}
      {(lowStockProducts.length > 0 || expiringProducts.length > 0) && (
        <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-900">
                Atención Caserito: Productos que requieren pedido urgente
              </span>
            </div>
            <button
              onClick={() => setActiveModule('inventario')}
              className="text-xs font-medium text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
            >
              <span>Ver todo en Inventario</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-amber-200 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-semibold text-slate-800 truncate block">
                    {prod.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mínimo: {prod.minStock} {prod.unit}s
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-600 shrink-0 px-2 py-0.5 rounded bg-rose-50 text-[11px]">
                  Quedan {prod.stock}
                </span>
              </div>
            ))}

            {expiringProducts.slice(0, 2).map((prod) => (
              <div
                key={`exp-${prod.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-rose-200 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-semibold text-slate-800 truncate block">
                    {prod.name}
                  </span>
                  <span className="text-[11px] text-rose-600">
                    Vence: {prod.expirationDate}
                  </span>
                </div>
                <span className="font-mono text-rose-700 text-[10px] font-semibold bg-rose-50 px-2 py-0.5 rounded">
                  Por vencer
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Trend Area Chart */}
        <div className="lg:col-span-8 rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Evolución de Ventas vs Ganancia Neta
              </h3>
              <p className="text-xs text-slate-500">
                Facturación diaria de los últimos 7 días con desglose de utilidad
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs self-start">
              <button
                onClick={() => setTimeRange('7days')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  timeRange === '7days' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Últimos 7 días
              </button>
            </div>
          </div>

          <ModernAreaChart
            data={last7DaysData}
            height={240}
            primaryColor="#059669"
            secondaryColor="#f59e0b"
            primaryLabel="Ventas Totales"
            secondaryLabel="Ganancia Neta"
          />
        </div>

        {/* Right Column (4 cols): Payment Method Donut */}
        <div className="lg:col-span-4 rounded-xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Métodos de Pago
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribución por Efectivo, Yape, Plin y Tarjeta
            </p>
          </div>

          <ModernDonutChart
            data={paymentMethodsData}
            size={160}
            title="Recaudación"
          />

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Billeteras digitales (Yape/Plin):</span>
            <span className="font-mono font-semibold text-purple-700">
              S/ {((paymentMethodsData.find((p) => p.label === 'Yape')?.value || 0) + (paymentMethodsData.find((p) => p.label === 'Plin')?.value || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Top Products Ranking & Quick POS Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Products */}
        <div className="lg:col-span-7 rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ranking: Productos Más Vendidos
              </h3>
              <p className="text-xs text-slate-500">
                Los líderes en rotación e ingresos de la bodega
              </p>
            </div>
            <button
              onClick={() => setActiveModule('reportes')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Ver Top 10 Completo
            </button>
          </div>

          <TopProductsRanking items={topProducts} />
        </div>

        {/* Operations & Quick Actions */}
        <div className="lg:col-span-5 rounded-xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Accesos Rápidos del Turno
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Operaciones frecuentes de la atención al público
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => setActiveModule('ventas')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Registrar Venta de Mostrador
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Boleta con cálculo de vuelto y QR Yape/Plin
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-700" />
              </button>

              <button
                onClick={() => setActiveModule('proveedores')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Registrar Entrada de Mercadería
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Suma stock y registra egreso contable
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveModule('caja')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-white">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Registrar Gasto Menor / Arqueo
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Bolsas, luz, agua o retiro del dueño
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>RUC: {config.ruc}</span>
            <span className="font-semibold text-emerald-700">{config.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
