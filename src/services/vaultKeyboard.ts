export type VaultKeyboardCommand =
 | "focus-search"
 | "toggle-quick-look"
 | "close-transient"
 | "toggle-mute"
 | "project-selection"
 | "focus-inspector"

export const resolveVaultKeyboardCommand = (input: {
 key: string
 metaKey: boolean
 ctrlKey: boolean
}): VaultKeyboardCommand | null => {
 const key = input.key.toLowerCase()
 const command = input.metaKey || input.ctrlKey

 if (command && key === "k") return "focus-search"
 if (command && key === "g") return "project-selection"
 if (!command && input.key === " ") return "toggle-quick-look"
 if (!command && input.key === "Escape") return "close-transient"
 if (!command && key === "m") return "toggle-mute"
 if (!command && input.key === "Enter") return "focus-inspector"
 return null
}


export const resolveVaultTagHotkey = (input: {
 key: string
 metaKey: boolean
 ctrlKey: boolean
}): number | null => {
 if (input.metaKey || input.ctrlKey) return null
 if (!/^[1-9]$/.test(input.key)) return null
 return Number(input.key) - 1
}
