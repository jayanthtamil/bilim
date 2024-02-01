import {
  QuestionFeedback,
  QuestionGlobalFeedback,
  QuestionGlobalFeedbackItem,
  QuestionMain,
  QuizFeedbackOptionsJSON,
} from "types";
import { QuestionFeedbackTypes, TemplateEditorOptionTypes } from "editor-constants";
import { isQuestionPropositions } from "utils";
import { getHTMLElement, setBLMElementBy } from "../../core";
import {
  setTextComponent,
  setQuestionMediaComponent,
  setQuestionSoundComponent,
  setSimpleContentComponent,
} from "../component";

export function setQuestionFeedbackHTML(
  root: HTMLElement,
  feedback: QuestionFeedback,
  main: QuestionMain
) {
  const {
    type,
    global,
    detailed: { rightId, wrongId, display },
  } = feedback;
  const element = getHTMLElement(root, "[id='feedback']");
  const options: QuizFeedbackOptionsJSON = {
    feedbacktype: getFeedbackType(type, main),
    simplecontent: {
      simplecontenttrue: rightId === TemplateEditorOptionTypes.None ? undefined : rightId,
      simplecontentfalse: wrongId === TemplateEditorOptionTypes.None ? undefined : wrongId,
      display,
    },
  };

  setBLMElementBy(root, "[id='feedback']", { options });

  if (element) {
    setGlobalFeedbackHTML(element, global);
  }
}

function getFeedbackType(type: QuestionFeedbackTypes, main: QuestionMain) {
  if (
    isQuestionPropositions(main.content) &&
    main.content.value?.isMCQ &&
    type === QuestionFeedbackTypes.Propositions
  ) {
    return QuestionFeedbackTypes.None;
  } else {
    return type;
  }
}

function setGlobalFeedbackHTML(parent: HTMLElement, global: QuestionGlobalFeedback) {
  const { right, wrong } = global;

  setGlobalFeedbackItemHTML(parent, right, true);
  setGlobalFeedbackItemHTML(parent, wrong, false);
}

function setGlobalFeedbackItemHTML(
  parent: HTMLElement,
  item: QuestionGlobalFeedbackItem,
  isRight: boolean
) {
  const { title, text, media, sound, simpleContent } = item;

  if (isRight) {
    setTextComponent(parent, "[blm-value='feedbacktitleright']", title);
    setTextComponent(parent, "[blm-value='feedbacktextright']", text);
    setQuestionMediaComponent(parent, "[blm-value='mediafeedbackright']", media);
    setQuestionSoundComponent(parent, "[blm-value='soundfeedbackright']", sound);
    setSimpleContentComponent(parent, "[blm-value='knowmorefeedbackright']", simpleContent);
  } else {
    setTextComponent(parent, "[blm-value='feedbacktitlewrong']", title);
    setTextComponent(parent, "[blm-value='feedbacktextwrong']", text);
    setQuestionMediaComponent(parent, "[blm-value='mediafeedbackwrong']", media);
    setQuestionSoundComponent(parent, "[blm-value='soundfeedbackwrong']", sound);
    setSimpleContentComponent(parent, "[blm-value='knowmorefeedbackwrong']", simpleContent);
  }
}
