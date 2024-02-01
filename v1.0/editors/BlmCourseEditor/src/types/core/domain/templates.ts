import {
  TemplateMenu,
  CourseDisplay,
  TemplateContext,
  TemplateType,
  TemplateTypes,
  TemplateSopes,
  TemplatePanelTypes,
  StructureTypes,
} from "editor-constants";
import { CourseElementTemplate } from "../course";

export interface CategoryBase {
  id: string;
  name: string;
  type: TemplateType;
  order: string;
  description: string | null;
  info: string | null;
}

export interface TemplateCategory extends CategoryBase {
  parent?: TemplateCategory;
  menu: TemplateMenu;
  helpurl: string | null;
  children: TemplateCategory[] | Template[];
}

export interface TemplateBase extends CategoryBase {
  thumbnailDark: string;
  thumbnailLight: string;
  html: string;
  htmlNode: string;
  warning: string | null;
}

export interface Template extends TemplateBase {
  parent?: TemplateCategory;
  framework: { min?: string; max?: string };
  displays: CourseDisplay[];
  structureContexts: StructureTypes[];
  scopes: TemplateSopes[];
  contexts: TemplateContext[];
  themes: string[];
  interaction: boolean;
  switchable: boolean;
  substitue?: { id: string; template?: Template };
  variants: TemplateVariant[];
}

export interface TemplateVariant extends TemplateBase {
  parent?: Template;
}

export class TemplateScopeFilter {
  included?: TemplateSopes[];
  excluded?: TemplateSopes[];

  constructor(included?: TemplateSopes[], excluded?: TemplateSopes[]) {
    this.included = included;
    this.excluded = excluded;
  }
}

export interface TemplateFilter {
  showAllCategory: boolean;
  framework?: string;
  display?: CourseDisplay;
  structureContext?: StructureTypes;
  scope?: TemplateScopeFilter;
  context?: TemplateContext;
  theme?: string;
  switchable?: boolean;
  virtualCategory?: TemplateCategory;
}

export class TemplatePanelOptions {
  type = TemplatePanelTypes.Standard;
  templateType: TemplateTypes;
  position = 0;
  isSummary = false;
  template?: CourseElementTemplate;

  constructor(templateType: TemplateTypes) {
    this.templateType = templateType;
  }
}

export interface TemplateTraverseCallback {
  (item: TemplateCategory | Template | TemplateVariant): void;
}
