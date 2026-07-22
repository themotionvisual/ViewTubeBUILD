import type { VtSyncTableDefinition } from "./contracts"
import { formatVtSyncTableCellValue } from "./tableFormatting"

type VtSyncExportRow = Record<string, unknown>

export const getVtSyncTableExportHeaders = (table: VtSyncTableDefinition): string[] =>
 table.columns.map((column) => column.label)

export const getVtSyncTableExportRows = (
 table: VtSyncTableDefinition,
 rows: VtSyncExportRow[],
): string[][] =>
 rows.map((row) =>
  table.columns.map((column) => formatVtSyncTableCellValue(row[column.key], column.format)),
 )
