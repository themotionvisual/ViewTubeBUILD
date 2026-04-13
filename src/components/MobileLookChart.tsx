import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';

interface MobileLookChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}

export const MobileLookChart: React.FC<MobileLookChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  color = '#ff3399',
  height = 300 
}) => {
  const gradientId = `gradient-${yKey}`;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateSize = () => {
      const measured = element.getBoundingClientRect().width || element.clientWidth || 0;
      const nextWidth = Math.max(0, Math.floor(measured));
      setChartWidth((prev) => (prev === nextWidth ? prev : nextWidth));
    };

    updateSize();
    const frame = window.requestAnimationFrame(updateSize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateSize);
      observer.observe(element);
    }
    window.addEventListener('resize', updateSize);

    return () => {
      window.cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const chartHeight = Math.max(120, Math.floor(height || 0));
  const canRenderChart = chartWidth > 12 && chartHeight > 0;

  return (
    <div ref={containerRef} style={{ width: '100%', height: chartHeight, minHeight: chartHeight, minWidth: 0 }}>
      {canRenderChart ? (
        <AreaChart width={chartWidth} height={chartHeight} data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.10)" />
          <XAxis 
            dataKey={xKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 800, fill: 'rgba(0,0,0,0.3)' }}
            dy={10}
          />
          <YAxis 
            hide 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: '4px solid black', 
              fontWeight: 900, 
              textTransform: 'uppercase',
              fontSize: '12px'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            strokeWidth={4}
            fillOpacity={1} 
            fill={`url(#${gradientId})`} 
            dot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 8, stroke: 'black', strokeWidth: 3 }}
          />
        </AreaChart>
      ) : (
        <div style={{ width: '100%', height: chartHeight }} />
      )}
    </div>
  );
};
