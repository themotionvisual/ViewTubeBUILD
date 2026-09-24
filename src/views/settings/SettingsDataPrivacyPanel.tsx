import React from "react"
import { Database, Download, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxActions, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import { SubToolboxAlert, SubToolboxButton, SubToolboxFieldLabel, SubToolboxSelect, SubToolboxStatusBadge } from "../../components/subtoolbox/SubToolboxPrimitives"
import type { IngestMode } from "../../services/productArchitecture"

const INGEST_MODES: Array<{ value: IngestMode; label: string }> = [
  { value: "connected", label: "Connected API sync" },
  { value: "import", label: "Imported datasets" },
  { value: "hybrid", label: "Hybrid" },
  { value: "public_handle", label: "Public handle" },
]

export interface SettingsDataPrivacyPanelProps {
  dataResetStatus: string | null
  exportStatus: string | null
  ingestMode: IngestMode
  onDeleteAccount: () => void
  onExport: () => void
  onIngestModeChange: (mode: IngestMode) => void
  onOpenTransparencyCenter: () => void
  onRunFactoryReset: () => void
  onRunSoftReset: () => void
  showInternalOpsLink: boolean
}

export const SettingsDataPrivacyPanel: React.FC<SettingsDataPrivacyPanelProps> = (props) => {
  const { dataResetStatus, exportStatus, ingestMode, onDeleteAccount, onExport, onIngestModeChange, onOpenTransparencyCenter, onRunFactoryReset, onRunSoftReset, showInternalOpsLink } = props
  const ingestLabel = INGEST_MODES.find((mode) => mode.value === ingestMode)?.label ?? ingestMode
  return (
    <div className="grid gap-3">
      <SubToolbox title="Analytics Source" icon={<Database />} paletteIndex={6} persistenceId="settings-data-source" helpText="Choose where canonical analytics and master tables read their data.">
        <SubToolboxStack density="dense">
          <SubToolboxFieldLabel level="l2" htmlFor="settings-ingest-mode">Ingest mode</SubToolboxFieldLabel>
          <SubToolboxSelect id="settings-ingest-mode" value={ingestMode} onChange={(event) => onIngestModeChange(event.target.value as IngestMode)}>
            {INGEST_MODES.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
          </SubToolboxSelect>
          <SubToolboxAlert level="l1" tone="info" title={ingestLabel} detail="Connected uses API sync; Import uses uploaded datasets; Hybrid supplements canonical rows; Public handle is limited public analytics." action={<SubToolboxStatusBadge level="l2">Active source</SubToolboxStatusBadge>} />
        </SubToolboxStack>
      </SubToolbox>

      <SubToolbox title="Export + Transparency" icon={<Download />} paletteIndex={7} persistenceId="settings-data-export">
        <SubToolboxStack density="dense">
          <SubToolboxActions columns={2}>
            <SubToolboxButton level="l1" icon={<Download size={18} />} onClick={onExport}>Export all data</SubToolboxButton>
            {showInternalOpsLink ? <SubToolboxButton level="l1" tone="neutral" icon={<ShieldCheck size={18} />} onClick={onOpenTransparencyCenter}>Data center</SubToolboxButton> : null}
          </SubToolboxActions>
          {exportStatus ? <SubToolboxAlert level="l2" tone="success" title="Export status" detail={exportStatus} /> : null}
        </SubToolboxStack>
      </SubToolbox>

      <div className="grid gap-3 xl:grid-cols-2">
        <SubToolbox title="Recovery" icon={<Trash2 />} paletteIndex={8} collapsible isOpenInitial={false} persistenceId="settings-data-recovery" helpText="Local recovery controls are separated from everyday data settings.">
          <SubToolboxStack density="dense">
            <SubToolboxAlert level="l1" tone="warning" icon={<Trash2 size={20} />} title="Clear local data" detail="Clear ViewTube data stored on this device without deleting the server account." action={<SubToolboxButton level="l2" size="compact" tone="warning" onClick={onRunSoftReset}>Clear</SubToolboxButton>} />
            <SubToolboxAlert level="l1" tone="warning" icon={<Trash2 size={20} />} title="Factory reset" detail="Clear local ViewTube data, settings, keys and authentication on this device." action={<SubToolboxButton level="l2" size="compact" tone="ink" onClick={onRunFactoryReset}>Reset</SubToolboxButton>} />
            {dataResetStatus ? <SubToolboxAlert level="l2" tone="info" title="Recovery status" detail={dataResetStatus} /> : null}
          </SubToolboxStack>
        </SubToolbox>

        <SubToolbox title="Danger Zone" icon={<LockKeyhole />} paletteIndex={9} collapsible isOpenInitial={false} persistenceId="settings-data-danger" helpText="Permanent account deletion remains isolated and confirmation-protected.">
          <SubToolboxAlert level="l1" tone="danger" icon={<LockKeyhole size={20} />} title="Delete ViewTube account" detail="Permanently deletes server-side account records after the existing typed confirmation flow." action={<SubToolboxButton level="l2" size="compact" tone="danger" onClick={onDeleteAccount}>Delete</SubToolboxButton>} />
        </SubToolbox>
      </div>
    </div>
  )
}