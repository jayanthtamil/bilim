import { TemplatePanelTypes } from "editor-constants";
import { createContext } from "react";

import { AddTemplateHandler } from "./types";

export interface Context {
  type?: TemplatePanelTypes;
  onAddTemplateClick?: AddTemplateHandler;
}

const TemplatesPanelContext = createContext<Context>({});
export default TemplatesPanelContext;
