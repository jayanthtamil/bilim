import { Key } from "rc-tree";

import {
  CourseElement,
  TreeOptionsClickHandler,
  TreeNodeInstance,
  CourseProps,
  CourseElementProps,
  TreeAction,
} from "types";
import { ElementType } from "editor-constants";
import { ContainerProps } from "./course-tree-container";

export interface TreeCompProps extends ContainerProps {
  treeType: ElementType | string;
  selectedElement?: CourseElement;
  data: CourseElement;
  ctxItem?: CourseElement;
  onTreeOptionsClick?: TreeOptionsClickHandler;
  noClick?: boolean;
  courseIdCopyFrom?: number;
}

export interface TreeDragHandler {
  (info: {
    node: TreeNodeInstance;
    dragNode: TreeNodeInstance;
    dropPosition: number;
    expandedKeys?: Key[];
    dropToGap?: boolean;
  }): void;
}

export interface TreeTraverseCallback {
  (item: CourseElement, index: number, arr: CourseElement[]): void;
}

export interface CreateOptions {
  courseProps?: CourseProps;
  elementProps?: CourseElementProps;
  action?: TreeAction;
}
