import {
  QuestionFeedback,
  QuestionGlobalFeedback,
  QuestionGlobalFeedbackItem,
  QuestionDetailedFeedback,
  QuestionIntroduction,
  QuestionMain,
  QuestionParameters,
  QuestionProposition,
  QuestionPropositionFeedback,
  QuestionPropositionInfo,
  QuestionPropositions,
  CourseElementTemplate,
  QuestionCustomComponent,
} from "types";
import { isQuestionCustom, isQuestionPropositions } from "utils";
import { setQuestionTemplateHTML } from "../html";
import { getQuestionTemplateModel } from "../model";

export function copyQuestionTemplate(
  source: CourseElementTemplate,
  destination: CourseElementTemplate
) {
  if (source && destination) {
    const question = getQuestionTemplateModel(source);
    const newQuestion = getQuestionTemplateModel(destination);

    copyIntroduction(question.introduction, newQuestion.introduction);
    copyMain(question.main, newQuestion.main);
    copyFeedback(question.feedback, newQuestion.feedback);
    copyQuestionParameters(question.parameters, newQuestion.parameters);

    if (newQuestion.main.content) {
      newQuestion.main.content.value = removeDeletedProposition(
        question?.main?.content?.value,
        newQuestion.main.content?.value
      );
    }

    return setQuestionTemplateHTML(destination, newQuestion);
  }
  return source.html;
}

function removeDeletedProposition(oldProposition: any, newPropositon: any) {
  const { items: srcItems } = oldProposition;
  const { items: desItems } = newPropositon;
  var newQuestion = { ...newPropositon };
  newQuestion.items = [];
  for (var i = 0; i < srcItems.length; i++) {
    newQuestion.items.push(desItems[i]);
  }

  return newQuestion;
}

function copyIntroduction(source: QuestionIntroduction, destination: QuestionIntroduction) {
  const { media: srcMedia } = source;
  const { media: desMedia } = destination;

  destination.introduction = source.introduction;

  desMedia.title.value = srcMedia.title.value;
  desMedia.text.value = srcMedia.text.value;
  desMedia.media.value = srcMedia.media.value;
  desMedia.sound.value = srcMedia.sound.value;
  desMedia.display = { ...srcMedia.display };

  destination.simpleContentId = source.simpleContentId;
}

function copyMain(source: QuestionMain, destination: QuestionMain) {
  const { content: srcContent } = source;
  const { content: desContent } = destination;

  destination.title.value = source.title.value;
  destination.text.value = source.text.value;
  destination.media.value = source.media.value;
  destination.sound.value = source.sound.value;
  destination.simpleContent.value = source.simpleContent.value;
  destination.instruction.value = source.instruction.value;
  destination.validate.checked = source.validate.checked;

  if (
    isQuestionPropositions(srcContent) &&
    isQuestionPropositions(desContent) &&
    srcContent.value &&
    desContent.value
  ) {
    copyPropositoions(srcContent.value, desContent.value);
  } else if (isQuestionCustom(srcContent) && isQuestionCustom(desContent)) {
    copyCustom(srcContent, desContent);
  }
}

function copyPropositoions(source: QuestionPropositions, destination: QuestionPropositions) {
  const { items: srcItems } = source;
  const { items: desItems } = destination;
  const srcLen = srcItems.length;
  const desLen = desItems.length;

  destination.isMCQ = source.isMCQ;
  destination.randomize = source.randomize;

  for (let i = 0; i < srcLen; i++) {
    const srcItem = srcItems[i];
    let desItem;
    if (desLen > i) {
      desItem = desItems[i];
    } else {
      desItem = { ...srcItem };
      desItems.push(desItem);
    }

    copyProposition(srcItem, desItem);
  }
}

function copyProposition(source: QuestionProposition, destination: QuestionProposition) {
  const {
    info: { value: srcInfo },
  } = source;

  const {
    info: { value: desInfo },
  } = destination;

  destination.title.value = source.title.value;
  destination.text.value = source.text.value;
  destination.validity.value = source.validity.value;
  destination.media.value = source.media.value;
  destination.sound.value = source.sound.value;

  if (srcInfo && desInfo) {
    copyPropositionInfo(srcInfo, desInfo);
  }

  copyPropositionFeedback(source.feedback, destination.feedback);
}

function copyPropositionInfo(
  source: QuestionPropositionInfo,
  destination: QuestionPropositionInfo
) {
  const { simple: srcSimple } = source;
  const { simple: desSimple } = destination;

  destination.type = source.type;

  desSimple.title.value = srcSimple.title.value;
  desSimple.text.value = srcSimple.text.value;
  destination.simpleContentId = source.simpleContentId;
}

function copyPropositionFeedback(
  source: QuestionPropositionFeedback,
  destination: QuestionPropositionFeedback
) {
  destination.title.value = source.title.value;
  destination.text.value = source.text.value;
  destination.media.value = source.media.value;
  destination.sound.value = source.sound.value;
}

function copyCustom(source: QuestionCustomComponent, destination: QuestionCustomComponent) {
  destination.format = source.format;
  destination.value = source.value;
}

function copyFeedback(source: QuestionFeedback, destination: QuestionFeedback) {
  destination.type = source.type;

  copyGlobalFeedback(source.global, destination.global);
  copyDetailedFeedback(source.detailed, destination.detailed);
}

function copyGlobalFeedback(source: QuestionGlobalFeedback, destination: QuestionGlobalFeedback) {
  copyGlobalFeedbackItem(source.right, destination.right);
  copyGlobalFeedbackItem(source.wrong, destination.wrong);
}

function copyGlobalFeedbackItem(
  source: QuestionGlobalFeedbackItem,
  destination: QuestionGlobalFeedbackItem
) {
  destination.title.value = source.title.value;
  destination.text.value = source.text.value;
  destination.media.value = source.media.value;
  destination.sound.value = source.sound.value;
  destination.simpleContent.value = source.simpleContent.value;
}

function copyDetailedFeedback(
  source: QuestionDetailedFeedback,
  destination: QuestionDetailedFeedback
) {
  destination.rightId = source.rightId;
  destination.wrongId = source.wrongId;
  destination.display = source.display;
}

function copyQuestionParameters(source: QuestionParameters, destination: QuestionParameters) {
  destination.relatedTo = source.relatedTo;
  destination.mandatory = source.mandatory;
  destination.eliminatory = source.eliminatory;
  destination.useforscoring = source.useforscoring;
  destination.timer = source.timer;
}
