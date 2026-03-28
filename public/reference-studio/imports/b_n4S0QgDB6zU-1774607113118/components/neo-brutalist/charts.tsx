"use client"

import { useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════
// NEO-BRUTALIST CHART COMPONENTS
// Pure SVG + React + Tailwind — Zero external chart libraries
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  pink: "oklch(0.65 0.28 350)",
  cyan: "oklch(0.75 0.18 195)",
  yellow: "oklch(0.92 0.19 95)",
  lime: "oklch(0.72 0.21 145)",
  purple: "oklch(0.70 0.20 280)",
  black: "oklch(0.12 0 0)",
  white: "oklch(0.98 0 0)",
  gray: "oklch(0.85 0 0)",
}

// ─────────────────────────────────────────────────────────────────────────────
// #19 SVG BAR CHART
// 7-day views with hover tooltips, colored bars, gridlines
// ─────────────────────────────────────────────────────────────────────────────
interface BarChartProps {
  data?: { label: string; value: number; color?: string }[]
}

export function NeoBarChart({ data }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const defaultData = [
    { label: "Mon", value: 65, color: COLORS.pink },
    { label: "Tue", value: 45, color: COLORS.cyan },
    { label: "Wed", value: 78, color: COLORS.yellow },
    { label: "Thu", value: 52, color: COLORS.lime },
    { label: "Fri", value: 89, color: COLORS.pink },
    { label: "Sat", value: 34, color: COLORS.cyan },
    { label: "Sun", value: 67, color: COLORS.yellow },
  ]
  
  const chartData = data || defaultData
  const maxValue = Math.max(...chartData.map(d => d.value))
  const barWidth = 40
  const gap = 20
  const chartHeight = 200
  const chartWidth = chartData.length * (barWidth + gap) + gap
  
  return (
    <div className="relative">
      <svg 
        width={chartWidth} 
        height={chartHeight + 40} 
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <line
            key={percent}
            x1={0}
            y1={chartHeight - (chartHeight * percent) / 100}
            x2={chartWidth}
            y2={chartHeight - (chartHeight * percent) / 100}
            stroke={COLORS.gray}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Bars */}
        {chartData.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight
          const x = gap + index * (barWidth + gap)
          const y = chartHeight - barHeight
          const isHovered = hoveredIndex === index
          
          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color || COLORS.pink}
                stroke={COLORS.black}
                strokeWidth={3}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-transform"
                style={{
                  transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                }}
              />
              
              {/* Shadow */}
              <rect
                x={x + 4}
                y={y + 4}
                width={barWidth}
                height={barHeight}
                fill={COLORS.black}
                className="-z-10"
              />
              
              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                fill={COLORS.black}
                className="text-sm font-bold"
              >
                {item.label}
              </text>
              
              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x - 10}
                    y={y - 35}
                    width={60}
                    height={28}
                    fill={COLORS.yellow}
                    stroke={COLORS.black}
                    strokeWidth={3}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 15}
                    textAnchor="middle"
                    fill={COLORS.black}
                    className="text-sm font-bold"
                  >
                    {item.value}K
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #20 LINE CHART
// Dual-series (Subs + Views), pink solid + cyan dashed, interactive hover
// ─────────────────────────────────────────────────────────────────────────────
interface LineChartProps {
  data1?: number[]
  data2?: number[]
}

export function NeoLineChart({ data1, data2 }: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ series: number; index: number } | null>(null)
  
  const series1 = data1 || [30, 45, 35, 60, 55, 75, 65]
  const series2 = data2 || [20, 35, 50, 40, 60, 50, 70]
  
  const chartWidth = 400
  const chartHeight = 200
  const padding = 20
  const maxValue = Math.max(...series1, ...series2)
  
  const getX = (index: number) => padding + (index / (series1.length - 1)) * (chartWidth - padding * 2)
  const getY = (value: number) => chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2)
  
  const createPath = (data: number[]) => {
    return data.map((value, index) => {
      const x = getX(index)
      const y = getY(value)
      return `${index === 0 ? "M" : "L"} ${x} ${y}`
    }).join(" ")
  }
  
  return (
    <div className="relative">
      <svg width={chartWidth} height={chartHeight + 40} className="overflow-visible">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <line
            key={percent}
            x1={padding}
            y1={chartHeight - padding - (chartHeight - padding * 2) * percent / 100}
            x2={chartWidth - padding}
            y2={chartHeight - padding - (chartHeight - padding * 2) * percent / 100}
            stroke={COLORS.gray}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Series 2 (dashed cyan) */}
        <path
          d={createPath(series2)}
          fill="none"
          stroke={COLORS.cyan}
          strokeWidth={3}
          strokeDasharray="8 4"
        />
        
        {/* Series 1 (solid pink) */}
        <path
          d={createPath(series1)}
          fill="none"
          stroke={COLORS.pink}
          strokeWidth={3}
        />
        
        {/* Interactive points - Series 1 */}
        {series1.map((value, index) => (
          <g key={`s1-${index}`}>
            <circle
              cx={getX(index)}
              cy={getY(value)}
              r={hoveredPoint?.series === 1 && hoveredPoint?.index === index ? 10 : 6}
              fill={COLORS.pink}
              stroke={COLORS.black}
              strokeWidth={3}
              onMouseEnter={() => setHoveredPoint({ series: 1, index })}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            />
            {hoveredPoint?.series === 1 && hoveredPoint?.index === index && (
              <text
                x={getX(index)}
                y={getY(value) - 15}
                textAnchor="middle"
                fill={COLORS.black}
                className="text-sm font-bold"
              >
                {value}K Views
              </text>
            )}
          </g>
        ))}
        
        {/* Interactive points - Series 2 */}
        {series2.map((value, index) => (
          <g key={`s2-${index}`}>
            <circle
              cx={getX(index)}
              cy={getY(value)}
              r={hoveredPoint?.series === 2 && hoveredPoint?.index === index ? 10 : 6}
              fill={COLORS.cyan}
              stroke={COLORS.black}
              strokeWidth={3}
              onMouseEnter={() => setHoveredPoint({ series: 2, index })}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            />
            {hoveredPoint?.series === 2 && hoveredPoint?.index === index && (
              <text
                x={getX(index)}
                y={getY(value) - 15}
                textAnchor="middle"
                fill={COLORS.black}
                className="text-sm font-bold"
              >
                {value}K Subs
              </text>
            )}
          </g>
        ))}
        
        {/* Legend */}
        <g transform={`translate(${chartWidth - 120}, ${chartHeight + 10})`}>
          <line x1={0} y1={10} x2={20} y2={10} stroke={COLORS.pink} strokeWidth={3} />
          <text x={25} y={14} fill={COLORS.black} className="text-xs font-bold">Views</text>
          <line x1={60} y1={10} x2={80} y2={10} stroke={COLORS.cyan} strokeWidth={3} strokeDasharray="4 2" />
          <text x={85} y={14} fill={COLORS.black} className="text-xs font-bold">Subs</text>
        </g>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #21 DONUT CHART
// 4-segment traffic sources with hover-highlight legend sync
// ─────────────────────────────────────────────────────────────────────────────
interface DonutChartProps {
  data?: { label: string; value: number; color: string }[]
}

export function NeoDonutChart({ data }: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const defaultData = [
    { label: "Direct", value: 35, color: COLORS.pink },
    { label: "Search", value: 30, color: COLORS.cyan },
    { label: "Social", value: 20, color: COLORS.yellow },
    { label: "Referral", value: 15, color: COLORS.lime },
  ]
  
  const chartData = data || defaultData
  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  const size = 200
  const center = size / 2
  const radius = 80
  const innerRadius = 50
  
  let currentAngle = -90
  
  const segments = chartData.map((item, index) => {
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)
    
    const ix1 = center + innerRadius * Math.cos(startRad)
    const iy1 = center + innerRadius * Math.sin(startRad)
    const ix2 = center + innerRadius * Math.cos(endRad)
    const iy2 = center + innerRadius * Math.sin(endRad)
    
    const largeArc = angle > 180 ? 1 : 0
    
    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix2} ${iy2}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
      Z
    `
    
    return { path, color: item.color, label: item.label, value: item.value, index }
  })
  
  return (
    <div className="flex items-center gap-8">
      <svg width={size} height={size} className="overflow-visible">
        {segments.map((segment) => (
          <path
            key={segment.index}
            d={segment.path}
            fill={segment.color}
            stroke={COLORS.black}
            strokeWidth={3}
            onMouseEnter={() => setHoveredIndex(segment.index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer transition-transform origin-center"
            style={{
              transform: hoveredIndex === segment.index ? "scale(1.05)" : "scale(1)",
            }}
          />
        ))}
        
        {/* Center text */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          fill={COLORS.black}
          className="text-2xl font-black"
        >
          {total}%
        </text>
        <text
          x={center}
          y={center + 15}
          textAnchor="middle"
          fill={COLORS.black}
          className="text-xs font-bold"
        >
          TOTAL
        </text>
      </svg>
      
      {/* Legend */}
      <div className="flex flex-col gap-2">
        {chartData.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-3 py-2 border-3 border-black transition-all cursor-pointer ${
              hoveredIndex === index ? "translate-x-1 -translate-y-1 shadow-[4px_4px_0px_black]" : ""
            }`}
            style={{ backgroundColor: hoveredIndex === index ? item.color : "white" }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="w-4 h-4 border-2 border-black"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-bold text-sm">{item.label}</span>
            <span className="font-black">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #22 RADAR/SPIDER CHART
// 5-metric pentagon — CTR, Watch Time, Subs Growth, Revenue, Engagement
// ─────────────────────────────────────────────────────────────────────────────
interface RadarChartProps {
  data?: { label: string; value: number }[]
}

export function NeoRadarChart({ data }: RadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const defaultData = [
    { label: "CTR", value: 75 },
    { label: "Watch Time", value: 85 },
    { label: "Subs Growth", value: 60 },
    { label: "Revenue", value: 70 },
    { label: "Engagement", value: 90 },
  ]
  
  const chartData = data || defaultData
  const size = 250
  const center = size / 2
  const maxRadius = 100
  const levels = 4
  
  const getPoint = (index: number, value: number) => {
    const angle = (index / chartData.length) * Math.PI * 2 - Math.PI / 2
    const radius = (value / 100) * maxRadius
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }
  
  const polygonPoints = chartData.map((item, index) => {
    const point = getPoint(index, item.value)
    return `${point.x},${point.y}`
  }).join(" ")
  
  return (
    <div className="relative">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid levels */}
        {Array.from({ length: levels }).map((_, level) => {
          const levelRadius = ((level + 1) / levels) * maxRadius
          const points = chartData.map((_, index) => {
            const angle = (index / chartData.length) * Math.PI * 2 - Math.PI / 2
            return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`
          }).join(" ")
          
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke={COLORS.gray}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )
        })}
        
        {/* Axes */}
        {chartData.map((_, index) => {
          const angle = (index / chartData.length) * Math.PI * 2 - Math.PI / 2
          const endX = center + maxRadius * Math.cos(angle)
          const endY = center + maxRadius * Math.sin(angle)
          
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke={COLORS.gray}
              strokeWidth={1}
            />
          )
        })}
        
        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill={COLORS.pink}
          fillOpacity={0.4}
          stroke={COLORS.pink}
          strokeWidth={3}
        />
        
        {/* Data points */}
        {chartData.map((item, index) => {
          const point = getPoint(index, item.value)
          const labelPoint = getPoint(index, 120)
          const isHovered = hoveredIndex === index
          
          return (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={isHovered ? 10 : 6}
                fill={COLORS.pink}
                stroke={COLORS.black}
                strokeWidth={3}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
              
              {/* Label */}
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={COLORS.black}
                className="text-xs font-bold"
              >
                {item.label}
              </text>
              
              {/* Value on hover */}
              {isHovered && (
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  fill={COLORS.black}
                  className="text-sm font-black"
                >
                  {item.value}%
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #23 SCATTER PLOT
// CTR vs Watch Time bubble plot with sized/colored points
// ─────────────────────────────────────────────────────────────────────────────
interface ScatterPlotProps {
  data?: { x: number; y: number; size: number; label: string }[]
}

export function NeoScatterPlot({ data }: ScatterPlotProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const defaultData = [
    { x: 20, y: 30, size: 15, label: "Video A" },
    { x: 45, y: 65, size: 25, label: "Video B" },
    { x: 70, y: 45, size: 20, label: "Video C" },
    { x: 30, y: 80, size: 30, label: "Video D" },
    { x: 85, y: 70, size: 18, label: "Video E" },
    { x: 55, y: 25, size: 22, label: "Video F" },
  ]
  
  const chartData = data || defaultData
  const chartWidth = 400
  const chartHeight = 250
  const padding = 40
  
  const colors = [COLORS.pink, COLORS.cyan, COLORS.yellow, COLORS.lime, COLORS.purple, COLORS.pink]
  
  return (
    <div className="relative">
      <svg width={chartWidth} height={chartHeight + 30} className="overflow-visible">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <g key={percent}>
            <line
              x1={padding}
              y1={chartHeight - padding - (chartHeight - padding * 2) * percent / 100}
              x2={chartWidth - padding}
              y2={chartHeight - padding - (chartHeight - padding * 2) * percent / 100}
              stroke={COLORS.gray}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <line
              x1={padding + (chartWidth - padding * 2) * percent / 100}
              y1={padding}
              x2={padding + (chartWidth - padding * 2) * percent / 100}
              y2={chartHeight - padding}
              stroke={COLORS.gray}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </g>
        ))}
        
        {/* Axes */}
        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke={COLORS.black}
          strokeWidth={3}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke={COLORS.black}
          strokeWidth={3}
        />
        
        {/* Axis labels */}
        <text x={chartWidth / 2} y={chartHeight + 5} textAnchor="middle" fill={COLORS.black} className="text-sm font-bold">
          CTR (%)
        </text>
        <text x={15} y={chartHeight / 2} textAnchor="middle" fill={COLORS.black} className="text-sm font-bold" transform={`rotate(-90, 15, ${chartHeight / 2})`}>
          Watch Time (min)
        </text>
        
        {/* Data points */}
        {chartData.map((point, index) => {
          const x = padding + (point.x / 100) * (chartWidth - padding * 2)
          const y = chartHeight - padding - (point.y / 100) * (chartHeight - padding * 2)
          const isHovered = hoveredIndex === index
          
          return (
            <g key={index}>
              {/* Shadow */}
              <circle
                cx={x + 3}
                cy={y + 3}
                r={point.size}
                fill={COLORS.black}
              />
              {/* Point */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? point.size + 5 : point.size}
                fill={colors[index % colors.length]}
                stroke={COLORS.black}
                strokeWidth={3}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all"
              />
              
              {/* Label on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={x - 40}
                    y={y - 45}
                    width={80}
                    height={35}
                    fill={COLORS.yellow}
                    stroke={COLORS.black}
                    strokeWidth={3}
                  />
                  <text x={x} y={y - 30} textAnchor="middle" fill={COLORS.black} className="text-xs font-bold">
                    {point.label}
                  </text>
                  <text x={x} y={y - 15} textAnchor="middle" fill={COLORS.black} className="text-xs">
                    CTR: {point.x}% | {point.y}min
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #24 DISTRIBUTION BLOCKS
// Proportional device breakdown (Grommet-inspired)
// ─────────────────────────────────────────────────────────────────────────────
interface DistributionBlocksProps {
  data?: { label: string; value: number; color: string }[]
}

export function NeoDistributionBlocks({ data }: DistributionBlocksProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const defaultData = [
    { label: "Mobile", value: 45, color: COLORS.pink },
    { label: "Desktop", value: 35, color: COLORS.cyan },
    { label: "Tablet", value: 15, color: COLORS.yellow },
    { label: "TV", value: 5, color: COLORS.lime },
  ]
  
  const chartData = data || defaultData
  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="w-full max-w-md">
      {/* Stacked bar */}
      <div className="flex h-12 border-3 border-black overflow-hidden">
        {chartData.map((item, index) => (
          <div
            key={index}
            className="relative h-full flex items-center justify-center transition-all cursor-pointer"
            style={{
              width: `${(item.value / total) * 100}%`,
              backgroundColor: item.color,
              transform: hoveredIndex === index ? "scaleY(1.1)" : "scaleY(1)",
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {item.value > 10 && (
              <span className="text-sm font-black text-black">{item.value}%</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {chartData.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-3 py-1 border-3 border-black transition-all cursor-pointer ${
              hoveredIndex === index ? "translate-x-1 -translate-y-1 shadow-[4px_4px_0px_black]" : ""
            }`}
            style={{ backgroundColor: hoveredIndex === index ? item.color : "white" }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="w-3 h-3 border-2 border-black"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-bold">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// #33 STACKED AREA CHART
// 2-layer traffic chart (Organic + Search)
// ─────────────────────────────────────────────────────────────────────────────
interface StackedAreaChartProps {
  data1?: number[]
  data2?: number[]
}

export function NeoStackedAreaChart({ data1, data2 }: StackedAreaChartProps) {
  const series1 = data1 || [20, 35, 45, 30, 55, 40, 60]
  const series2 = data2 || [15, 25, 20, 35, 25, 35, 30]
  
  const chartWidth = 400
  const chartHeight = 200
  const padding = 20
  
  const maxValue = Math.max(...series1.map((v, i) => v + series2[i]))
  
  const getX = (index: number) => padding + (index / (series1.length - 1)) * (chartWidth - padding * 2)
  const getY = (value: number) => chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2)
  
  // Bottom area (series1)
  const area1Path = `
    M ${getX(0)} ${chartHeight - padding}
    ${series1.map((value, index) => `L ${getX(index)} ${getY(value)}`).join(" ")}
    L ${getX(series1.length - 1)} ${chartHeight - padding}
    Z
  `
  
  // Top area (series2, stacked on series1)
  const area2Path = `
    M ${getX(0)} ${getY(series1[0])}
    ${series1.map((value, index) => `L ${getX(index)} ${getY(value + series2[index])}`).join(" ")}
    L ${getX(series1.length - 1)} ${getY(series1[series1.length - 1])}
    ${series1.map((value, index) => `L ${getX(series1.length - 1 - index)} ${getY(series1[series1.length - 1 - index])}`).join(" ")}
    Z
  `
  
  return (
    <div className="relative">
      <svg width={chartWidth} height={chartHeight + 40} className="overflow-visible">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <line
            key={percent}
            x1={padding}
            y1={chartHeight - padding - (chartHeight - padding * 2) * percent / 100}
            x2={chartWidth - padding}
            y2={chartHeight - padding - (chartHeight - padding * 2) * percent / 100}
            stroke={COLORS.gray}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Area 1 (bottom) */}
        <path
          d={area1Path}
          fill={COLORS.pink}
          fillOpacity={0.7}
          stroke={COLORS.pink}
          strokeWidth={3}
        />
        
        {/* Area 2 (top) */}
        <path
          d={area2Path}
          fill={COLORS.cyan}
          fillOpacity={0.7}
          stroke={COLORS.cyan}
          strokeWidth={3}
        />
        
        {/* Legend */}
        <g transform={`translate(${padding}, ${chartHeight + 15})`}>
          <rect x={0} y={0} width={16} height={16} fill={COLORS.pink} stroke={COLORS.black} strokeWidth={2} />
          <text x={22} y={12} fill={COLORS.black} className="text-xs font-bold">Organic</text>
          <rect x={80} y={0} width={16} height={16} fill={COLORS.cyan} stroke={COLORS.black} strokeWidth={2} />
          <text x={102} y={12} fill={COLORS.black} className="text-xs font-bold">Search</text>
        </g>
      </svg>
    </div>
  )
}
