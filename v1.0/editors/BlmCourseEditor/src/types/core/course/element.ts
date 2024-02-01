import { ElementType, ConnectionType, TemplateTypes } from "editor-constants";
import { AssociatedTemplate } from "./templates";

export class BaseCourseElement {
  id: string;
  name: string;
  type: ElementType;

  constructor(id: string, name: string, type: ElementType) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}

export class CourseElement extends BaseCourseElement {
  level = 0;
  theme: string | null = null;
  isVirtual = false;
  isDirectEvaluation = false;
  isEvaluation = false;
  hasAssociateContent = false;
  hasFeedback = false;
  isCompletion = false;
  isSummary = false;
  isLinked = false;
  isOutdated = false;
  forAlertIcon = false;
  styleSummary = true;
  templateType: TemplateTypes | null = null;
  template?: AssociatedTemplate;
  connections: ElementConnection[] | null = null;
  root?: CourseElement;
  parent?: CourseElement;
  children: CourseElement[] = [];
  propsJSON: ElementPropsJSON | null = null;
  htmlJSON: ElementTemplateJSON | null = null;
}

export class ElementConnection {
  value: ConnectionType;

  constructor(value: ConnectionType) {
    this.value = value;
  }
}

export interface ElementPropsJSON {
  linkedElements?: {
    evaluations?: string[];
  };
  hasFiles?: boolean;
}

export interface ElementTemplateJSON {
  linkedElements?: { actions?: string[]; components?: string[] };
}

export interface UpdateElementConnectionPost {
  id: string;
  connections: ConnectionType[];
}

export interface ElementTraverseCallback {
  (item: CourseElement, index: number, parent?: CourseElement): void;
}

export interface ElementCallback {
  (item: CourseElement): void;
}
