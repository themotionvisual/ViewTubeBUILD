export type VaultKeyboardCommand =
 | "focus-search"
 | "toggle-quick-look"
 | "close-transient"
 | "toggle-mute"

export const resolveVaultKeyboardCommand = (input: {
 key: string
 metaKey: boolean
 ctrlKey: boolean
}): VaultKeyboardCommand | null => {
 const key = input.key.toLowerCase()
 const command = input.metaKey || input.ctrlKey

 if (command && key === "k") return "focus-search"
 if (!command && input.key === " ") return "toggle-quick-look"
 if (!command && input.key === "Escape") return "close-transient"
 if (!command && key === "m") return "toggle-mute"
 return null
}
