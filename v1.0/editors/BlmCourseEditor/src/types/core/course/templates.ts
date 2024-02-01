import { ScrollTransitionTypes, TemplateTypes } from "editor-constants";
import { TemplateOptionsJSON } from "../template-editor";
import { BaseCourseElement, CourseElement, ElementTemplateJSON } from "./element";

export class CourseElementTemplates extends BaseCourseElement {
  templates: CourseElementTemplate[] | null = null;
}

export class AssociatedTemplate {
  id: string;
  name: string;
  light?: string;
  dark?: string;
  interaction?: boolean;
  course_context?: string;
  theme?: string;
  framework?: { min?: string; max?: string };

  constructor(id: string, name = "", light?: string, dark?: string) {
    this.id = id;
    this.name = name;
    this.light = light;
    this.dark = dark;
  }
}

export class TemplateScroll {
  type?: ScrollTransitionTypes;
  effect = true;
  parallaxe = false;

  constructor(type?: ScrollTransitionTypes, effect = true, parallaxe = false) {
    this.type = type;
    this.effect = effect;
    this.parallaxe = parallaxe;
  }
}

export class CourseElementTemplate extends BaseCourseElement {
  templateType: TemplateTypes;
  html: string;
  isDarkTemplate = false;
  template: AssociatedTemplate;
  options: TemplateOptionsJSON | null = null;
  scroll = new TemplateScroll();
  hasAnchor = false;
  isSummary = false;
  hasAction = false;
  thumbnail?: string;
  associatedChapter?: CourseElement;
  htmlJSON: ElementTemplateJSON | null = null;

  constructor(
    id: string,
    name: string,
    type: TemplateTypes,
    templateType: TemplateTypes,
    html: string,
    template: AssociatedTemplate,
    isDarkTemplate: boolean
  ) {
    super(id, name, type);

    this.templateType = templateType;
    this.html = html;
    this.template = template;
    this.isDarkTemplate = isDarkTemplate;
    this.thumbnail = isDarkTemplate ? template.dark : template.light;
  }
}
