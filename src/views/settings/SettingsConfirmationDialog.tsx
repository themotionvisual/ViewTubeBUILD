import React from "react"
import { LockKeyhole, ShieldCheck } from "lucide-react"
import { SubToolboxActions, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxFieldLabel,
  SubToolboxInput,
  SubToolboxSurface,
} from "../../components/subtoolbox/SubToolboxPrimitives"

export type SettingsConfirmationKind = "cache" | "factory" | "delete"

const COPY: Record<SettingsConfirmationKind, { title: string; detail: string }> = {
  cache: {
    title: "Confirm local data clear",
    detail: "Clears ViewTube data stored on this device, including local settings, API keys, authentication cookies, cached analytics, IndexedDB and service-worker caches. Your server account is not deleted.",
  },
  factory: {
    title: "Confirm factory reset",
    detail: "Clears all local ViewTube data, settings, keys and authentication from this device. Export first if you need a recovery copy.",
  },
  delete: {
    title: "Confirm account deletion",
    detail: "Permanently deletes the ViewTube account and its server-side onboarding and AI-credit records. Active subscriptions must be canceled first.",
  },
}

export interface SettingsConfirmationDialogProps {
  kind: SettingsConfirmationKind
  requiredText: string
  value: string
  ready: boolean
  onChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

export const SettingsConfirmationDialog: React.FC<SettingsConfirmationDialogProps> = ({
  kind,
  requiredText,
  value,
  ready,
  onChange,
  onClose,
  onConfirm,
}) => {
  const copy = COPY[kind]

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-black/70 p-3"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose()
          return
        }
        if (event.key !== "Tab") return
        const dialog = event.currentTarget.querySelector<HTMLElement>("[role='dialog']")
        const focusable = Array.from(
          dialog?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])",
          ) || [],
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }}
    >
      <SubToolboxSurface
        level="l0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-confirm-title"
        className="w-full max-w-xl"
      >
        <SubToolboxStack density="dense">
          <SubToolboxAlert
            level="l1"
            tone="danger"
            icon={<LockKeyhole size={20} />}
            title={<span id="settings-confirm-title">{copy.title}</span>}
            detail={copy.detail}
          />
          <SubToolboxFieldLabel level="l2" htmlFor="settings-confirm-text">
            Type {requiredText} to continue
          </SubToolboxFieldLabel>
          <SubToolboxInput
            id="settings-confirm-text"
            level="l1"
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          <SubToolboxActions columns={2}>
            <SubToolboxButton
              level="l1"
              tone="neutral"
              icon={<ShieldCheck size={18} />}
              onClick={onClose}
            >
              Cancel
            </SubToolboxButton>
            <SubToolboxButton
              level="l1"
              tone="danger"
              icon={<LockKeyhole size={18} />}
              disabled={!ready}
              onClick={onConfirm}
            >
              Confirm action
            </SubToolboxButton>
          </SubToolboxActions>
        </SubToolboxStack>
      </SubToolboxSurface>
    </div>
  )
}
