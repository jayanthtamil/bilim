import {
  ButtonComponent,
  ContentTemplate,
  CourseElementTemplate,
  MediaComponent,
  RepeaterComponent,
  SoundComponent,
  TemplateRepeater,
  TextComponent,
} from "types";
import { createHTMLElement, getMaxValue } from "utils";
import { getHTMLElement, getStyleElementRules, setStyleSheetHTML } from "../../core";
import {
  setMediaComponent,
  setRepeaterComponent,
  setTextComponent,
  setButtonComponent,
  setStyleSheetRules,
  setSoundComponent,
  getRepeaterElements,
  setRelativeStyles,
} from "../component";

export function setHotspotClass(
  template: CourseElementTemplate,
  attri: any,
  compRatio: number,
  imgRatio: number
) {
  const { html } = template;
  const element = createHTMLElement(html);

  if (element) {
    if (compRatio < imgRatio) {
      element.querySelector(attri).classList.add("horizontal");
      element.querySelector(attri).classList.remove("vertical");
    } else {
      element.querySelector(attri).classList.add("vertical");
      element.querySelector(attri).classList.remove("horizontal");
    }

    return element.outerHTML;
  }
}

function arrayEquals(a: Array<any>, b: Array<any>) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

export function checkPrev(
  templates: CourseElementTemplate[] | undefined,
  prevEle: CourseElementTemplate[] | undefined
) {
  var testarrat1: Array<any> = [];
  var testarrat2: Array<any> = [];

  templates?.map((temp: CourseElementTemplate, ind: number) => {
    var html = createHTMLElement(temp.html);

    var hotspot1 = html?.querySelectorAll(`div[blm-component=media][blm-media^=hotspot]`);
    hotspot1?.forEach((val, i) => {
      var imageVal = val?.querySelector(".imagewrapper")?.getElementsByTagName("img")[0].src;
      testarrat1.push(imageVal);
    });
  });

  prevEle?.map((temp: CourseElementTemplate, ind: number) => {
    var html = createHTMLElement(temp.html);
    var hotspot21 = html?.querySelectorAll(`div[blm-component=media][blm-media^=hotspot]`);
    hotspot21?.forEach((val, i) => {
      var imageVal = val?.querySelector(".imagewrapper")?.getElementsByTagName("img")[0].src;
      testarrat2.push(imageVal);
    });
  });

  return arrayEquals(testarrat1, testarrat2);
}

export function CheckHotspotContainClass(templates: CourseElementTemplate[] | undefined) {
  var x = true;
  templates?.map((temp: CourseElementTemplate, ind: number) => {
    var html = createHTMLElement(temp.html);
    if (html?.classList) {
      Array.from(html?.classList).find((cls) => cls.startsWith("rt-etr-"));
      var hotspot = html?.querySelectorAll(`div[blm-component=media][blm-media^=hotspot]`);

      hotspot?.forEach((val, i) => {
        if (val.classList.contains("hotspot") && val.classList.contains("contain")) {
          if (!(val.classList.contains("vertical") || val.classList.contains("horizontal"))) {
            x = false;
            return x;
          }
        } else if (
          val.classList.contains("hotspot") &&
          val.classList.contains("panandzoom_hotspot")
        ) {
          if (val.classList.contains("vertical") || val.classList.contains("horizontal")) {
            x = false;
            return x;
          }
        }
      });
    }
  });

  return x;
}

export function RemoveHotspotClass(template: CourseElementTemplate, attri: any) {
  const { html } = template;
  const element = createHTMLElement(html);

  if (element) {
    element.querySelector(attri).classList.remove("vertical");
    element.querySelector(attri).classList.remove("horizontal");

    return element.outerHTML;
  }
}

export function setContentTemplateHTML(
  template: CourseElementTemplate,
  content: ContentTemplate,
  duplicate?: string
) {
  const { html, template: associated } = template;
  const element = createHTMLElement(html);
  const { texts, medias, buttons, sounds, repeater } = content;

  if (element) {
    const maxId = getMaxValue([...texts, ...medias, ...buttons], "id");
    const rules = getStyleElementRules(element);

    setTextComponentsHTML(element, texts);
    setMediaComponentsHTML(element, medias);
    setButtonComponentsHTML(element, buttons);
    setSoundComponentsHTML(element, sounds);
    setRepeaterComponentHTML(element, repeater, maxId);

    if (rules) {
      if (duplicate) {
        setStyleSheetRules(element, associated.name, rules, "duplicate");
      } else {
        setStyleSheetRules(element, associated.name, rules);
      }
      setRelativeStyles(rules, medias, repeater.medias ?? []);
      setStyleSheetHTML(element);
    }

    return element.outerHTML;
  }

  return html;
}

function setTextComponentsHTML(root: HTMLElement, texts: TextComponent[]) {
  for (let text of texts) {
    if (text.id && text.isEdited) {
      text.isEditable = true;

      setTextComponent(root, `[blm-id='${text.id.toString()}']`, text);
    }
  }
}

function setMediaComponentsHTML(parent: HTMLElement, medias: MediaComponent[]) {
  for (let media of medias) {
    if (media.id && media.isEdited) {
      const element = getHTMLElement(parent, `[blm-id='${media.id.toString()}']`);

      if (element) {
        setMediaComponent(element, media);
      }
    }
  }
}

function setButtonComponentsHTML(parent: HTMLElement, buttons: ButtonComponent[]) {
  for (let button of buttons) {
    if (button.id && button.isEdited) {
      const element = getHTMLElement(parent, `[blm-id='${button.id.toString()}']`);

      if (element) {
        setButtonComponent(element, button);
      }
    }
  }
}

function setSoundComponentsHTML(parent: HTMLElement, sounds: SoundComponent[]) {
  for (let sound of sounds) {
    if (sound.id && sound.isEdited) {
      const element = getHTMLElement(parent, `[blm-id='${sound.id.toString()}']`);

      if (element) {
        setSoundComponent(element, sound);
      }
    }
  }
}

function setRepeaterComponentHTML(root: HTMLElement, repeater: TemplateRepeater, start: number) {
  const { medias = [], buttons = [], sounds = [] } = repeater;
  const { mediaEls, buttonEls, soundEls } = getRepeaterElements(root);
  const repeaters = [medias, buttons, sounds];
  const elments = [mediaEls, buttonEls, soundEls];

  repeaters.forEach((item, i) => {
    (item as RepeaterComponent[]).forEach((repeater, j) => {
      const element = elments[i][j];

      if (element && repeater && repeater.isEdited) {
        setRepeaterComponent(element, repeater, start + 1);
      }

      start += repeater.value?.length || 0;
    });
  });
}
