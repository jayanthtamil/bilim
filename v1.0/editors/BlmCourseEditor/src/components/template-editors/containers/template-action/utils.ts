import {
  CourseElementTemplate,
  ContentTemplateAction,
  KeysOfType,
  TemplateAction,
  TempalteActionView,
  CourseElement,
} from "types";
import { ElementType } from "editor-constants";
import { getTemplateHTMLJSON, setTemplateActionHTML } from "template-builders";

type ActionKeys1 = KeysOfType<ContentTemplateAction, object>;
type ActionKeys2 = KeysOfType<TemplateAction, object>;

export interface ChangeKeyMap {
  [key: string]: { obj1: ActionKeys1; obj2: ActionKeys2; key?: string };
}

export const changeKeyMap: ChangeKeyMap = {
  loadAlways: { obj1: "load", obj2: "navigation", key: "always" },
  loadNext: { obj1: "load", obj2: "navigation", key: "next" },
  loadPrevious: { obj1: "load", obj2: "navigation", key: "previous" },
  loadHome: { obj1: "load", obj2: "navigation", key: "home" },
  loadSC: { obj1: "load", obj2: "simpleContent" },
  loadSCAlways: { obj1: "load", obj2: "simpleContent", key: "always" },
  loadBG: { obj1: "load", obj2: "background" },
  loadBGAlways: { obj1: "load", obj2: "background", key: "always" },
  loadSound: { obj1: "load", obj2: "sound" },
  loadSoundAlways: { obj1: "load", obj2: "sound", key: "always" },
  loadBackgroundSound: { obj1: "load", obj2: "backgroundSound" },
  loadBackgroundSoundAlways: { obj1: "load", obj2: "backgroundSound", key: "always" },
  completeNext: { obj1: "complete", obj2: "navigation", key: "next" },
  completePrevious: { obj1: "complete", obj2: "navigation", key: "previous" },
  completeHome: { obj1: "complete", obj2: "navigation", key: "home" },
  completeSC: { obj1: "complete", obj2: "simpleContent" },
  completeBG: { obj1: "complete", obj2: "background" },
  completeSound: { obj1: "complete", obj2: "sound" },
};

export const createTemplate = (
  template: CourseElementTemplate,
  data: ContentTemplateAction,
  view: TempalteActionView
) => {
  const newTemplate: CourseElementTemplate = {
    ...template,
  };
  const [html, options] = setTemplateActionHTML(newTemplate, data, view);

  newTemplate.html = html;
  newTemplate.options = options;
  newTemplate.htmlJSON = getTemplateHTMLJSON(newTemplate);

  return newTemplate;
};

export const createTemplateView = (element: CourseElement): TempalteActionView => {
  const isScreen = element.type === ElementType.Screen;
  const isPartpage = element.parent?.type === ElementType.Page;
  const isStarting = element.root?.type === ElementType.Starting;
  const isStructure = element.root?.type === ElementType.Structure;
  const isPrimary = isStructure && (isScreen || isPartpage);
  const isSecondary = isStarting && isScreen;

  return {
    dashboardType: isPrimary ? "controlled" : "standard",
    load: {
      always:
        isPrimary || isSecondary
          ? {
              default: isSecondary,
            }
          : undefined,
      navigation:
        isScreen && (isStarting || isStructure)
          ? { next: true, previous: true, home: isStructure }
          : undefined,
      simpleContent: isPrimary || isSecondary,
      background: isStructure && isPartpage,
      sound: true,
      backgroundSound: isStructure
    },
    complete: isPrimary
      ? {
          navigation: isScreen ? { next: true, previous: true, home: true } : undefined,
          simpleContent: true,
          background: true,
          sound: true,
        }
      : undefined,
  };
};
