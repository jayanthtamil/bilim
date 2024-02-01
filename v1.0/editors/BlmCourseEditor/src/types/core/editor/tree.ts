import Tree, { NodeInstance } from "rc-tree";

import { ElementType, TreeActionTypes } from "editor-constants";
import { CourseElement } from "../course";

export type TreeInstance = InstanceType<typeof Tree>;
export type TreeNodeInstance = NodeInstance<CourseElement>;

export interface TreeAction {
  type: TreeActionTypes;
  element: CourseElement;
  elementType?: ElementType;
}

export interface TreeOptionsClickHandler {
  (node: HTMLElement, element: CourseElement): void;
}
