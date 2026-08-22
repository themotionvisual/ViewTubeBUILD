import type { VtSyncTableDefinition } from "./contracts"
import { formatVtSyncTableCellValue } from "./tableFormatting"

type VtSyncExportRow = Record<string, unknown>

const rawVtSyncExportValue = (value: unknown): string => {
 if (value === null || value === undefined) return ""
 if (typeof value === "string") return value
 if (typeof value === "number" || typeof value === "boolean") return String(value)
 try { return JSON.stringify(value) }
 catch { return String(value) }
}

export const getVtSyncTableExportHeaders = (table: VtSyncTableDefinition): string[] =>
 table.columns.map((column) => column.label)

export const getVtSyncTableExportRows = (
 table: VtSyncTableDefinition,
 rows: VtSyncExportRow[],
): string[][] =>
 rows.map((row) =>
  table.columns.map((column) => table.exportMode === "raw"
   ? rawVtSyncExportValue(row[column.key])
   : formatVtSyncTableCellValue(row[column.key], column.format)),
 )
