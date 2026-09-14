import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface ShortsRetentionData {
  second: number;
  retention: number;
}

interface ShortsRetentionChartProps {
  data: ShortsRetentionData[];
}

/**
 * Source-native responsive viewport for the Shorts Retention visual.
 *
 * The chart owns its analytical canvas instead of depending on a parent pixel
 * height or the legacy title-matching 16:9 compatibility script.  The outer
 * visual frame may still own chrome, controls, legends and explanation copy.
 */
export const ShortsRetentionChart: React.FC<ShortsRetentionChartProps> = ({ data }) => {
  return (
    <div
      data-vt-visual-canvas="shorts-retention"
      data-vt-visual-family="temporal"
      data-vt-visual-aspect="16:9"
      style={{
        width: '100%',
        maxWidth: '100%',
        aspectRatio: '16 / 9',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        touchAction: 'pan-y',
      }}
    >
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
    </div>
  );
};