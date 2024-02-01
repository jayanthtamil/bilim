import { TemplateBase } from "types";

export interface AddTemplateHandler {
  (template: TemplateBase, isDarkSelected: boolean): void;
}
