import React, { useState } from 'react';

// Area & Line Chart for Temporal Trends
interface AreaChartProps {
  data: { label: string; value: number; secondaryValue?: number; tooltipExtra?: string }[];
  height?: number;
  valuePrefix?: string;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export const ModernAreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 240,
  valuePrefix = 'S/ ',
  primaryColor = '#059669', // Emerald 600
  secondaryColor = '#f59e0b', // Amber 500
  primaryLabel = 'Ventas',
  secondaryLabel = 'Ganancia Neta',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        No hay datos disponibles en este periodo
      </div>
    );
  }

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const chartWidth = 600;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0)), 10) * 1.15;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return paddingTop + innerHeight - (val / maxVal) * innerHeight;
  };

  // Generate smooth cubic bezier SVG path
  const generatePath = (valKey: 'value' | 'secondaryValue') => {
    const points = data.map((d, i) => ({
      x: getX(i),
      y: getY(valKey === 'value' ? d.value : d.secondaryValue || 0),
    }));

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const primaryLinePath = generatePath('value');
  const primaryAreaPath = `${primaryLinePath} L ${getX(data.length - 1)} ${paddingTop + innerHeight} L ${getX(0)} ${paddingTop + innerHeight} Z`;

  const hasSecondary = data.some((d) => d.secondaryValue !== undefined);
  const secondaryLinePath = hasSecondary ? generatePath('secondaryValue') : '';
  const secondaryAreaPath = hasSecondary
    ? `${secondaryLinePath} L ${getX(data.length - 1)} ${paddingTop + innerHeight} L ${getX(0)} ${paddingTop + innerHeight} Z`
    : '';

  // Grid steps (4 horizontal guide lines)
  const gridSteps = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  return (
    <div className="relative w-full">
      {/* Legend header */}
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="font-medium text-slate-700">{primaryLabel}</span>
          </div>
          {hasSecondary && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
              <span className="font-medium text-slate-700">{secondaryLabel}</span>
            </div>
          )}
        </div>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="font-mono text-xs font-semibold text-slate-800">
            {data[hoveredIdx].label}: <span className="text-emerald-700">{valuePrefix}{data[hoveredIdx].value.toFixed(2)}</span>
            {hasSecondary && data[hoveredIdx].secondaryValue !== undefined && (
              <span className="ml-2 text-amber-700">· {valuePrefix}{data[hoveredIdx].secondaryValue?.toFixed(2)}</span>
            )}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full overflow-visible select-none"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
          </linearGradient>
          {hasSecondary && (
            <linearGradient id="secAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.0" />
            </linearGradient>
          )}
        </defs>

        {/* Background Grid Lines */}
        {gridSteps.map((step, idx) => {
          const y = getY(step);
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[10px]"
              >
                {step.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Areas */}
        <path d={primaryAreaPath} fill="url(#primaryAreaGrad)" />
        {hasSecondary && <path d={secondaryAreaPath} fill="url(#secAreaGrad)" />}

        {/* Lines */}
        {hasSecondary && (
          <path
            d={secondaryLinePath}
            fill="none"
            stroke={secondaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
        <path
          d={primaryLinePath}
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* X Axis Labels & Interactive Points */}
        {data.map((d, i) => {
          const x = getX(i);
          const yPrimary = getY(d.value);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Vertical hover guide bar */}
              {isHovered && (
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + innerHeight}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}

              {/* Data points */}
              <circle
                cx={x}
                cy={yPrimary}
                r={isHovered ? 5.5 : 3.5}
                fill="#ffffff"
                stroke={primaryColor}
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150"
              />

              {hasSecondary && d.secondaryValue !== undefined && (
                <circle
                  cx={x}
                  cy={getY(d.secondaryValue)}
                  r={isHovered ? 4.5 : 3}
                  fill="#ffffff"
                  stroke={secondaryColor}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />
              )}

              {/* X label */}
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                className={`font-mono text-[10px] transition-colors ${
                  isHovered ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                }`}
              >
                {d.label}
              </text>

              {/* Invisible wide hit target for smooth hover */}
              <rect
                x={x - innerWidth / (data.length * 2)}
                y={paddingTop}
                width={innerWidth / data.length}
                height={innerHeight}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Bar Chart for Ingresos vs Ganancias Netas
interface BarChartProps {
  data: { label: string; income: number; profit: number }[];
  height?: number;
  valuePrefix?: string;
}

export const ModernDualBarChart: React.FC<BarChartProps> = ({
  data,
  height = 230,
  valuePrefix = 'S/ ',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex h-56 items-center justify-center text-sm text-slate-400">Sin registros</div>;
  }

  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 35;
  const chartWidth = 580;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.profit]), 10) * 1.15;
  const groupWidth = innerWidth / data.length;
  const barWidth = Math.min(22, (groupWidth - 12) / 2);

  return (
    <div className="relative w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
            <span className="font-medium text-slate-700">Ingresos Totales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
            <span className="font-medium text-slate-700">Ganancia Neta</span>
          </div>
        </div>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="font-mono text-xs font-semibold text-slate-800">
            {data[hoveredIdx].label}: <span className="text-emerald-700">{valuePrefix}{data[hoveredIdx].income.toFixed(2)}</span> · <span className="text-amber-700">Neta: {valuePrefix}{data[hoveredIdx].profit.toFixed(2)}</span>
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full select-none" style={{ maxHeight: height }}>
        {/* Horizontal guide lines */}
        {[0, maxVal * 0.33, maxVal * 0.66, maxVal].map((val, idx) => {
          const y = paddingTop + innerHeight - (val / maxVal) * innerHeight;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text x={paddingLeft - 8} y={y + 3} textAnchor="end" className="fill-slate-400 font-mono text-[10px]">
                {val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const groupCenter = paddingLeft + (i + 0.5) * groupWidth;
          const incomeHeight = Math.max(2, (d.income / maxVal) * innerHeight);
          const profitHeight = Math.max(2, (d.profit / maxVal) * innerHeight);

          const incomeY = paddingTop + innerHeight - incomeHeight;
          const profitY = paddingTop + innerHeight - profitHeight;

          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Income bar */}
              <rect
                x={groupCenter - barWidth - 2}
                y={incomeY}
                width={barWidth}
                height={incomeHeight}
                rx="3"
                className={`transition-all duration-150 ${isHovered ? 'fill-emerald-500' : 'fill-emerald-600'}`}
              />

              {/* Profit bar */}
              <rect
                x={groupCenter + 2}
                y={profitY}
                width={barWidth}
                height={profitHeight}
                rx="3"
                className={`transition-all duration-150 ${isHovered ? 'fill-amber-400' : 'fill-amber-500'}`}
              />

              {/* X Axis Label */}
              <text
                x={groupCenter}
                y={height - 8}
                textAnchor="middle"
                className={`font-mono text-[10px] ${isHovered ? 'fill-slate-900 font-semibold' : 'fill-slate-500'}`}
              >
                {d.label}
              </text>

              {/* Invisible hover overlay */}
              <rect
                x={groupCenter - groupWidth / 2}
                y={paddingTop}
                width={groupWidth}
                height={innerHeight}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Donut / Pie Chart with Legends & Percentages
interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  valuePrefix?: string;
  title?: string;
}

export const ModernDonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
  valuePrefix = 'S/ ',
  title,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-slate-400">
        Sin transacciones para mostrar
      </div>
    );
  }

  const radius = 64;
  const strokeWidth = 26;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 select-none">
          {data.map((slice, idx) => {
            if (slice.value <= 0) return null;
            const slicePercent = slice.value / total;
            const strokeDasharray = `${slicePercent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += slicePercent;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {hoveredIdx !== null && data[hoveredIdx] ? (
            <>
              <span className="font-mono text-base font-bold text-slate-800">
                {((data[hoveredIdx].value / total) * 100).toFixed(1)}%
              </span>
              <span className="text-[11px] font-medium text-slate-500 truncate max-w-[85px]">
                {data[hoveredIdx].label}
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-sm font-bold text-slate-800">
                {valuePrefix}{total.toFixed(0)}
              </span>
              <span className="text-[11px] text-slate-400">{title || 'Total'}</span>
            </>
          )}
        </div>
      </div>

      {/* Breakdown list */}
      <div className="flex flex-col gap-1.5 w-full text-xs">
        {data.map((slice, idx) => {
          const percent = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0';
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-1.5 rounded transition-colors cursor-pointer ${
                isHovered ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="truncate">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono">
                <span className="text-slate-800 font-medium">{valuePrefix}{slice.value.toFixed(2)}</span>
                <span className="text-slate-400 text-[10px]">({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Ranking Top Products with horizontal progress bars
interface TopProductItem {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
  unit: string;
}

export const TopProductsRanking: React.FC<{ items: TopProductItem[]; currencySymbol?: string }> = ({
  items,
  currencySymbol = 'S/ ',
}) => {
  const maxRevenue = Math.max(...items.map((it) => it.totalRevenue), 1);

  return (
    <div className="space-y-3">
      {items.map((prod, index) => {
        const percent = Math.min(100, Math.round((prod.totalRevenue / maxRevenue) * 100));

        return (
          <div key={prod.id} className="group">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 text-center font-mono font-bold text-slate-400 group-hover:text-emerald-600">
                  #{index + 1}
                </span>
                <span className="font-medium text-slate-800 truncate">{prod.name}</span>
                <span className="text-slate-400 hidden sm:inline text-[11px]">· {prod.category}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                <span className="text-slate-500">
                  {prod.quantitySold} {prod.unit}s
                </span>
                <span className="font-semibold text-emerald-800">
                  {currencySymbol}{prod.totalRevenue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 group-hover:bg-emerald-600 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
