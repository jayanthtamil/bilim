import { QuestionIntroduction } from "types";
import { QuestionIntroductionTypes } from "editor-constants";

export function getIntroductionMedia(introduction: QuestionIntroduction) {
  return introduction.introduction === QuestionIntroductionTypes.Media
    ? introduction.media.media.value
    : undefined;
}

export function getSimpleContentId(str?: string | null) {
  if (str) {
    const reg = /simplecontent\((.+)\)/gi;
    const result = reg.exec(str);

    if (result && result.length >= 1) {
      return result[1];
    }
  }

  return null;
}
