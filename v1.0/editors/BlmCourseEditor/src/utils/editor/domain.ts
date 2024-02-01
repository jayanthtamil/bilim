import {
  Template,
  TemplateBase,
  TemplateCategory,
  TemplateTraverseCallback,
  TemplateVariant,
  Theme,
} from "types";
import { TemplateType, TemplateMenu } from "editor-constants";

export function getTheme(themes: Theme[], name: string) {
  return themes.find((item) => {
    return item.name.toLowerCase() === name.toLowerCase();
  });
}

export function isCategory(
  category: TemplateCategory | Template | TemplateVariant
): category is TemplateCategory {
  return (
    category &&
    (category.type === TemplateType.CategoryRoot || category.type === TemplateType.Category)
  );
}

export function isTemplate(
  template: TemplateCategory | Template | TemplateVariant
): template is Template {
  return template && template.type === TemplateType.Template;
}

export function isVariant(
  variant: TemplateCategory | Template | TemplateVariant
): variant is TemplateVariant {
  return variant && variant.type === TemplateType.Varaint;
}

export function hasSubCategory(
  category: TemplateCategory | Template
): category is TemplateCategory & { children: TemplateCategory[] } {
  return hasCategory(category, TemplateMenu.Left);
}

export function hasTabCategory(
  category: TemplateCategory | Template
): category is TemplateCategory & { children: TemplateCategory[] } {
  return hasCategory(category, TemplateMenu.Tab);
}

export function hasGroupCategory(
  category: TemplateCategory | Template
): category is TemplateCategory & { children: TemplateCategory[] } {
  return hasCategory(category, TemplateMenu.Inline);
}

export function hasCategory(
  category: TemplateCategory | Template,
  menu?: string
): category is TemplateCategory & { children: TemplateCategory[] } {
  if (isCategory(category)) {
    for (let child of category.children) {
      if (isCategory(child) && (!menu || child.menu === menu)) {
        return true;
      }
    }
  }
  return false;
}

export function cloneTemplates(templates: TemplateCategory[]) {
  return copyCategories(templates);
}

function copyCategories(
  categories: TemplateCategory[],
  parent?: TemplateCategory
): TemplateCategory[] {
  return categories.map((category) => {
    const result = { ...category, parent };

    result.children = hasCategory(category)
      ? copyCategories(category.children, result)
      : copyTemplates(category.children as Template[], result);

    return result;
  });
}

function copyTemplates(templates: Template[], parent: TemplateCategory): Template[] {
  return templates.map((template) => {
    const result = { ...template, parent };
    result.variants = copyVariants(template.variants, result);

    return result;
  });
}

function copyVariants(variants: TemplateVariant[], parent: Template): TemplateVariant[] {
  return variants.map((variant) => ({ ...variant, parent }));
}

export function traverseTemplates(
  templates: TemplateCategory[] | Template[] | TemplateVariant[],
  id: string,
  callback: TemplateTraverseCallback
): TemplateCategory | Template | TemplateVariant | undefined {
  return (templates as (TemplateCategory | Template | TemplateVariant)[]).find((template) => {
    if (template.id === id) {
      callback(template);
      return true;
    } else if (!isVariant(template)) {
      return traverseTemplates(
        isTemplate(template) ? template.variants : template.children,
        id,
        callback
      );
    }

    return false;
  });
}

export function getTemplateAndVariant(
  templates: TemplateCategory[] | Template[],
  id: string
): { template: Template; variant?: TemplateBase } | undefined {
  let result;

  traverseTemplates(templates, id, (template) => {
    if (isVariant(template)) {
      result = { template: template.parent!, variant: template };
    } else if (isTemplate(template)) {
      result = { template };
    }
  });

  return result;
}
