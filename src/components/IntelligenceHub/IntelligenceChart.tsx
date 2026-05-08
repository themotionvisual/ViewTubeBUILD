
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Legend
} from 'recharts';
import type { ChartConfig } from './types';

interface Props {
  config: ChartConfig;
  data: any[];
}

const COLORS = ['#FF3399', '#33FF00', '#00FFFF', '#FFB158', '#9D4EDD', '#FF0000'];

export const IntelligenceChart: React.FC<Props> = ({ config, data }) => {
  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey={config.xAxisKey} tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '4px solid black', borderRadius: '12px', fontWeight: 'bold' }}
            />
            {config.dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} stroke="black" strokeWidth={2} />
            ))}
          </BarChart>
        );

      case 'line':
      case 'frequency':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey={config.xAxisKey} tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '4px solid black', borderRadius: '12px', fontWeight: 'bold' }}
            />
            {config.dataKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={4} dot={{ r: 6, stroke: 'black', strokeWidth: 2 }} />
            ))}
          </LineChart>
        );

      case 'scatter':
      case 'quadrant':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis type="number" dataKey={config.xAxisKey} name={config.xAxisKey} unit="" tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <YAxis type="number" dataKey={config.dataKeys[0]} name={config.dataKeys[0]} unit="" tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <ZAxis type="number" range={[60, 400]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: 'white', border: '4px solid black', borderRadius: '12px', fontWeight: 'bold' }}
            />
            <Scatter name="Videos" data={data} fill="#FF3399" stroke="black" strokeWidth={2} />
            {config.type === 'quadrant' && (
              <>
                {/* Simplified Quadrant lines would go here if we had axis bounds */}
              </>
            )}
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#ccc" />
            <PolarAngleAxis dataKey={config.xAxisKey} tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <PolarRadiusAxis />
            {config.dataKeys.map((key, i) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '4px solid black', borderRadius: '12px', fontWeight: 'bold' }}
            />
          </RadarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={config.dataKeys[0]}
              stroke="black"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '4px solid black', borderRadius: '12px', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        );

      default:
        return <div className="flex items-center justify-center h-full italic text-gray-400">Chart type [{config.type}] not yet implemented in Recharts engine.</div>;
    }
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <div className="text-xs font-black uppercase mb-4 opacity-60 tracking-widest">{config.title}</div>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
      {config.description && (
        <div className="mt-4 p-3 bg-black/5 rounded-xl border-l-4 border-black text-[10px] font-bold">
          {config.description}
        </div>
      )}
    </div>
  );
};
