import type {TemplateCategory, TemplateDefinition} from './core/schema';
import {normalizeTemplateCatalog} from './core/normalizeTemplate';
import {textTemplates} from './templates/text';
import {graphicTemplates} from './templates/graphics';
import {sceneTemplates} from './templates/scenes';
import {transitionTemplates} from './templates/transitions';
import {engagementTemplates} from './templates/engagement';
import {editorPackTemplates} from './templates/editorPack';
import {expansionPackTemplates} from './templates/expansionPack';
import {motionGraphicsTemplates} from './templates/motionGraphics';
import {verticalSceneTemplates} from './templates/verticalScenes';
import {youtuberOpenerTemplates} from './templates/youtuberOpeners';
import {youtuberUtilityTemplates} from './templates/youtuberUtility';
import {premiumUtilityTemplates} from './templates/premiumUtility';
import {backgroundTemplates,patternTemplates} from './templates/backgroundPatterns';

export const templateCatalog: TemplateDefinition[] = normalizeTemplateCatalog([
  ...backgroundTemplates,
  ...patternTemplates,
  ...textTemplates,
  ...graphicTemplates,
  ...sceneTemplates,
  ...transitionTemplates,
  ...engagementTemplates,
  ...editorPackTemplates,
  ...expansionPackTemplates,
  ...motionGraphicsTemplates,
  ...verticalSceneTemplates,
  ...youtuberOpenerTemplates,
  ...youtuberUtilityTemplates,
  ...premiumUtilityTemplates,
]);

export function filterTemplateCatalog(category?: TemplateCategory, query = ''): TemplateDefinition[] {
  const q = query.trim().toLowerCase();
  return templateCatalog.filter((item) => {
    if (category && item.category !== category) return false;
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.tags.some((tag) => tag.toLowerCase().includes(q));
  });
}

export function templateById(id: string): TemplateDefinition | undefined {
  return templateCatalog.find((item) => item.id === id);
}
