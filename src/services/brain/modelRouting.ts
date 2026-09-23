/**
 * Model routing, made reportable.
 *
 * `getActiveModel` applies a capability policy that overrides the creator's stored model
 * preference: it computes the preference, then returns a hardcoded model for text,
 * fast-text, image, video and audio, so a creator who selected a pro model is served a
 * lite one for every text generation and is never told.
 *
 * That policy may well be correct — an image capability needs an image model, and routing
 * cheap work to a cheap model is good practice. What is not defensible is doing it
 * invisibly. Every quality or cost measurement taken while the served model is unknown is
 * uninterpretable, and a creator comparing outputs after changing their preference sees no
 * difference and concludes the setting is broken.
 *
 * This module states the policy in one place and reports what it did. It deliberately does
 * not change which model is served: correcting the policy is a product decision with cost
 * implications, and it should be made explicitly rather than as a side effect of adding
 * observability.
 */

export type ModelCapability =
 | "text"
 | "image"
 | "video"
 | "thinking"
 | "analysis"
 | "fast-text"
 | "audio"
 | "tts"
 | "live"

export type ModelSubstitutionReason =
 /** The creator's preference was used. */
 | "honoured"
 /** The capability requires a specific model, so the preference was overridden. */
 | "capability_requires_model"
 /** A blanket policy overrode the preference for this capability. */
 | "capability_policy_override"

export interface ModelResolution {
 capability: ModelCapability
 /** The creator's preference, canonicalised. */
 requested: string
 /** The model that will actually be sent to the provider. */
 served: string
 substituted: boolean
 reason: ModelSubstitutionReason
}

/**
 * Capabilities whose model is dictated by the modality rather than by preference.
 * Overriding here is legitimate: a text model cannot generate an image.
 */
const MODALITY_REQUIRED: Partial<Record<ModelCapability, string>> = {
 image: "gemini-3.1-flash-image-preview",
 video: "gemini-3-flash-preview",
 audio: "gemini-3-flash-preview",
}

/**
 * Capabilities where a blanket policy currently overrides preference. These are the
 * substitutions worth surfacing, because a creator could reasonably expect their
 * preference to apply.
 */
const POLICY_OVERRIDE: Partial<Record<ModelCapability, string>> = {
 thinking: "gemini-3.1-pro-preview",
 analysis: "gemini-3.1-pro-preview",
 text: "gemini-3.1-flash-lite",
 "fast-text": "gemini-3.1-flash-lite",
}

export const resolveModelForCapability = (input: {
 /** Already-canonicalised creator preference. */
 preference: string
 capability: ModelCapability
}): ModelResolution => {
 const { preference, capability } = input

 const required = MODALITY_REQUIRED[capability]
 if (required) {
  return {
   capability,
   requested: preference,
   served: required,
   substituted: required !== preference,
   reason: "capability_requires_model",
  }
 }

 const policy = POLICY_OVERRIDE[capability]
 if (policy) {
  return {
   capability,
   requested: preference,
   served: policy,
   substituted: policy !== preference,
   reason: policy === preference ? "honoured" : "capability_policy_override",
  }
 }

 return {
  capability,
  requested: preference,
  served: preference,
  substituted: false,
  reason: "honoured",
 }
}

/**
 * True when the creator would be surprised: they expressed a preference and a blanket
 * policy, not the modality, overrode it. Modality overrides are not surprising and are
 * not worth reporting to a creator.
 */
export const isSurprisingSubstitution = (resolution: ModelResolution): boolean =>
 resolution.substituted && resolution.reason === "capability_policy_override"
