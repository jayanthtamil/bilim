import { createContext } from "react";

import { TemplatePanelOptions, CourseElementTemplate } from "types";
import { TemplateEditorTypes } from "editor-constants";

export interface Context {
  editorPanel: {
    isOpen: boolean;
    type: TemplateEditorTypes;
    template?: CourseElementTemplate;
  };
  onShowTemplates?: (options: TemplatePanelOptions) => void;
  onEditClick?: (
    type: TemplateEditorTypes,
    template: CourseElementTemplate,
    anchorEle: HTMLElement,
    templateEle: HTMLElement
  ) => void;
  onDuplicateClick?: (template: CourseElementTemplate) => void;
  onDeleteClick?: (template: CourseElementTemplate) => void;
  onPositionChange?: (template: CourseElementTemplate, delta: number) => void;
  onTemplateEdit?: (template: CourseElementTemplate) => void;
  onNameChange?: (template: CourseElementTemplate, name: string) => void;
  onLoadPartPageHotspot?: (elementId: string, template: CourseElementTemplate) => void;
}

const BlmTemplateBoardContext = createContext<Context>({
  editorPanel: { isOpen: false, type: TemplateEditorTypes.None },
});

export default BlmTemplateBoardContext;
