import {
  BLMElement,
  QuestionIntroduction,
  QuestionIntroMediaDisplay,
  QuizIntroductionOptionsJSON,
} from "types";
import { QuestionIntroductionTypes, TemplateEditorOptionTypes } from "editor-constants";
import { getBLMElement, getHTMLElement } from "../../core";
import { getQuestionMediaComponent, getTextComponent } from "../component";

export function getQuestionIntroduction(root: HTMLElement) {
  const introduction = new QuestionIntroduction();
  const element = getHTMLElement(root, "[id='introduction']");

  if (element) {
    const model = getBLMElement<QuizIntroductionOptionsJSON>(element);
    const { options } = model;
    const { media } = introduction;

    introduction.introduction = options ? options.intro : QuestionIntroductionTypes.None;

    if (options && options.simplecontentid) {
      introduction.simpleContentId = options.simplecontentid;
    } else {
      introduction.simpleContentId = TemplateEditorOptionTypes.None;
    }

    media.title = getTextComponent(element, "[blm-value='introductiontitle']");
    media.text = getTextComponent(element, "[blm-value='introductiontext']");
    media.media = getQuestionMediaComponent(element, "[blm-value='mediaintro']");
    media.sound = getQuestionMediaComponent(element, "[blm-value='soundintro']");
    media.display = getIntroMediaDsiplay(model, element);
  }

  return introduction;
}

function getIntroMediaDsiplay(model: BLMElement<QuizIntroductionOptionsJSON>, html: HTMLElement) {
  const display = new QuestionIntroMediaDisplay();
  const { options } = model;

  if (options && options.mediaintronext) {
    const obj = options.mediaintronext;

    display.timer = { status: obj.timer, value: obj.timervalue };
    display.autoEnd = obj.autoend;
    display.button = !(display.timer.status || display.autoEnd); //BILIM-175: [react] question introduction with media - default values
  }

  return display;
}
