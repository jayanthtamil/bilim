import {
  QuestionMain,
  QuestionPropositions,
  QuestionProposition,
  QuestionPropositionInfo,
  QuestionPropositionFeedback,
  BaseComponent,
  QuizPropositionsOptionsJSON,
  QuestionCustomComponent,
  MediaConfigJSON,
  MediaFile,
  QuestionValidate,
} from "types";
import {
  QuestionPropositionValidTypes,
  QuestionPropositionInfoTypes,
  TemplateEditorOptionTypes,
  QuestionPropositionTypes,
  QuestionTemplateTypes,
} from "editor-constants";
import { createUUID } from "utils";
import {
  getBLMElement,
  getSimpleContentId,
  getHTMLElement,
  getAllHTMLElements,
  createMediaConfig,
  createMediaFormat,
  setComponentBy,
} from "../../core";
import {
  getQuestionMediaComponent,
  getSimpleContentComponent,
  getTextComponent,
} from "../component";

export function getQuestionMain(root: HTMLElement, type: QuestionTemplateTypes) {
  const main = new QuestionMain();
  const element = getHTMLElement(root, "[id='mainquestion']");

  if (element) {
    main.title = getTextComponent(element, "[blm-value='entiled']");
    main.text = getTextComponent(element, "[blm-value='description']");
    main.media = getQuestionMediaComponent(element, "[blm-value='mainmedia']", true);
    main.sound = getQuestionMediaComponent(element, "[blm-value='mainsound']");
    main.simpleContent = getSimpleContentComponent(element, "[blm-value='knowmore']");
    main.instruction = getTextComponent(element, "[blm-value='instruction']");
    main.validate = getQuestionValidate(element);

    if (type === QuestionTemplateTypes.Standard) {
      main.content = getQuestionPropositions(element);
    } else {
      main.content = getQuestionCustom(element);
    }
  }

  return main;
}

function getQuestionValidate(parent: HTMLElement) {
  const validate = new QuestionValidate();
  const element = getHTMLElement(parent, "[blm-value='validate']");

  if (element) {
    validate.checked = !element.classList.contains("deactivated");
  }

  return validate;
}

function getQuestionPropositions(parent: HTMLElement) {
  const propositions = new QuestionPropositions();
  const element = getHTMLElement(parent, "[blm-value='propositions']");
  const result = new BaseComponent<QuestionPropositions>(undefined);

  if (element) {
    const model = getBLMElement<QuizPropositionsOptionsJSON>(element);
    const items = getAllHTMLElements(element, "[blm-value='proposition']");
    const { isEditable = false, options } = model;

    if (options) {
      propositions.isMCQ = options.type === QuestionPropositionTypes.Multiple;
      propositions.restrictTypeToSingle = options.restrict_type_to_single;
      propositions.randomize = options.randomize;
      propositions.maximum = options.maxprop;
      propositions.minimum = options.minprop;
    }

    items.forEach((itemDom) => {
      const proposition = getQuestionProposition(itemDom);

      propositions.items.push(proposition);
    });

    result.value = propositions;
    result.isEditable = isEditable;
  }

  return result;
}

function getQuestionProposition(parent: HTMLElement) {
  const proposition = new QuestionProposition();
  const model = getBLMElement(parent);
  const validity = model.option === QuestionPropositionValidTypes.Right;

  proposition.id = createUUID(); //local id used for drag and drop.
  proposition.validity = new BaseComponent(validity);
  proposition.title = getTextComponent(parent, "[blm-value='propositiontitle']");
  proposition.text = getTextComponent(parent, "[blm-value='propositiontext']");
  proposition.media = getQuestionMediaComponent(parent, "[blm-value='mediaprop']");
  proposition.sound = getQuestionMediaComponent(parent, "[blm-value='soundprop']");

  proposition.info = getQuestionPropositionInfo(parent);
  proposition.feedback = getQuestionPropositionFeedback(parent);

  return proposition;
}

function getQuestionPropositionInfo(parent: HTMLElement) {
  const info = new QuestionPropositionInfo();
  const element = getHTMLElement(parent, "[blm-value='knowmoreprop']");
  const result = new BaseComponent<QuestionPropositionInfo>(undefined);

  if (element) {
    const model = getBLMElement(element);
    const { isEditable = false, option } = model;
    const simpleContentId = getSimpleContentId(option);

    if (simpleContentId) {
      info.type = QuestionPropositionInfoTypes.Detailed;
    } else {
      info.type =
        (model.option as QuestionPropositionInfoTypes) || QuestionPropositionInfoTypes.None;
    }

    info.simpleContentId = simpleContentId || TemplateEditorOptionTypes.None;
    info.simple.title = getTextComponent(element, "[blm-value='knowmoreproppopuptitle']");
    info.simple.text = getTextComponent(element, "[blm-value='knowmoreproppopuptext']");

    result.value = info;
    result.isEditable = isEditable;
  }

  return result;
}

function getQuestionPropositionFeedback(parent: HTMLElement) {
  const feedback = new QuestionPropositionFeedback();
  const element = getHTMLElement(parent, "[id='feedbackprop']");

  if (element) {
    feedback.title = getTextComponent(element, "[blm-value='propositionfeedbacktitle']");
    feedback.text = getTextComponent(element, "[blm-value='propositionfeedbacktext']");
    feedback.media = getQuestionMediaComponent(element, "[blm-value='mediafeedbackprop']");
    feedback.sound = getQuestionMediaComponent(element, "[blm-value='soundfeedbackprop']");
  }

  return feedback;
}

function getQuestionCustom(mainHtml: HTMLElement) {
  const custom = new QuestionCustomComponent();
  const element = getHTMLElement(mainHtml, "[blm-value='maincustommedia']");

  if (element) {
    const model = getBLMElement<MediaConfigJSON, MediaFile>(element);
    const { options, editorOptions } = model;

    setComponentBy(custom, model);

    if (options) {
      custom.options = options;
      custom.config = createMediaConfig(options);
    }

    custom.format = createMediaFormat(
      Array.from(element.classList),
      element.style,
      custom.config?.format
    );

    if (editorOptions) {
      custom.value = editorOptions;
    }
  }

  return custom;
}
