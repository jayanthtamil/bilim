import {
  QuestionMain,
  QuestionPropositions,
  QuestionProposition,
  QuestionPropositionInfo,
  QuestionPropositionFeedback,
  ClassAttribute,
  QuestionIntroduction,
  LinkMedia,
  QuizPropositionsOptionsJSON,
  QuestionValidate,
  QuestionCustomComponent,
  Attributes,
  StyleAttribute,
  BLMElement,
  MediaConfigJSON,
} from "types";
import {
  MediaFormats,
  MediaOptionTypes,
  QuestionPropositionInfoTypes,
  QuestionPropositionTypes,
  QuestionPropositionValidTypes,
  QuestionTemplateTypes,
  TemplateEditorOptionTypes,
} from "editor-constants";
import {
  createHTMLElement,
  isQuestionCustom,
  isQuestionPropositions,
  removeAllChildren,
  valueToUnit,
} from "utils";
import { getHTMLElement, getIntroductionMedia, setBLMElement, setBLMElementBy } from "../../core";
import {
  setLinkMediaComponent,
  setQuestionMediaComponent,
  setSimpleContentComponent,
  setQuestionSoundComponent,
  setTextComponent,
} from "../component";

export function setQuestionMainHTML(
  root: HTMLElement,
  main: QuestionMain,
  introduction: QuestionIntroduction,
  type: QuestionTemplateTypes
) {
  const { title, text, media, sound, simpleContent, instruction, validate, content } = main;

  if (type !== QuestionTemplateTypes.NoHeader) {
    const element = getHTMLElement(root, "[id='mainquestion");
    const classAttr = new ClassAttribute();
    const introMedia = getIntroductionMedia(introduction);

    if (sound.value) {
      classAttr.items.push("hassound");
    } else {
      classAttr.removables.push("hassound");
    }

    if (simpleContent.value !== TemplateEditorOptionTypes.None) {
      classAttr.items.push("hassimplecontent");
    } else {
      classAttr.removables.push("hassimplecontent");
    }

    if (!media.value && introMedia) {
      const linkMedia = new LinkMedia();
      linkMedia.option = MediaOptionTypes.Linked;

      media.value = linkMedia;
    }

    if (element) {
      setTextComponent(element, "[blm-value='entiled']", title);
      setTextComponent(element, "[blm-value='description']", text);
      setLinkMediaComponent(element, "[blm-value='mainmedia']", media, introMedia, classAttr);
      setQuestionSoundComponent(element, "[blm-value='mainsound']", sound);
      setSimpleContentComponent(element, "[blm-value='knowmore']", simpleContent);
      setTextComponent(element, "[blm-value='instruction']", instruction);
      setQuestionValidateHTML(element, validate);
    }
  }

  if (isQuestionPropositions(content)) {
    if (content.isEditable && content.value) {
      setQuestionPropositionsHTML(root, content.value);
    }
  } else if (isQuestionCustom(content)) {
    setQuestionCustomHTML(root, content);
  }
}

function setQuestionValidateHTML(parent: HTMLElement, validate: QuestionValidate) {
  const { checked } = validate;
  const element = getHTMLElement(parent, "[blm-value='validate']");

  if (element) {
    const classAttr = new ClassAttribute();

    if (checked) {
      classAttr.removables.push("deactivated");
    } else {
      classAttr.items.push("deactivated");
    }

    setBLMElement(element, { classAttr });
  }
}

function setQuestionPropositionsHTML(root: HTMLElement, propositions: QuestionPropositions) {
  const { isMCQ, restrictTypeToSingle, randomize, minimum, maximum, items } = propositions;
  const element = getHTMLElement(root, "[blm-value='propositions']");
  const options: QuizPropositionsOptionsJSON = {
    type: isMCQ ? QuestionPropositionTypes.Multiple : QuestionPropositionTypes.Single,
    restrict_type_to_single: restrictTypeToSingle,
    randomize,
    minprop: minimum,
    maxprop: maximum,
  };
  const classAttr = new ClassAttribute();
  classAttr.items = ["nbpropositions" + items.length];
  classAttr.removables = [/^nbpropositions(\d+)$/g];

  if (element) {
    setBLMElement(element, { options, classAttr });

    //Proposition items html
    const parent = getQuestionPropositionHTML(element);

    if (parent) {
      removeAllChildren(element);

      if (items) {
        items.forEach((item, ind) => {
          const itemHtml = parent.cloneNode(true) as HTMLElement;
          const lineBreak = document.createTextNode("\n"); //Remove this tag, if it runs slower

          setQuestionPropositionHTML(itemHtml, item, ind);

          element.appendChild(lineBreak);
          element.appendChild(itemHtml);
        });
      }
    }
  }
}

function getQuestionPropositionHTML(parent: HTMLElement) {
  const element = getHTMLElement(parent, "[blm-value='proposition']");

  if (element) {
    return element;
  } else {
    const str = `<li blm-editable blm-value="proposition" blm-option="right" class="">
    <div class="proposition">
      <div class="mainprop">
        <div class="mediaprop" blm-value="mediaprop" blm-option="none">
          <img src=""></img>
        </div>
        <div class="knowmoreprop" blm-value="knowmoreprop" blm-option="none">
          <div class="knowmoreproppopupoff">
            <div class="knowmoreproppopuptitle" blm-value="knowmoreproppopuptitle"></div>
            <div class="knowmoreproppopuptext" blm-value="knowmoreproppopuptext"></div>
          </div>
        </div>
        <div class="soundprop" blm-value="soundprop" blm-option="none">
          <audio>
          </audio>
        </div>
        <div class="singlepropositionwrapper">
          <div class="propositiontitle" blm-editable blm-value="propositiontitle" blm-id="propitem-1-1" blm-component="text"></div>
          <div class="propositiontext" blm-editable blm-value="propositiontext" blm-id="propitem-1-2" blm-component="text"></div>
        </div>
      </div>
      <div id="feedbackprop" class="d-none">
        <div class="mediafeedbackprop" blm-editable blm-value="mediafeedbackprop" blm-option="none">
          <img src=""></img>
        </div>
        <div class="soundfeedbackprop" blm-editable blm-value="soundfeedbackprop" blm-option="none">
          <audio>
          </audio>
        </div>
        <div class="propositionfeedbacktextwrapper">
          <div class="propositionfeedbacktitle" blm-editable blm-value="propositionfeedbacktitle"></div>
          <div class="propositionfeedbacktext" blm-editable blm-value="propositionfeedbacktext"></div>
        </div>
      </div>
    </div>
  </li>`;

    return createHTMLElement(str);
  }
}

function setQuestionPropositionHTML(
  parent: HTMLElement,
  proposition: QuestionProposition,
  index: number
) {
  const { validity, title, text, media, sound, info, feedback } = proposition;
  const classAttr = new ClassAttribute();
  const option = validity.value
    ? QuestionPropositionValidTypes.Right
    : QuestionPropositionValidTypes.Wrong;

  if (media.value) {
    classAttr.items.push("hasmedia");
  } else {
    classAttr.removables.push("hasmedia");
  }

  if (sound.value) {
    classAttr.items.push("hassound");
  } else {
    classAttr.removables.push("hassound");
  }

  if (info.value && info.value.type !== QuestionPropositionInfoTypes.None) {
    classAttr.items.push("hasknowmore");
  } else {
    classAttr.removables.push("hasknowmore");
  }

  setBLMElement(parent, { option, classAttr });
  setTextComponent(parent, "[blm-value='propositiontitle']", title, {
    id: `propitem-${index + 1}-1`,
  });
  setTextComponent(parent, "[blm-value='propositiontext']", text, {
    id: `propitem-${index + 1}-2`,
  });
  setQuestionMediaComponent(parent, "[blm-value='mediaprop']", media);
  setQuestionSoundComponent(parent, "[blm-value='soundprop']", sound);

  if (info.isEditable && info.value) {
    setQuestionPropositionInfoHTML(parent, info.value);
  }
  setQuestionPropositionFeedbackHTML(parent, feedback);
}

function setQuestionPropositionInfoHTML(parent: HTMLElement, info: QuestionPropositionInfo) {
  const {
    type,
    simple: { text, title },
    simpleContentId,
  } = info;
  let option: string;

  if (type === QuestionPropositionInfoTypes.Detailed) {
    option =
      simpleContentId !== TemplateEditorOptionTypes.None
        ? `simplecontent(${simpleContentId})`
        : QuestionPropositionInfoTypes.None;
  } else {
    option = type;
  }

  setBLMElementBy(parent, "[blm-value='knowmoreprop']", { option });
  setTextComponent(parent, "[blm-value='knowmoreproppopuptitle']", title);
  setTextComponent(parent, "[blm-value='knowmoreproppopuptext']", text);
}

function setQuestionPropositionFeedbackHTML(
  parent: HTMLElement,
  feedback: QuestionPropositionFeedback
) {
  const { title, text, media, sound } = feedback;
  const element = getHTMLElement(parent, "[id='feedbackprop']");

  if (element) {
    setTextComponent(element, "[blm-value='propositionfeedbacktitle']", title);
    setTextComponent(element, "[blm-value='propositionfeedbacktext']", text);
    setQuestionMediaComponent(element, "[blm-value='mediafeedbackprop']", media);
    setQuestionSoundComponent(element, "[blm-value='soundfeedbackprop']", sound);
  }
}

function setQuestionCustomHTML(parent: HTMLElement, custom: QuestionCustomComponent) {
  const element = getHTMLElement(parent, "[blm-value='maincustommedia']");

  if (element) {
    const { format, value } = custom;
    const model = new BLMElement<MediaConfigJSON>();
    const attrs = new Attributes();
    const classAttr = new ClassAttribute();
    const styleAttr = new StyleAttribute();

    classAttr.items = format.value ? [format.value] : [];
    classAttr.removables = [...Object.values(MediaFormats)];

    if (format.value === MediaFormats.FixedWidth || format.value === MediaFormats.FixedSize) {
      styleAttr.width = valueToUnit(format.width || format.defaultWidth);
    }

    if (format.value === MediaFormats.FixedHeight || format.value === MediaFormats.FixedSize) {
      styleAttr.height = valueToUnit(format.height || format.defaultHeight);
    }

    if (value) {
      attrs["blm-custom"] = value.url + "/" + value.rootFile;
      model.editorOptions = value;
    } else {
      attrs.removables = ["blm-custom"];
      model.editorOptions = null;
    }

    model.attributes = attrs;
    model.classAttr = classAttr;
    model.styleAttr = styleAttr;

    setBLMElement(element, model);
  }
}
