import { ElementType } from "editor-constants";
import { CourseElement } from "../course";

export class ContextMenu {
  anchor: HTMLElement;
  item: CourseElement;
  treeType: ElementType;

  constructor(anchor: HTMLElement, item: CourseElement, treeType: ElementType) {
    this.anchor = anchor;
    this.item = item;
    this.treeType = treeType;
  }
}

export interface OptionsClickHandler {
  (anchorElement: HTMLElement, item: CourseElement, treeType: ElementType): void;
}
