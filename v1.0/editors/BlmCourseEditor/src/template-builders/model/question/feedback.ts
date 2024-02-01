import {
  QuestionFeedback,
  QuestionGlobalFeedback,
  QuestionGlobalFeedbackItem,
  QuestionDetailedFeedback,
  QuizFeedbackOptionsJSON,
} from "types";
import { QuestionFeedbackTypes, TemplateEditorOptionTypes } from "editor-constants";
import { getBLMElement, getHTMLElement } from "../../core";
import {
  getQuestionMediaComponent,
  getSimpleContentComponent,
  getTextComponent,
} from "../component";

export function getQuestionFeedback(root: HTMLElement) {
  const feedback = new QuestionFeedback();
  const element = getHTMLElement(root, "[id='feedback']");
  const embedded = getHTMLElement(root, ".embedded");

  if (element) {
    const model = getBLMElement<QuizFeedbackOptionsJSON>(element);
    const { options } = model;

    feedback.type = options ? options.feedbacktype : QuestionFeedbackTypes.None;
    feedback.tabType = feedback.type;
    feedback.global = getGlobalFeedback(element);
    feedback.detailed = getDetailedFeedback(options);
    feedback.disableEmbedded = !Boolean(embedded);
  }

  return feedback;
}

function getGlobalFeedback(parent: HTMLElement) {
  const global = new QuestionGlobalFeedback();

  global.right = getGlobalFeedbackItem(parent, true);
  global.wrong = getGlobalFeedbackItem(parent, false);

  return global;
}

function getGlobalFeedbackItem(parent: HTMLElement, isRight: boolean) {
  const item = new QuestionGlobalFeedbackItem();

  if (isRight) {
    item.title = getTextComponent(parent, "[blm-value='feedbacktitleright']");
    item.text = getTextComponent(parent, "[blm-value='feedbacktextright']");
    item.media = getQuestionMediaComponent(parent, "[blm-value='mediafeedbackright']");
    item.sound = getQuestionMediaComponent(parent, "[blm-value='soundfeedbackright']");
    item.simpleContent = getSimpleContentComponent(parent, "[blm-value='knowmorefeedbackright']");
  } else {
    item.title = getTextComponent(parent, "[blm-value='feedbacktitlewrong']");
    item.text = getTextComponent(parent, "[blm-value='feedbacktextwrong']");
    item.media = getQuestionMediaComponent(parent, "[blm-value='mediafeedbackwrong']");
    item.sound = getQuestionMediaComponent(parent, "[blm-value='soundfeedbackwrong']");
    item.simpleContent = getSimpleContentComponent(parent, "[blm-value='knowmorefeedbackwrong']");
  }

  return item;
}

function getDetailedFeedback(data?: QuizFeedbackOptionsJSON | null) {
  const detailed = new QuestionDetailedFeedback();

  if (data && data.simplecontent) {
    const { simplecontenttrue, simplecontentfalse, display } = data.simplecontent;

    detailed.rightId = simplecontenttrue || TemplateEditorOptionTypes.None;
    detailed.wrongId = simplecontentfalse || TemplateEditorOptionTypes.None;
    detailed.display = display;
  }

  return detailed;
}
