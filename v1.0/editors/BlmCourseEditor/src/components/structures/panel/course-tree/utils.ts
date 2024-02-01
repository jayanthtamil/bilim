import { CourseElement, CourseElementProps, CourseProps } from "types";
import { ConnectionType, ElementType, TreeActionTypes } from "editor-constants";
import {
  cloneCourseElement,
  createUUID,
  getChildrenConnection,
  getEvaluationChildren,
  hasAutoSummary,
  hasElement,
  hasSomeTemplate,
  hasSummary,
  isTemplateElement,
  isValidLinkedElement,
  traverseElement,
  getElementType,
} from "utils";
import { CreateOptions } from "./types";
import i18next from "i18next";

const DROP_MAP = {
  [ElementType.Root]: [],
  [ElementType.Starting]: [],
  [ElementType.Structure]: [],
  [ElementType.Annexes]: [],
  [ElementType.Chapter]: [ElementType.Root, ElementType.Chapter, ElementType.AnnexesFolder],
  [ElementType.AnnexesFolder]: [ElementType.Root, ElementType.Chapter, ElementType.AnnexesFolder],
  [ElementType.Screen]: [ElementType.Root, ElementType.Chapter, ElementType.AnnexesFolder],
  [ElementType.Page]: [ElementType.Root, ElementType.Chapter, ElementType.AnnexesFolder],
  [ElementType.Question]: [ElementType.Root, ElementType.Chapter, ElementType.AnnexesFolder],
  [ElementType.PartPage]: [ElementType.Page],
  [ElementType.Custom]: [ElementType.Root, ElementType.Chapter],
  [ElementType.SimplePage]: [ElementType.Screen, ElementType.PartPage, ElementType.Question],
  [ElementType.SimpleContent]: [
    ElementType.Screen,
    ElementType.PartPage,
    ElementType.Feedback,
    ElementType.Question,
  ],
  [ElementType.SimplePartPage]: [],
  [ElementType.Feedback]: [],
  [ElementType.AssociateContent]: [],
  [ElementType.Evaluation]: [],
  [ElementType.Summary]: [],
  [ElementType.ResetMargin]: [],
};

export function pushElement(children: CourseElement[], newElement: CourseElement) {
  let ind = children.length;

  if (hasElement(children, ElementType.Feedback)) {
    ind = ind - 1;
  }
  if (hasElement(children, ElementType.AssociateContent)) {
    ind = ind - 1;
  }

  children = children.slice();
  children.splice(ind, 0, newElement);

  return children;
}

export function createVirtualElement(
  element: CourseElement,
  id: string,
  name: string,
  type: ElementType
) {
  const result = new CourseElement(id, name, type);
  result.isVirtual = true;
  result.parent = element;
  result.root = element.root;

  return result;
}

export function createSummaryElement(
  element: CourseElement,
  children: CourseElement[],
  courseProps?: CourseProps
) {
  const { navigationlevel = 0 } = courseProps?.navigation ?? {};

  if (hasAutoSummary(element, navigationlevel)) {
    const newElement = createVirtualElement(
      element,
      createUUID(),
      i18next.t("structures:title.auto_summary"),
      ElementType.Summary
    );

    return [newElement, ...children];
  }

  return children;
}

function createNewElement(element: CourseElement, children: CourseElement[], type: ElementType) {
  const newElement = createVirtualElement(
    element,
    "newElement",
    i18next.t("structures:title.new") + i18next.t(`structures:${getElementType(type)}`),
    type
  );

  return pushElement([...children], newElement);
}

function createFeedback(element: CourseElement) {
  const feedback = createVirtualElement(
    element,
    createUUID(),
    i18next.t("structures:title.feedback"),
    ElementType.Feedback
  );

  return feedback;
}

function createStructureChildren(
  element: CourseElement,
  children: CourseElement[],
  properties: CourseProps
) {
  const { isEvaluation, hasFeedback } = properties;
  let result = children;

  if (isEvaluation && hasFeedback) {
    if (!hasElement(result, ElementType.Feedback)) {
      const feedback = createFeedback(element);

      result = [...result, feedback];
    }
  } else {
    result = result.filter((item) => item.type !== ElementType.Feedback);
  }

  return result;
}

function createPropsChildren(
  element: CourseElement,
  children: CourseElement[],
  properties?: CourseElementProps
) {
  const { id } = element;
  const { isEvaluation, hasFeedback, hasAssociateContent } =
    id === properties?.id ? properties : element;
  let result = children;

  if (isEvaluation && hasFeedback) {
    if (!hasElement(result, ElementType.Feedback)) {
      const feedback = createFeedback(element);

      if (hasAssociateContent) {
        const insertAtIndex = result.length - 1;

        result = [...result];
        result.splice(insertAtIndex, 0, feedback);
      } else {
        result = [...result, feedback];
      }
    }
  } else {
    result = result.filter((item) => item.type !== ElementType.Feedback);
  }

  //Now we don't have this element, we may have in future.
  result = result.filter((item) => item.type !== ElementType.AssociateContent);

  return result;
}

export function createTree(tree: CourseElement, options: CreateOptions) {
  const result = cloneCourseElement(tree, undefined, undefined, (element) => {
    element.children = createChildren(element, options);
  });

  return result;
}

function createChildren(element: CourseElement, options: CreateOptions) {
  const { type, children } = element;
  const { action, courseProps, elementProps } = options;
  let result = children;

  if (type !== ElementType.SimplePage && type !== ElementType.SimpleContent) {
    if (type === ElementType.Structure || type === ElementType.Chapter) {
      result = createSummaryElement(element, result, courseProps);
    }

    if (
      action?.type === TreeActionTypes.AddItem &&
      action.elementType &&
      action.element.id === element.id
    ) {
      result = createNewElement(element, result, action.elementType);
    }

    if (type !== ElementType.Structure) {
      result = createPropsChildren(element, result, elementProps);
    } else if (courseProps) {
      result = createStructureChildren(element, result, courseProps);
    }
  }

  return result;
}

export function createOptions(
  item: CourseElement,
  treeType: ElementType | string,
  properties?: CourseElementProps
) {
  const { id, type, isSummary, isLinked, isOutdated, connections, propsJSON, forAlertIcon } = item;
  const itemProps = properties?.id === id ? properties : item;
  let icons: string[] = [];

  if (itemProps.isEvaluation) {
    if (itemProps.theme === null && getEvaluationChildren(item).length === 0) {
      icons.push("alert-icon");
    }
    icons.push("question-icon");
  } else if (
    (type === ElementType.Custom && !propsJSON?.hasFiles) ||
    (isTemplateElement(item) && isOutdated && forAlertIcon)
  ) {
    icons.push("alert-icon");
  }

  if (isValidLinkedElement(item) && !isLinked) {
    icons.push("unlinked-icon");
  }

  if (isSummary) {
    icons.push("home-icon");
  }

  if (treeType === ElementType.Starting && connections) {
    const arr = type === ElementType.Page ? getChildrenConnection(item) : [];

    if (arr.length > 1) {
      icons.push("mixed-connection-icon");
    } else {
      const icons2 = connections.map((connection) => {
        switch (connection.value) {
          case ConnectionType.First:
            return "first-connection-icon";
          case ConnectionType.Second:
            return "second-connection-icon";
          case ConnectionType.Repeat:
            return "repeat-connection-icon";
          default:
            return "";
        }
      });

      icons.push(...icons2);
    }
  }

  return icons;
}

export function isDroppable(
  tree: CourseElement,
  dragData: CourseElement,
  dropData: CourseElement,
  courseProps?: CourseProps
) {
  const dragType = dragData?.type;
  const dropType = !dropData || dropData === tree ? ElementType.Root : dropData.type;
  const allowedTypes = dragType ? DROP_MAP[dragType as ElementType] : [];
  const parent = dragData?.parent ?? tree;
  const { navigation } = courseProps || {};

  if (dragData?.isSummary && dropData && dropData.id !== parent?.id) {
    if (dragType === ElementType.PartPage || dragType === ElementType.SimplePartPage) {
      if (!dropData.isSummary) {
        return false;
      }
    } else if (hasAutoSummary(dropData, navigation?.navigationlevel) || hasSummary(dropData)) {
      return false;
    }
  } else if (parent?.template?.interaction && dragData && hasSomeTemplate(dragData)) {
    return dropData?.id === parent?.id;
  } else if (
    dropData?.type === ElementType.Chapter &&
    dropData.isEvaluation &&
    dropData.theme &&
    dropData.theme !== "None"
  ) {
    if (dragData.template?.theme === dropData.theme && dragData.type === ElementType.Question) {
      return true;
    }
    return false;
  } else if (
    dropData?.type === ElementType.Chapter &&
    dropData.isEvaluation &&
    dropData.theme === null
  ) {
    return false;
  } else if (
    (parent?.type === ElementType.Feedback || dropType === ElementType.Feedback) &&
    dragData &&
    hasSomeTemplate(dragData)
  ) {
    return parent?.type === dropType;
  } else if (parent?.type === ElementType.AssociateContent) {
    return false;
  } else if (dropData?.template?.interaction && dragData && hasSomeTemplate(dragData)) {
    return false;
  } else if (dragData?.isLinked) {
    return false;
  } else if (dropData?.isSummary && dragData?.templateType === ElementType.Question) {
    return false;
  }

  return allowedTypes.includes(dropType as ElementType);
}

//BIL-141 [React] User can move an element AFTER Feedback and AssociateContent
export function isDroppableAt(dropData: CourseElement, dropPosition: number, isExpanded = false) {
  const { type } = dropData;

  if (dropPosition === 1) {
    if (type === ElementType.Feedback || type === ElementType.AssociateContent) {
      return false;
    } else if (dropData.children.length && isExpanded && dropData.styleSummary) {
      return false;
    }
  } else if (dropPosition === -1) {
    if (type === ElementType.Summary) {
      return false;
    } else {
      const ind = dropData.parent?.children.indexOf(dropData) ?? -1;
      const prevChild = ind - 1 >= 0 ? dropData.parent?.children[ind - 1] : undefined;

      if (
        prevChild?.type === ElementType.Feedback ||
        prevChild?.type === ElementType.AssociateContent
      ) {
        return false;
      }
    }
  }

  return true;
}

export function updateDrop(
  tree: CourseElement,
  dragged: CourseElement,
  dropped: CourseElement,
  dropPosition: number,
  isExpanded: boolean
) {
  traverseElement(tree, dragged.id, (item, index, parent) => {
    if (parent) {
      dragged = item;
      parent.children.splice(index, 1);
    }
  });

  if (
    dropPosition === 0 ||
    (dropped.children.length > 0 && // Has children
      isExpanded && // Is expanded
      dropPosition === 1) // On the bottom gap
  ) {
    traverseElement(tree, dropped.id, (item) => {
      dragged.parent = item;

      item.children = item.children || [];

      if (item.children[0]?.type === ElementType.Summary) {
        item.children.splice(1, 0, dragged);
      } else {
        item.children.unshift(dragged);
      }
    });
  } else {
    //In between children
    traverseElement(tree, dropped.id, (item, ind, parent) => {
      if (parent) {
        dragged.parent = parent;

        if (dropPosition === -1) {
          parent.children.splice(ind, 0, dragged);
        } else {
          parent.children.splice(ind + 1, 0, dragged);
        }
      }
    });
  }
}

export function hasEmptyTemplate(element: CourseElement) {
  const { type, templateType, children, propsJSON } = element;

  if (
    ((type === ElementType.Screen ||
      type === ElementType.SimpleContent ||
      type === ElementType.Question) &&
      !templateType) ||
    ((type === ElementType.Page || type === ElementType.SimplePage) && children.length === 0) ||
    (type === ElementType.Custom && !propsJSON?.hasFiles)
  ) {
    return true;
  }

  return false;
}
