import type {TemplateCategory, TemplateDefinition} from './schema';

const templates = new Map<string, TemplateDefinition>();

export function registerTemplate(template: TemplateDefinition): TemplateDefinition {
  if (templates.has(template.id)) throw new Error(`Duplicate template id: ${template.id}`);
  templates.set(template.id, template);
  return template;
}

export function registerTemplates(items: TemplateDefinition[]): void {
  items.forEach(registerTemplate);
}

export function getTemplate(id: string): TemplateDefinition | undefined {
  return templates.get(id);
}

export function getTemplates(category?: TemplateCategory): TemplateDefinition[] {
  const all = [...templates.values()];
  return category ? all.filter((item) => item.category === category) : all;
}

export function searchTemplates(query: string): TemplateDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return getTemplates();
  return getTemplates().filter((item) =>
    item.name.toLowerCase().includes(q) || item.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}
