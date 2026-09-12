import {templateById} from '../catalog';
import type {TemplateDefinition} from '../core/schema';

/**
 * Legacy VT_E1 template IDs map to canonical editor-design-library IDs here.
 *
 * Keep this table append-only once aliases ship in saved projects. Do not remove
 * an alias simply because the old template UI is retired: persisted projects may
 * still reference it years later.
 *
 * The table intentionally starts empty until each existing VT_E1 template ID is
 * audited and matched to a canonical replacement. Identity fallback keeps all
 * current canonical IDs working immediately without guessing legacy mappings.
 */
export const LEGACY_TEMPLATE_ALIASES: Readonly<Record<string, string>> = Object.freeze({});

export function canonicalTemplateId(templateId: string): string {
  return LEGACY_TEMPLATE_ALIASES[templateId] ?? templateId;
}

export function resolveTemplateById(templateId: string): TemplateDefinition | undefined {
  return templateById(canonicalTemplateId(templateId));
}

export function isLegacyTemplateAlias(templateId: string): boolean {
  return Object.prototype.hasOwnProperty.call(LEGACY_TEMPLATE_ALIASES, templateId);
}
