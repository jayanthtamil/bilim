import { QuestionIntroduction, QuizIntroductionOptionsJSON } from "types";
import { isVideo } from "utils";
import { setBLMElementBy } from "../../core";
import {
  setQuestionMediaComponent,
  setQuestionSoundComponent,
  setTextComponent,
} from "../component";

export function setQuestionIntroductionHTML(root: HTMLElement, introduction: QuestionIntroduction) {
  const {
    media: { title, text, media, sound, display },
    simpleContentId,
  } = introduction;
  const introOptions: QuizIntroductionOptionsJSON = {
    intro: introduction.introduction,
    simplecontentid: simpleContentId || "",
    mediaintronext: {
      button: display.button,
      timer: display.timer.status,
      timervalue: display.timer.value || 0,
      autoend: media.value && isVideo(media.value.type) ? display.autoEnd : false,
    },
  };

  setBLMElementBy(root, "[id='introduction']", { options: introOptions });
  setTextComponent(root, "[blm-value='introductiontitle']", title);
  setTextComponent(root, "[blm-value='introductiontext']", text);
  setQuestionMediaComponent(root, "[blm-value='mediaintro']", media);
  setQuestionSoundComponent(root, "[blm-value='soundintro']", sound);
}
