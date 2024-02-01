import { createContext } from "react";

import { Template } from "types";

export interface Context {
  selectedTemplate?: Template;
  onInfoClick?: (element: HTMLElement, info: string) => void;
  onAddClick?: (template: Template) => void;
  onVariantsClick?: (variant: Template) => void;
}
const TemplateListContext = createContext<Context>({});

export default TemplateListContext;
