import { useState, useRef, useEffect } from "react";
import type { PerformanceHubTableDatasetId } from "../../services/performanceHubTableRegistry";
import { resolvePerformanceHubThumbnailUrl } from "../../services/performanceHubTablePresentation";

type PerformanceHubDataGridRow = Record<string, unknown>;

type PerformanceHubDataGridProps = {
  datasetId: PerformanceHubTableDatasetId;
  headers: string[];
  rows: PerformanceHubDataGridRow[];
  selectedRowIds: Set<string>;
  allVisibleSelected: boolean;
  getRowId: (row: PerformanceHubDataGridRow, index: number) => string;
  getCellValue: (
    row: PerformanceHubDataGridRow,
    header: string,
    index: number,
    datasetId: PerformanceHubTableDatasetId,
  ) => string;
  onToggleRow: (id: string) => void;
  onToggleAllVisible: () => void;
  onSortHeader: (header: string) => void;
  getSortIndicator: (header: string) => string;
  emptyMessage?: string;
  onScroll?: (node: HTMLDivElement) => void;
  onNearBottom?: () => void;
};

const compactHeader = (header: string): string => header.trim().toLowerCase();

const isVideoTitleHeader = (header: string): boolean =>
  ["video title", "video", "title"].includes(compactHeader(header));

const isTextHeader = (header: string): boolean =>
  [
    "Video title",
    "Video",
    "Video ID",
    "Format",
    "Upload date",
    "Date",
    "Type",
    "Dimension",
    "Title",
    "Category",
    "Video category",
  ].includes(header);

const gridTemplateForHeaders = (headers: string[]): string => {
  const columnWidth = (header: string): string => {
    if (isVideoTitleHeader(header)) return "minmax(160px, 320px)";
    // By placing everything in a single grid, min-content forces the column
    // to be exactly the width of the widest word in the header OR the widest
    // data cell, allowing the header text to wrap without any extra whitespace.
    return "min-content";
  };

  return ["32px", "32px", ...headers.map(columnWidth)].join(" ");
};

const safeText = (value: unknown): string => {
  if (value === null || value === undefined) return "-";
  const text = String(value);
  return text.trim() ? text : "-";
};

const FastForwardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
  </svg>
);

const RewindIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
  </svg>
);

export function PerformanceHubDataGrid({
  datasetId,
  headers,
  rows,
  selectedRowIds,
  allVisibleSelected,
  getRowId,
  getCellValue,
  onToggleRow,
  onToggleAllVisible,
  onSortHeader,
  getSortIndicator,
  emptyMessage,
  onScroll,
  onNearBottom,
}: PerformanceHubDataGridProps) {
  const gridTemplateColumns = gridTemplateForHeaders(headers);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScrollDir, setAutoScrollDir] = useState<"left" | "right" | null>(
    null,
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    const rect = scrollRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const canScrollLeft = scrollRef.current.scrollLeft > 1;
    const canScrollRight =
      scrollRef.current.scrollLeft <
      scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 1;

    if (x < rect.width * 0.15 && canScrollLeft) {
      if (autoScrollDir !== "left") setAutoScrollDir("left");
    } else if (x > rect.width * 0.85 && canScrollRight) {
      if (autoScrollDir !== "right") setAutoScrollDir("right");
    } else {
      if (autoScrollDir !== null) setAutoScrollDir(null);
    }
  };

  const handleMouseLeave = () => {
    if (autoScrollDir !== null) setAutoScrollDir(null);
  };

  useEffect(() => {
    if (!autoScrollDir) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollStep = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (scrollRef.current) {
        const speed = 0.5; // pixels per millisecond
        const amount = speed * delta;

        if (autoScrollDir === "left") {
          scrollRef.current.scrollLeft -= amount;
          if (scrollRef.current.scrollLeft <= 0) {
            setAutoScrollDir(null);
            return;
          }
        } else {
          scrollRef.current.scrollLeft += amount;
          if (
            scrollRef.current.scrollLeft >=
            scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 1
          ) {
            setAutoScrollDir(null);
            return;
          }
        }
      }

      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => cancelAnimationFrame(animationFrameId);
  }, [autoScrollDir]);

  return (
    <div
      className="relative group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollRef}
        className="h-[620px] overflow-auto bg-white custom-scrollbar [scrollbar-gutter:stable]"
        onScroll={(event) => {
          const node = event.currentTarget;
          onScroll?.(node);
          if (node.scrollTop + node.clientHeight >= node.scrollHeight - 24) {
            onNearBottom?.();
          }
        }}
      >
        <div
          className="grid min-w-max bg-white"
          style={{ gridTemplateColumns }}
        >
          <div className="sticky left-0 top-0 z-40 flex items-center justify-center border-b-[3px] border-r border-black bg-[#EDEDED] px-[2px] py-1 text-center text-[10px] font-black uppercase">
            #
          </div>
          <div className="sticky top-0 z-30 flex items-center justify-center border-b-[3px] border-r border-black/20 bg-[#EDEDED] px-[2px] py-1 text-center">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={onToggleAllVisible}
              className="h-4 w-4 border-[2px] border-black accent-black"
            />
          </div>
          {headers.map((header) => (
            <button
              key={`head-${header}`}
              type="button"
              title={`Sort by ${header}`}
              onClick={() => onSortHeader(header)}
              className="sticky top-0 z-30 flex min-h-[34px] items-center justify-center border-b-[3px] border-r border-black/20 bg-[#EDEDED] px-[2px] py-1 text-center text-[9px] font-black uppercase tracking-[0.12em] text-black hover:bg-[#CCFF00]/40"
            >
              <span className="block whitespace-normal break-words leading-tight">
                {header}
                {getSortIndicator(header)}
              </span>
            </button>
          ))}

          {rows.length === 0 ? (
            <div className="col-span-full p-8 text-center text-sm font-black uppercase tracking-wider text-black/35">
              {emptyMessage || "No rows are available for this table."}
            </div>
          ) : (
            rows.map((row, rowIndex) => {
              const rowId = getRowId(row, rowIndex);
              const isSelected = selectedRowIds.has(rowId);
              const rowBg = isSelected
                ? "bg-[#FFF2A8]"
                : rowIndex % 2 === 0
                  ? "bg-white"
                  : "bg-gray-50";
              return (
                <div key={rowId} className="contents">
                  <div
                    className={`sticky left-0 z-20 flex min-h-[46px] items-center justify-center border-b border-r border-black/20 bg-[#CCFF00] px-[2px] py-1 text-center text-xl font-black leading-none text-black`}
                  >
                    {rowIndex + 1}
                  </div>
                  <div
                    className={`flex items-center justify-center border-b border-r border-black/10 px-[2px] py-1 text-center ${rowBg}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRow(rowId)}
                      className="h-4 w-4 border-[2px] border-black accent-black"
                    />
                  </div>
                  {headers.map((header) => {
                    let value = "-";
                    try {
                      value = safeText(
                        getCellValue(row, header, rowIndex, datasetId),
                      );
                    } catch {
                      value = safeText(row[header]);
                    }
                    const textColumn = isTextHeader(header);
                    const titleColumn = isVideoTitleHeader(header);
                    const thumbnailUrl = titleColumn
                      ? resolvePerformanceHubThumbnailUrl(row)
                      : "";
                    return (
                      <div
                        key={`${rowId}-${header}`}
                        title={value}
                        className={`flex min-w-0 items-center overflow-hidden border-b border-r border-black/10 px-[2px] py-1 text-xs font-bold text-black ${titleColumn ? "justify-start text-left" : textColumn ? "justify-center text-center" : "justify-center text-center"} ${rowBg}`}
                      >
                        {titleColumn ? (
                          <div className="flex min-w-0 items-center gap-1">
                            {thumbnailUrl ? (
                              <img
                                src={thumbnailUrl}
                                alt=""
                                loading="lazy"
                                className="h-9 w-16 shrink-0 rounded-[4px] border-[2px] border-black bg-[#EDEDED] object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-16 shrink-0 items-center justify-center rounded-[4px] border-[2px] border-black bg-[#EDEDED] text-[8px] font-black uppercase tracking-widest text-black/35">
                                No Img
                              </div>
                            )}
                            <span className="block min-w-0 truncate">
                              {value}
                            </span>
                          </div>
                        ) : (
                          <span className="block min-w-0 truncate">
                            {value}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Left Auto-Scroll Overlay */}
      {autoScrollDir === "left" && (
        <div className="pointer-events-none absolute left-[40px] top-0 bottom-0 w-[15%] bg-[#CCFF00]/10 flex flex-col items-center justify-center backdrop-blur-[2px] border-r-[4px] border-[#CCFF00]">
          <div className="bg-[#CCFF00] border-[4px] border-black text-black rounded-full p-4 flex flex-col items-center gap-2 shadow-[4px_4px_0_#B14AED]">
            <RewindIcon className="w-8 h-8" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Rewind
            </span>
          </div>
        </div>
      )}

      {/* Right Auto-Scroll Overlay */}
      {autoScrollDir === "right" && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-[15%] bg-[#CCFF00]/10 flex flex-col items-center justify-center backdrop-blur-[2px] border-l-[4px] border-[#CCFF00]">
          <div className="bg-[#CCFF00] border-[4px] border-black text-black rounded-full p-4 flex flex-col items-center gap-2 shadow-[4px_4px_0_#B14AED]">
            <FastForwardIcon className="w-8 h-8" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Forward
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
