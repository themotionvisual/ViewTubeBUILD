import type {TemplateCategory, TemplateDefinition} from './core/schema';
import {textTemplates} from './templates/text';
import {graphicTemplates} from './templates/graphics';
import {sceneTemplates} from './templates/scenes';

export const templateCatalog: TemplateDefinition[] = [...textTemplates, ...graphicTemplates, ...sceneTemplates];

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
