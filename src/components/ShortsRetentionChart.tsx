import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { VisualCanvasViewport } from './VisualCanvasViewport';

export interface ShortsRetentionData {
  second: number;
  retention: number;
}

interface ShortsRetentionChartProps {
  data: ShortsRetentionData[];
}

/** Source-native temporal renderer; outer visual chrome remains shell-owned. */
export const ShortsRetentionChart: React.FC<ShortsRetentionChartProps> = ({ data }) => {
  return (
    <VisualCanvasViewport id="shorts-retention" family="temporal" aspect="16:9">
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
    </VisualCanvasViewport>
  );
};