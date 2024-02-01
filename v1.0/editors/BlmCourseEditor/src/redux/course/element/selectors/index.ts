import { createSelector } from "reselect";

import {
  StylePropertiesConfigJSON,
  StylePropertiesConfig,
  CourseElementProps,
  StyleNavigationConfig,
} from "types";
import { RootState } from "redux/types";
import { ElementType } from "editor-constants";

const getElementType = (state: RootState, props: CourseElementProps) => props.type;
const getElementLevel = (state: RootState, props: CourseElementProps) => props.level;
const getStyleConfig = (state: RootState) => state.course.style.style?.config;

function getElementPropsBy(
  properties?: StylePropertiesConfig,
  level: number = 1
): StylePropertiesConfigJSON | undefined {
  if (properties) {
    if (properties.hasOwnProperty("level" + level)) {
      return properties["level" + level];
    } else {
      return level - 1 > 0 ? getElementPropsBy(properties, level - 1) : undefined;
    }
  }
}

function getElementNavigationsBy(navigation?: StyleNavigationConfig, level: number = 1) {
  if (navigation) {
    const { navigationlevel, screenmenu } = navigation;

    return { screenMenu: level < navigationlevel ? screenmenu : undefined };
  }
}

function getMetadataType(elementType: ElementType) {
  switch (elementType) {
    case ElementType.Chapter:
    case ElementType.Screen:
    case ElementType.Page:
    case ElementType.Question:
    case ElementType.PartPage:
    case ElementType.Custom:
      return elementType;
    case ElementType.SimpleContent:
      return "simplescreen";
    case ElementType.SimplePage:
      return "simplepage";
    case ElementType.SimplePartPage:
      return ElementType.PartPage;
  }
  return elementType;
}

export const getElementConfig = createSelector(
  [getElementType, getElementLevel, getStyleConfig],
  (type, level, config) => {
    if (type && config) {
      const { properties, metadatas, navigation } = config;
      const metaType = getMetadataType(type as ElementType);

      return {
        properties: getElementPropsBy(properties, level),
        metadatas: metadatas ? metadatas[metaType] : undefined,
        navigation: getElementNavigationsBy(navigation, level),
      };
    }
  }
);
