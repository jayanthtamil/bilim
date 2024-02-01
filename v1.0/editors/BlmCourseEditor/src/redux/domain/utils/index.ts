import { TemplateCategory, Template, TemplateVariant, Theme, Language, Languages } from "types";
import { TemplateType } from "editor-constants";
import {
  cloneTemplates,
  findObject,
  getTemplateAndVariant,
  isCategory,
  isTemplate,
  toBoolean,
  traverseTemplates,
} from "utils";
import {
  TemplateBaseResponse,
  TemplateCategoryResponse,
  TemplateResponse,
  TemplateVariantResponse,
  ThemeResponse,
  LanguageResponse,
  LanguagesResponse,
} from "../types";

export function createThemes(themes: ThemeResponse[]) {
  if (themes) {
    return themes.map(
      (theme) => new Theme(theme.nid, theme.name, theme.url, toBoolean(theme.allowIntroduction))
    );
  }

  return [];
}

export function createLanguages(languages: LanguagesResponse) {
  if (languages) {
    const result = new Languages();
    result.primary = languages.primary.map(createLanguage);
    result.others = languages.others.map(createLanguage);

    return result;
  }
}

function createLanguage(language: LanguageResponse) {
  const { code, name, url } = language;

  return new Language(code, name, url);
}

export function createTemplateCategories(
  categories: TemplateCategoryResponse[],
  parent?: TemplateCategory
) {
  if (categories) {
    const result = categories.map((item) => {
      const { nid: id, children, ...other } = item;
      const category: TemplateCategory = { id, parent, children: [], ...other };

      if (hasCategoryTemplate(children)) {
        category.children = createTemplateCategories(children, category) || [];
      } else {
        category.children = createTemplates(children, category);
      }

      return category;
    });

    updateTemplatesSubstitue(result);

    return result;
  }

  return [];
}

function createTemplates(templates: TemplateResponse[], parent: TemplateCategory) {
  if (templates) {
    return templates.map((item) => {
      const {
        nid: id,
        framework_min,
        framework_max,
        display,
        scope,
        theme,
        context,
        interaction,
        switchable,
        substitute_template,
        variants,
        course_context,
        ...other
      } = item;
      const template: Template = {
        id,
        parent,
        framework: { min: framework_min ?? undefined, max: framework_max ?? undefined },
        displays: splitValue(display),
        scopes: splitValue(scope),
        contexts: splitValue(context),
        structureContexts: splitValue(course_context),
        themes: splitValue(theme),
        interaction: toBoolean(interaction),
        switchable: toBoolean(switchable),
        substitue: substitute_template ? { id: substitute_template } : undefined,
        variants: [],
        ...other,
      };
      template.variants = createVaraints(variants, template);

      return template;
    });
  }

  return [];
}

function createVaraints(variants: TemplateVariantResponse[], parent: Template) {
  if (variants) {
    return variants.map((item) => {
      const { nid: id, ...other } = item;
      const variant: TemplateVariant = { id, parent, ...other };

      return variant;
    });
  }

  return [];
}

function hasCategoryTemplate(
  arr: TemplateCategoryResponse[] | TemplateResponse[]
): arr is TemplateCategoryResponse[] {
  if (arr && arr.length > 0) {
    const item = arr[0];

    if (item.type === TemplateType.CategoryRoot || item.type === TemplateType.Category) {
      return true;
    }
  }
  return false;
}

function splitValue<T>(str?: string | null): T[] {
  if (str) {
    return str.split("|").map((i) => i.trim() as any as T);
  }

  return [];
}

export function updateTemplateProperties(
  templates: TemplateCategory[],
  response: (TemplateBaseResponse & { variants?: TemplateBaseResponse[] })[]
) {
  if (response.length) {
    const { nid, html, htmlNode, variants } = response[0];
    const newTemplates = cloneTemplates(templates);

    traverseTemplates(newTemplates, nid, (template) => {
      if (!isCategory(template)) {
        template.html = html;
        template.htmlNode = htmlNode;

        if (isTemplate(template) && variants) {
          template.variants.forEach((variant) => {
            const variantRes = findObject(variants, variant.id, "nid");

            if (variantRes) {
              variant.html = variantRes.html;
              variant.htmlNode = variantRes.htmlNode;
            }
          });
        }
      }
    });

    updateTemplatesSubstitue(newTemplates);

    return newTemplates;
  }
}

function updateTemplatesSubstitue(templates: TemplateCategory[] | Template[], root = templates) {
  templates.forEach((template: TemplateCategory | Template) => {
    if (isCategory(template)) {
      updateTemplatesSubstitue(template.children, root);
    } else if (isTemplate(template)) {
      if (template.substitue) {
        template.substitue.template = getTemplateAndVariant(
          root ?? templates,
          template.substitue.id
        )?.template;
      }
    }
  });
}
