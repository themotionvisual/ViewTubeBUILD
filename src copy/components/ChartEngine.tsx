import React, { useState, useMemo } from "react";
import { Chart } from "react-google-charts";
import type { ChartConfig } from "../types";
import { AlertCircle } from "lucide-react";
import { CHART_THEME } from "../chartSystem/unifiedChartSpec";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const GoogleChartWrapper: React.FC<any> = (props) => (
  <Chart {...props} version="current" />
);

export const MemoizedGoogleChart = React.memo(GoogleChartWrapper, (prev: any, next: any) => {
  return prev.data === next.data &&
    prev.options === next.options &&
    prev.chartEvents === next.chartEvents;
});

// --- GOOGLE CHART RENDERING ---
export const RenderGoogleChart: React.FC<{ chart: ChartConfig; data: any[] }> = ({
  chart,
  data,
}) => {
  const typeKey = String(chart.type || "").trim().toLowerCase();

  const googleData = useMemo(() => {
    if (typeof chart.data === "function") {
      const result = chart.data();
      if (result) return result;
    }
    return data || [];
  }, [chart, data]);

  if (typeKey === "geographysplitview") {
    if (!GOOGLE_MAPS_API_KEY) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white border-[4px] border-black rounded-2xl text-center">
          <AlertCircle size={48} className="text-[#FF7497] mb-4" />
          <h3 className="text-xl font-black uppercase mb-2">Google Maps Key Required</h3>
          <p className="text-sm font-bold text-black/60 max-w-md">
            To view geographic data, you must provide a Google Maps API key in your environment variables as <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code>.
          </p>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex flex-col p-4 bg-white border-[4px] border-black rounded-2xl overflow-hidden">
        <Chart
          chartType="GeoChart"
          width="100%"
          height="100%"
          data={googleData as any}
          mapsApiKey={GOOGLE_MAPS_API_KEY}
          options={{
            keepAspectRatio: true,
            chartArea: { width: "95%", height: "95%" },
            colorAxis: {
              colors: [
                CHART_THEME.palette.cyan,
                CHART_THEME.palette.lime,
                CHART_THEME.palette.yellow,
                CHART_THEME.palette.orange,
                CHART_THEME.palette.pink,
              ],
            },
            datalessRegionColor: "#f5f5f5",
            backgroundColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (typeKey === "topperformerstrio") {
    return (
      <div className="grid grid-cols-3 gap-6 h-full p-4 overflow-y-auto">
        <TrioPieCard chart={{ title: "REVENUE", data: (googleData as any)?.moneyMakers || [] }} />
        <TrioPieCard chart={{ title: "WATCH HOURS", data: (googleData as any)?.mostViewed || [] }} />
        <TrioPieCard chart={{ title: "SUBS", data: (googleData as any)?.newSubs || [] }} />
      </div>
    );
  }

  const chartTypeMap: any = {
    line: "LineChart",
    bar: "BarChart",
    column: "ColumnChart",
    scatter: "ScatterChart",
    bubble: "BubbleChart",
    pie: "PieChart",
    geo: "GeoChart",
    geochart: "GeoChart",
    combo: "ComboChart",
    combochart: "ComboChart",
    steppedarea: "SteppedAreaChart",
    steppedareachart: "SteppedAreaChart",
    treemap: "TreeMap",
    contenttypedistribution: "PieChart",
    wordtree: "WordTree"
  };

  return (
    <Chart
      chartType={chartTypeMap[typeKey] || "LineChart"}
      width="100%"
      height="100%"
      data={googleData as any}
      mapsApiKey={typeKey === "geo" || typeKey === "geochart" ? GOOGLE_MAPS_API_KEY : undefined}
      options={{
        backgroundColor: "transparent",
        chartArea: { width: "95%", height: "80%", left: "5%", top: "10%" },
        colors: [
          CHART_THEME.palette.cyan,
          CHART_THEME.palette.lime,
          CHART_THEME.palette.pink,
          CHART_THEME.palette.yellow,
          CHART_THEME.palette.orange,
          CHART_THEME.palette.violet,
        ],
        ...chart.options
      }}
    />
  );
};

// --- CUSTOM CHART SUB-COMPONENTS ---
export const TrioPieCard = ({ chart, colors, pieStartAngle = 0, height = "240px" }: { chart: { title: string; data: any[] }, colors?: string[], pieStartAngle?: number, height?: string }) => {
  const topSlice = useMemo(() => {
    if (!chart.data || chart.data.length <= 1) return null;
    const slices = [...chart.data.slice(1)];
    slices.sort((a, b) => {
      const vA = typeof a[1] === 'object' ? a[1].v : a[1];
      const vB = typeof b[1] === 'object' ? b[1].v : b[1];
      return vB - vA;
    });
    return slices[0];
  }, [chart.data]);

  const [displaySlice, setDisplaySlice] = useState<any>(topSlice);

  const chartOptions = {
    legend: { position: "none" },
    backgroundColor: "transparent",
    colors: colors || [
      CHART_THEME.palette.cyan,
      CHART_THEME.palette.lime,
      CHART_THEME.palette.yellow,
      CHART_THEME.palette.orange,
      CHART_THEME.palette.pink,
      CHART_THEME.palette.magenta,
    ],
    pieHole: 0.5,
    chartArea: { width: "88%", height: "88%", left: "6%", top: "6%" },
    pieSliceText: "value",
    pieSliceBorderColor: "transparent",
    pieSliceTextStyle: { color: "white", fontSize: 13, fontName: "Inter", bold: true },
    pieStartAngle: pieStartAngle,
    tooltip: { trigger: "none" },
  };

  const chartEvents = [
    {
      eventName: "ready" as any,
      callback: ({ chartWrapper, google }: any) => {
        const c = chartWrapper.getChart();
        google.visualization.events.addListener(c, "onmouseover", (e: any) => {
          if (e && e.row !== null) setDisplaySlice(chart.data[e.row + 1]);
        });
      },
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-0 transition-all group/trio origin-center w-full" style={{ height: height }}>
      <div className="w-full h-full pointer-events-auto relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="text-[14px] font-black uppercase text-black max-w-[80px] text-center leading-none tracking-tighter group-hover/trio:scale-110 transition-transform">
            {chart.title}
          </span>
        </div>
        <MemoizedGoogleChart chartType="PieChart" width="100%" height="100%" data={chart.data} options={chartOptions as any} chartEvents={chartEvents} version="current" />
      </div>
      {height !== "200px" && displaySlice && (
        <div className="flex flex-col items-center justify-center -mt-16 px-4">
          <span className="text-[12px] font-black text-black/50 uppercase tracking-widest leading-none mb-1 line-clamp-3 w-[260px] text-center">{displaySlice[0]}</span>
          <span className="text-[20px] font-black text-indigo-500 tracking-tighter leading-none">
            {typeof displaySlice[1] === "object" ? displaySlice[1].f || displaySlice[1].v : displaySlice[1].toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

// --- CHART RENDERING ENGINE ---
export const RenderChart: React.FC<{
  chart: ChartConfig;
  data?: any[];
  isModal?: boolean;
  fallbackData?: any[];
  dataDateRange?: string;
}> = ({
  chart,
  data,
  isModal = false,
  fallbackData = [],
  dataDateRange = "",
}) => {
    const chartData = (data && data.length > 0) ? data : fallbackData;
    const rawType = String(chart.type || "").trim().toLowerCase();
    const provider = String(chart.provider || "google").toLowerCase();
    const isKnownProvider = provider === "google" || provider === "recharts";

    // 1. ELITE HTML TABLE OVERRIDE
    if (rawType === "table") {
      const tableData = (typeof chart.data === "function" ? chart.data() : []);
      const hasData = tableData.length > 1;

      return (
        <div className={`w-full flex flex-col ${isModal ? "h-full" : "h-[400px] mt-2 bg-white border-[4px] border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_black]"}`}>
          <div className="flex-1 min-h-0 overflow-auto bg-gray-50/20">
            <table className="w-full text-left text-[11px] font-black border-collapse">
              <thead className="sticky top-0 bg-black text-white z-10">
                <tr>
                  {(hasData ? tableData[0] : ["METRIC", "VALUE"]).map((h: any, i: number) => (
                    <th key={i} className="p-3 border-r border-white/10 uppercase tracking-tighter whitespace-nowrap">{String(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(hasData ? tableData.slice(1) : [["NO DATA DETECTED", "0"]]).map((row: any, i: number) => (
                  <tr key={i} className={`border-b border-black/5 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#FFDD00]/20`}>
                    {row.map((cell: any, j: number) => (
                      <td key={j} className="p-3 border-r border-black/5 tabular-nums">
                        {typeof cell === "number" ? (cell > 1 ? cell.toLocaleString() : cell.toFixed(3)) : String(cell || "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 2. DATA LOAD VERIFICATION
    if (!chartData || chartData.length === 0) {
      if (provider === "google" || provider === "recharts" || !chart.provider) {
        const checkData = (typeof chart.data === "function" ? chart.data() : []);
        if (checkData.length <= 1) return <div className="p-8 text-center font-black opacity-20 uppercase">Station Idle: No Dataset</div>;
      } else {
        return <div className="p-8 text-center font-black opacity-20 uppercase">Station Idle: No dataset</div>;
      }
    }

    return (
      <div className={`w-full flex flex-col ${isModal ? "h-full" : "h-[450px] mt-6 bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] overflow-hidden"}`}>
        <div className="flex-1 min-h-0">
          {isKnownProvider ? (
            <RenderGoogleChart chart={chart} data={chartData} />
          ) : (
            <div className="p-8 text-center font-black">Unknown Provider: {provider}</div>
          )}
        </div>

        <div className="bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest flex justify-between items-center border-t-[4px] border-black">
          <div className="flex items-center gap-4">
            <span className="text-[#FFDD00]">{chart.title}</span>
            <span className="opacity-40">|</span>
            <span>{chartData.length} Records</span>
          </div>
          {dataDateRange && <span className="text-[#FF7497]">{dataDateRange}</span>}
        </div>
      </div>
    );
  };
