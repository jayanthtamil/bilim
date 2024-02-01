import {
  ComponentAction,
  ContentTemplate,
  CourseElementTemplate,
  QuestionTemplate,
  TemplateOptionsJSON,
  TemplateSimpleContentJSON,
} from "types";
import {
  ElementType,
  QuestionIntroductionTypes,
  TemplateEditorOptionTypes,
  TemplateTypes,
} from "editor-constants";
import {
  addClassToString,
  filterDuplicates,
  filterFalsy,
  getRepeaterComponents,
  isButtonComponent,
  isGotoAction,
  isMediaButton,
  isMediaComponent,
  isMediaFlipCard,
  isMediaHotspot,
  isMediaHotspot360,
  isMediaSlideshow,
  isMediaSynchroVideo,
  isMediaTarget,
  isPopoverAction,
  isQuestionPropositions,
  isReplaceTargetAction,
  isSimpleContentAction,
} from "utils";

export const createElementTemplateHTML = (
  template: string,
  isDarkSeleted: boolean,
  type: TemplateTypes
) => {
  const clsList = [];

  if (isDarkSeleted) {
    clsList.push("dark");
  }

  if (type === ElementType.PartPage || type === ElementType.SimplePartPage) {
    clsList.push(ElementType.PartPage);
  } else if (
    type === ElementType.Screen ||
    type === ElementType.Question ||
    type === ElementType.SimpleContent
  ) {
    clsList.push(ElementType.Screen);
  }

  return clsList.length ? addClassToString(template, clsList) : template;
};

export function getTemplateHTMLJSON(template: CourseElementTemplate) {
  const { options, htmlJSON } = template;

  if (options) {
    return {
      ...htmlJSON,
      linkedElements: { ...htmlJSON?.linkedElements, actions: getActionLinkedIds(options) },
    };
  }

  return htmlJSON;
}

function getActionLinkedIds(options: TemplateOptionsJSON) {
  const ids: string[] = [];

  ids.push(...getActionIds(options?.onload?.opensimplecontent));
  ids.push(...getActionIds(options?.oncomplete?.opensimplecontent));

  return filterFalsy(ids);
}

function getActionIds(action?: TemplateSimpleContentJSON) {
  const ids: (string | undefined)[] = [];

  if (action?.checked) {
    ids.push(action.id);
  }

  return filterDuplicates(filterFalsy(ids));
}

export function getContentHTMLJSON(template: CourseElementTemplate, content: ContentTemplate) {
  const { htmlJSON } = template;

  return {
    ...htmlJSON,
    linkedElements: { ...htmlJSON?.linkedElements, components: getContentLinkedIds(content) },
  };
}

function getContentLinkedIds(content: ContentTemplate) {
  const { medias, buttons, repeater } = content;
  const arr = [
    ...medias,
    ...buttons,
    ...getRepeaterComponents(repeater?.medias),
    ...getRepeaterComponents(repeater?.buttons),
  ];
  const ids: (string | undefined)[] = [];

  arr.forEach((component) => {
    if (isMediaComponent(component)) {
      if (isMediaButton(component)) {
        ids.push(...getComponentActionIds(component.value.clickAction));
        ids.push(...getComponentActionIds(component.value.overAction));
      } else if (isMediaFlipCard(component)) {
        ids.push(...getComponentActionIds(component.value.clickAction));
        ids.push(...getComponentActionIds(component.value.overAction));
      } else if (isMediaSlideshow(component)) {
        component.value.items.forEach((item) => {
          ids.push(...getComponentActionIds(item.clickAction));
        });
      } else if (isMediaTarget(component)) {
        ids.push(component.value.template);
      } else if (isMediaSynchroVideo(component)) {
        component.value.contents?.forEach((item) => {
          ids.push(item.content);
        });
      } else if (isMediaHotspot(component)) {
        component.value.items.forEach((item) => {
          ids.push(...getComponentActionIds(item.clickAction));
          ids.push(...getComponentActionIds(item.overAction));
        });
      } else if (isMediaHotspot360(component)) {
        component.value.items.forEach((item) => {
          item.items.forEach((item2) => {
            ids.push(...getComponentActionIds(item2.clickAction));
            ids.push(...getComponentActionIds(item2.overAction));
          });
        });
      }
    } else if (isButtonComponent(component)) {
      ids.push(...getComponentActionIds(component.value.clickAction));
      ids.push(...getComponentActionIds(component.value.overAction));
    }
  });

  return filterDuplicates(filterFalsy(ids));
}

function getComponentActionIds(action: ComponentAction) {
  const ids: (string | undefined)[] = [];

  if (action) {
    if (isSimpleContentAction(action)) {
      ids.push(action.value?.simpleContentId);
    } else if (isReplaceTargetAction(action)) {
      ids.push(action.value?.replaceId);
    } else if (isGotoAction(action)) {
      ids.push(action.value?.gotoId);
    } else if (
      isPopoverAction(action) &&
      action.value?.button?.checked &&
      action.value.button.action
    ) {
      ids.push(...getComponentActionIds(action.value.button.action));
    }
  }

  return filterFalsy(ids);
}

export function getQuestionHTMLJSON(template: CourseElementTemplate, question: QuestionTemplate) {
  const { htmlJSON } = template;
  return {
    ...htmlJSON,
    linkedElements: { ...htmlJSON?.linkedElements, components: getQuestionLinkedIds(question) },
  };
}

function getQuestionLinkedIds(question: QuestionTemplate) {
  const { introduction, main, feedback } = question;
  const ids: (string | undefined)[] = [];

  if (introduction.introduction === QuestionIntroductionTypes.SimpleContent) {
    ids.push(getElementId(introduction.simpleContentId));
  }

  if (main.simpleContent.value !== TemplateEditorOptionTypes.None) {
    ids.push(getElementId(main.simpleContent.value));
  }

  if (isQuestionPropositions(main.content)) {
    main.content.value?.items.forEach((proposition) => {
      ids.push(getElementId(proposition.info.value?.simpleContentId));
    });
  }

  ids.push(getElementId(feedback.global.right.simpleContent.value));
  ids.push(getElementId(feedback.global.wrong.simpleContent.value));
  ids.push(getElementId(feedback.detailed.rightId), getElementId(feedback.detailed.wrongId));

  return filterDuplicates(filterFalsy(ids));
}

function getElementId(id?: string) {
  return id !== TemplateEditorOptionTypes.None ? id : undefined;
}
