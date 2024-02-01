import { TemplateCategory, Template, TemplateFilter } from "types";
import { TemplateType, TemplateMenu, CourseDisplay } from "editor-constants";
import {
  cloneTemplates,
  compareVersion,
  differenceOfObjects,
  hasSubCategory,
  isCategory,
  isTemplate,
} from "utils";

export function createCategories(categories: TemplateCategory[], filter: TemplateFilter) {
  let result = cloneTemplates(categories);

  if (result && filter.virtualCategory) {
    result = createVirtualCategory(result, filter.virtualCategory);
  }

  result = filterItems(result, filter) as TemplateCategory[];
  orderItems(result);

  if (result && filter.showAllCategory) {
    result = createAllCategory(result);
  }

  return result;
}

function filterItems(
  items: (TemplateCategory | Template)[],
  filter?: TemplateFilter
): TemplateCategory[] | Template[] {
  return items.filter((item) => {
    if (isCategory(item)) {
      item.children = filterItems(item.children, filter);

      return item.children.length > 0;
    } else if (isTemplate(item)) {
      return filterTemplate(item, filter);
    }

    return false;
  }) as any[];
}

function orderItems<T extends TemplateCategory[] | Template[]>(items: T): T {
  items.forEach((item: TemplateCategory | Template) => {
    if (isCategory(item) && item.children) {
      orderItems(item.children);
    }
  });

  items.sort(sortItem);

  return items;
}

function sortItem<T extends TemplateCategory | Template>(item1: T, item2: T) {
  return Number(item1.order) - Number(item2.order);
}

function filterTemplate(template: Template, filter?: TemplateFilter) {
  const {
    framework: { min, max },
    displays,
    structureContexts,
    scopes,
    contexts,
    themes,
  } = template;
  const { framework, display, structureContext, scope, context, theme, switchable } = filter || {};

  if (
    (!framework ||
      (min &&
        compareVersion(framework, min) <= 0 &&
        (!max || compareVersion(framework, max) === 1))) &&
    (!display || displays.includes(CourseDisplay.FullResponsive) || displays.includes(display)) &&
    (!structureContext ||
      structureContexts.length === 0 ||
      structureContexts.includes(structureContext)) &&
    (!scope ||
      ((!scope.included || scope.included.every((sc) => scopes.includes(sc))) &&
        (!scope.excluded || scope.excluded.every((sc) => !scopes.includes(sc))))) &&
    ((!context && contexts.length === 0) || (context && contexts.includes(context))) &&
    (!theme || theme === "none" || themes.length === 0 || themes.includes(theme)) &&
    (!switchable || template.switchable)
  ) {
    return true;
  }
  return false;
}

function createAllCategory(categories: TemplateCategory[]) {
  const all: TemplateCategory = {
    id: "all",
    name: "all",
    description: "all",
    type: TemplateType.CategoryRoot,
    order: "0",
    info: "",
    helpurl: "",
    menu: TemplateMenu.Left,
    children: [],
  };
  const child = { ...all, type: TemplateType.Category };

  all.children = [child];
  child.children = getCategoryTemplates(categories);

  return [all, ...categories];
}

function createVirtualCategory(categories: TemplateCategory[], category: TemplateCategory) {
  const virtual: TemplateCategory = {
    id: "virtual",
    name: "Virtual",
    description: "Virtual templates",
    type: TemplateType.CategoryRoot,
    order: "0",
    info: "",
    helpurl: "",
    menu: TemplateMenu.Left,
    children: [],
  };
  const suggested: TemplateCategory = {
    id: "suggested1",
    name: "Suggested templates",
    description: "Suggested templates",
    type: TemplateType.Category,
    order: "0",
    info: "",
    helpurl: "",
    menu: TemplateMenu.Left,
    children: [],
  };

  if (category) {
    let grandCategory: TemplateCategory | undefined = category;

    do {
      grandCategory = grandCategory?.parent;
    } while (grandCategory && grandCategory.menu !== TemplateMenu.Left);

    suggested.children = [...(category.children as Template[])];
    virtual.children = [suggested];

    if (grandCategory) {
      const child = { ...grandCategory };
      const templates = getCategoryTemplates([grandCategory]);

      child.children = differenceOfObjects(templates, suggested.children, "id");
      virtual.children.push(child);
    }
  }

  return [virtual, ...categories];
}

function getCategoryTemplates(items: TemplateCategory[] | Template[]) {
  const templates: Template[] = [];

  items.forEach((item: TemplateCategory | Template) => {
    if (isCategory(item)) {
      templates.push(...getCategoryTemplates(item.children));
    } else {
      templates.push(item);
    }
  });

  return templates;
}

export const getFirstCategory = (
  categories: TemplateCategory[] | Template[]
): TemplateCategory | undefined => {
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];

    if (isCategory(category)) {
      if (hasSubCategory(category)) {
        return getFirstCategory(category.children);
      } else {
        return category;
      }
    }
  }
};
