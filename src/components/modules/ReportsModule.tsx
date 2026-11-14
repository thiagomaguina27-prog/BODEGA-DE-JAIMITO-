import React, { useState, useMemo } from 'react';
import { useBodega } from '../../context/BodegaContext';
import {
  ModernAreaChart,
  ModernDualBarChart,
  ModernDonutChart,
  TopProductsRanking,
} from '../common/Charts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Printer,
  Calendar,
  Layers,
  Award,
  Target,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { sales, config } = useBodega();

  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensual' | 'anual'>('semanal');

  // Compute metrics according to period
  const chartData = useMemo(() => {
    if (period === 'diario') {
      // Hours of today or past few days
      const days = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
      return days.map((h, i) => {
        const val = [12.4, 35.0, 16.0, 37.5, 18.8, 29.0, 14.8, 8.5][i] || 15;
        const profit = val * 0.28;
        return { label: h, value: val, secondaryValue: profit };
      });
    }

    if (period === 'semanal') {
      // Mon - Sun
      const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const incomeSample = [145.2, 180.5, 210.0, 195.4, 280.6, 340.0, 290.5];
      return weekDays.map((d, i) => ({
        label: d,
        value: incomeSample[i],
        secondaryValue: incomeSample[i] * 0.26,
      }));
    }

    if (period === 'mensual') {
      // 4 weeks of month
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      const incomeSample = [1240.0, 1450.5, 1380.0, 1620.0];
      return weeks.map((w, i) => ({
        label: w,
        value: incomeSample[i],
        secondaryValue: incomeSample[i] * 0.27,
      }));
    }

    // Anual
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
    const incomeSample = [4200, 4600, 5100, 4800, 5300, 5800, 6400, 5900, 6100, 6300, 6800, 7500];
    return months.map((m, i) => ({
      label: m,
      value: incomeSample[i],
      secondaryValue: incomeSample[i] * 0.26,
    }));
  }, [period]);

  // Dual Bar Data: Ingreso vs Ganancia Neta
  const dualBarData = useMemo(() => {
    return chartData.map((d) => ({
      label: d.label,
      income: d.value,
      profit: d.secondaryValue || d.value * 0.25,
    }));
  }, [chartData]);

  // Category sales breakdown
  const categorySalesData = useMemo(() => {
    const map: Record<string, number> = {
      Abarrotes: 0,
      'Bebidas y Licores': 0,
      'Lácteos y Embutidos': 0,
      'Snacks y Golosinas': 0,
      'Limpieza y Aseo': 0,
      Panadería: 0,
    };

    sales.forEach((s) => {
      s.items.forEach((it) => {
        if (map[it.category] !== undefined) {
          map[it.category] += it.total;
        } else {
          map[it.category] = (map[it.category] || 0) + it.total;
        }
      });
    });

    const colors: Record<string, string> = {
      Abarrotes: '#059669', // Emerald
      'Bebidas y Licores': '#f59e0b', // Amber
      'Lácteos y Embutidos': '#3b82f6', // Blue
      'Snacks y Golosinas': '#ec4899', // Pink
      'Limpieza y Aseo': '#8b5cf6', // Violet
      Panadería: '#f97316', // Orange
    };

    return Object.entries(map).map(([cat, val]) => ({
      label: cat,
      value: val,
      color: colors[cat] || '#64748b',
    }));
  }, [sales]);

  // Payment methods breakdown
  const paymentMethodsData = useMemo(() => {
    const map: Record<string, number> = {
      Efectivo: 0,
      Yape: 0,
      Plin: 0,
      Tarjeta: 0,
      Fiado: 0,
    };

    sales.forEach((s) => {
      map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.total;
    });

    return [
      { label: 'Efectivo', value: map['Efectivo'] || 0, color: '#10b981' },
      { label: 'Yape', value: map['Yape'] || 0, color: '#8b5cf6' },
      { label: 'Plin', value: map['Plin'] || 0, color: '#06b6d4' },
      { label: 'Tarjeta', value: map['Tarjeta'] || 0, color: '#f59e0b' },
      { label: 'Fiado', value: map['Fiado'] || 0, color: '#ef4444' },
    ];
  }, [sales]);

  // Top 10 Ranking
  const top10Products = useMemo(() => {
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
      .slice(0, 10);
  }, [sales]);

  // Meta de Ventas del Mes
  const metaVentasMes = 6500;
  const ventasActualesMes = sales.reduce((acc, curr) => acc + curr.total, 0) + 3800; // Simulated month baseline
  const metaProgreso = Math.min(100, Math.round((ventasActualesMes / metaVentasMes) * 100));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Reportes y Analítica Avanzada
          </h2>
          <p className="text-xs text-slate-500">
            Inteligencia comercial de La Bodega de Jaimito · Rentabilidad, categorías y medios de pago
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            {(['diario', 'semanal', 'mensual', 'anual'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-all ${
                  period === p
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Imprimir Reporte</span>
          </button>
        </div>
      </div>

      {/* Goal Progress Banner (KPI Metas) */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-5 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-slate-900 shadow-md">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                Meta Comercial del Mes de Noviembre
              </span>
              <h3 className="text-lg font-bold">
                S/ {ventasActualesMes.toFixed(2)} logrados de S/ {metaVentasMes.toFixed(2)} (Meta: {metaProgreso}%)
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-emerald-200 block">Faltan para la meta:</span>
            <span className="font-mono text-base font-bold text-yellow-300">
              S/ {Math.max(0, metaVentasMes - ventasActualesMes).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${metaProgreso}%` }}
          />
        </div>
      </div>

      {/* Main Comparative Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Evolución Temporal (Line/Area) */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Curva de Ventas y Tendencia de Facturación ({period})
            </h3>
            <p className="text-xs text-slate-500">
              Evolución acumulada de ventas en Soles Peruanos
            </p>
          </div>

          <ModernAreaChart
            data={chartData}
            height={240}
            primaryColor="#059669"
            secondaryColor="#f59e0b"
            primaryLabel="Facturación Total"
            secondaryLabel="Margen Neto"
          />
        </div>

        {/* Chart 2: Ingresos Totales vs Ganancia Neta (Dual Bar) */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Rentabilidad: Ingresos Totales vs Ganancia Neta
            </h3>
            <p className="text-xs text-slate-500">
              Comparativa para evaluar el margen real de la bodega
            </p>
          </div>

          <ModernDualBarChart
            data={dualBarData}
            height={240}
            valuePrefix="S/ "
          />
        </div>
      </div>

      {/* Secondary Row: Categories & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Ventas por Categoría de Producto
            </h3>
            <p className="text-xs text-slate-500">
              Participación de Abarrotes, Bebidas, Lácteos, Limpieza y Panadería
            </p>
          </div>

          <ModernDonutChart
            data={categorySalesData}
            size={180}
            title="Categorías"
          />
        </div>

        {/* Payment Methods Breakdown */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Distribución por Método de Pago
            </h3>
            <p className="text-xs text-slate-500">
              Uso de Efectivo tradicional vs Billeteras digitales (Yape / Plin)
            </p>
          </div>

          <ModernDonutChart
            data={paymentMethodsData}
            size={180}
            title="Métodos"
          />
        </div>
      </div>

      {/* Top 10 Best-Selling Products Ranking */}
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-yellow-600" />
              <span>Ranking Top 10: Productos con Mayor Demanda y Rotación</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ordenados por facturación total generada en caja
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            10 Líderes
          </span>
        </div>

        <TopProductsRanking items={top10Products} />
      </div>
    </div>
  );
};
