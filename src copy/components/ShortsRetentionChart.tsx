import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface ShortsRetentionData {
  second: number;
  retention: number;
}

interface ShortsRetentionChartProps {
  data: ShortsRetentionData[];
}

export const ShortsRetentionChart: React.FC<ShortsRetentionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="second" hide />
        <YAxis domain={[0, 100]} hide />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="retention" 
          stroke="#00CCFF" 
          strokeWidth={4} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
