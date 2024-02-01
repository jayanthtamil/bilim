import {
  CourseElement,
  ElementConnection,
  CourseStructure,
  ChapterEvaluationProps,
  PageEvaluationProps,
  CustomEvaluationProps,
  ElementTraverseCallback,
  ElementCallback,
  CourseElementProps,
} from "types";
import { ConnectionType, ElementType } from "editor-constants";
import { findIndex, flatObject } from "../core";

export function traverseStructure(
  structure: CourseStructure,
  id: string,
  callback: ElementTraverseCallback
) {
  const arr = [structure.starting, structure.structure, structure.annexes];

  return arr.find((element) => {
    if (!element) {
      return false;
    } else {
      return traverseElement(element, id, callback);
    }
  });
}

export function traverseElement(
  element: CourseElement,
  id: string,
  callback: ElementTraverseCallback
) {
  if (element.id === id) {
    callback(element, -1);
    return true;
  } else {
    for (let i = 0; i < element.children.length; i++) {
      const item = element.children[i];

      if (item.id === id) {
        callback(item, i, element);
        return true;
      } else if (traverseElement(item, id, callback)) {
        return true;
      }
    }
  }

  return false;
}

export function cloneStructure(root: CourseStructure, callback?: ElementCallback) {
  const { starting, structure, annexes } = root;

  return {
    ...root,
    starting: starting && cloneCourseElement(starting, undefined, undefined, callback),
    structure: structure && cloneCourseElement(structure, undefined, undefined, callback),
    annexes: annexes && cloneCourseElement(annexes, undefined, undefined, callback),
  };
}

export function cloneCourseElement(
  element: CourseElement,
  parent?: CourseElement,
  root = parent,
  callback?: ElementCallback
): CourseElement {
  const { children } = element;
  const result = {
    ...element,
    parent,
    root,
  };

  result.children = children.map((child) => cloneCourseElement(child, result, root, callback));

  if (callback) {
    callback(result);
  }

  return result;
}

export function forEachStructure(structure: CourseStructure, callbackfn: ElementCallback) {
  const arr = [structure.starting, structure.structure, structure.annexes];

  arr.forEach((item) => item && forEachElement(item, callbackfn));
}

export function forEachElement(element: CourseElement, callbackfn: ElementCallback) {
  element.children.forEach((item) => {
    callbackfn(item);
    forEachElement(item, callbackfn);
  });
}

export function getElement(structure: CourseStructure, id: string) {
  let result: CourseElement | undefined;

  traverseStructure(structure, id, (item) => {
    result = item;
  });

  return result;
}

export function getChildElement(element: CourseElement, id: string) {
  let result: CourseElement | undefined;

  traverseElement(element, id, (item) => {
    result = item;
  });

  return result;
}

export function getSiblingElements(element: CourseElement) {
  return element.parent?.children.filter((item) => item !== element) ?? [];
}

export function filterElements(elements: CourseElement[], includes: ElementType[]) {
  return elements?.filter((element) => includes.includes(element.type)) ?? [];
}

export function getElementGrandChildren(element: CourseElement, includes: ElementType[]) {
  return filterElements(flatObject(element, "children"), includes);
}

export function hasConnection(connections: ElementConnection[], connection: ConnectionType) {
  return findIndex(connections, connection, "value") !== -1;
}

export function getChildrenConnection(element: CourseElement, excludes?: ConnectionType[]) {
  const arr: ElementConnection[] = [];

  for (let child of element.children) {
    if (child.connections) {
      for (let connection of child.connections) {
        if (
          !hasConnection(arr, connection.value) &&
          (!excludes || excludes.indexOf(connection.value) === -1)
        ) {
          arr.push(connection);
        }
      }
    }
  }

  return arr;
}

const EVALUATION_CHILDREN = [
  ElementType.Page,
  ElementType.Screen,
  ElementType.Chapter,
  ElementType.Custom,
];

export function getEvaluationChildren(element: CourseElement) {
  return filterElements(element.children, EVALUATION_CHILDREN);
}

export function hasProperties(element: CourseElement) {
  const { type } = element;

  return (
    type === ElementType.Chapter || type === ElementType.Custom || type === ElementType.Summary
  );
}

export function hasTemplates(element: CourseElement) {
  const { type } = element;

  return (
    type === ElementType.Page ||
    type === ElementType.Screen ||
    type === ElementType.Question ||
    type === ElementType.SimplePage ||
    type === ElementType.SimpleContent
  );
}

export const isTemplateElement = (element: CourseElement) => {
  const { type } = element;

  return (
    type === ElementType.Screen ||
    type === ElementType.Question ||
    type === ElementType.PartPage ||
    type === ElementType.SimpleContent ||
    type === ElementType.SimplePartPage
  );
};

export function hasChapterEvaluation(
  element: CourseElementProps
): element is CourseElementProps & { evalutionJSON: ChapterEvaluationProps } {
  if (element && element.type === ElementType.Chapter) {
    return true;
  }
  return false;
}

export function hasPageEvaluation(
  element: CourseElementProps
): element is CourseElementProps & { evalutionJSON: PageEvaluationProps } {
  if (element && (element.type === ElementType.Page || element.type === ElementType.SimplePage)) {
    return true;
  }
  return false;
}

export function hasCustomEvaluation(
  element: CourseElementProps
): element is CourseElementProps & { evalutionJSON: CustomEvaluationProps } {
  if (element && element.type === ElementType.Custom) {
    return true;
  }
  return false;
}

export function hasElement(elements: CourseElement[], type: ElementType) {
  return elements.some((element) => element.type === type);
}

export function hasSummary(element: CourseElement) {
  const { children } = element;

  return children.some((child) => child.isSummary);
}

export function hasTemplate(element: CourseElement, type: ElementType) {
  const { templateType } = element;

  return templateType && templateType === type;
}

export function hasChildTemplate(element: CourseElement, type: ElementType) {
  const { children } = element;

  return children.some((child) => hasTemplate(child, type));
}

export function hasSomeTemplate(element: CourseElement): Boolean {
  const { type, templateType, children } = element;

  return type === ElementType.Page || type === ElementType.SimplePage
    ? children.some((child) => hasSomeTemplate(child))
    : Boolean(templateType);
}

const LINKED_TYPES: ElementType[] = [ElementType.SimpleContent, ElementType.SimplePage];
const ANNEXES_LINKED_TYPES: ElementType[] = [
  ElementType.Screen,
  ElementType.Page,
  ElementType.SimpleContent,
  ElementType.SimplePage,
];

export function isValidLinkedElement(element: CourseElement) {
  return (
    element.root?.type === ElementType.Annexes ? ANNEXES_LINKED_TYPES : LINKED_TYPES
  ).includes(element.type);
}

export function getPreviousElements(element: CourseElement) {
  const elements = element.parent?.children;

  if (elements) {
    const ind = findIndex(elements, element.id, "id");

    if (ind !== -1) {
      return elements.slice(0, ind);
    }
  }

  return [];
}

const AUTO_SUMMARY_TYPES = [ElementType.Structure, ElementType.Chapter];

export function hasAutoSummaryAllowed(element: CourseElement, navigationLevel = 0) {
  const { type, isEvaluation, theme, level } = element;

  return (
    AUTO_SUMMARY_TYPES.includes(type) &&
    (!isEvaluation || theme === null || theme === "None") &&
    level < navigationLevel
  );
}

export function hasAutoSummary(element: CourseElement, navigationLevel = 0) {
  const { styleSummary } = element;

  return hasAutoSummaryAllowed(element, navigationLevel) && styleSummary;
}

export function getElementType(type: ElementType | undefined) {
  switch (type) {
    case ElementType.Page:
      return "element_type.page";
    case ElementType.Screen:
      return "element_type.screen";
    case ElementType.SimpleContent:
      return "element_type.simple_content";
    case ElementType.SimplePage:
      return "element_type.simple_page";
    case ElementType.Chapter:
      return "element_type.chapter";
    case ElementType.Evaluation:
      return "element_type.evaluation";
    case ElementType.Custom:
      return "element_type.custom";
    case ElementType.Question:
      return "element_type.question";
    case ElementType.AnnexesFolder:
      return "element_type.annexes_folder";
  }
}
