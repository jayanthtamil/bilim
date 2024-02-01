import { createSelector } from "reselect";

import { CourseElement } from "types";
import { ElementType } from "editor-constants";
import { getElement } from "utils";
import { RootState } from "redux/types";

const getCourseProperties = (state: RootState) => state.course.properties.properties;
const getCourseStructure = (state: RootState) => state.course.structure.structure;
const getElementTemplates = (state: RootState) => state.course.element.templates;
const getPropsElement = (state: RootState, element: CourseElement) => element;

export const getCurrnetElement = createSelector(
  [getCourseStructure, getPropsElement],
  (structure, element) => {
    if (structure && element) {
      return getElement(structure, element.id);
    } else {
      return element;
    }
  }
);

export const getCurrentTemplates = createSelector(
  [getCourseProperties, getCourseStructure, getElementTemplates, getPropsElement],
  (course, structure, templates, element) => {
    const result = element && element.id === templates?.id ? templates?.templates : undefined;

    if (
      course &&
      structure &&
      (templates?.type === ElementType.Page ||
        templates?.type === ElementType.SimpleContent ||
        templates?.type === ElementType.SimplePage) &&
      result
    ) {
      return result.map((item) => {
        const associatedChapterId = item.options?.relative_chapter;

        if (associatedChapterId) {
          const associatedChapter =
            associatedChapterId === course.id
              ? new CourseElement(course.id, "Course root", ElementType.Root)
              : getElement(structure, associatedChapterId);

          return { ...item, associatedChapter };
        } else {
          return item;
        }
      });
    }

    return result;
  }
);
