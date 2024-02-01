import {
  ClassAttribute,
  StyleAttribute,
  BLMElement,
  ButtonComponent,
  ButtonRepeaterComponent,
  MediaComponent,
  MediaRepeaterComponent,
  RepeaterComponent,
  RepeaterConfigJSON,
  SoundComponent,
  SoundRepeaterComponent,
} from "types";
import { ComponentTypes } from "editor-constants";
import {
  createHTMLElement,
  isButtonRepeater,
  isMediaRepeater,
  isSoundRepeater,
  toJSONString,
} from "utils";
import { getAllHTMLElements, getBLMElement, getHTMLElement, setBLMElement } from "../../core";
import { setButtonComponent } from "./button";
import { setMediaComponent } from "./media";
import { setSoundComponent } from "./sound";

export function getRepeaterElements(parent: HTMLElement) {
  const elements = getAllHTMLElements(parent, '[blm-component="repeater"]');
  const result: Record<"mediaEls" | "buttonEls" | "soundEls", HTMLElement[]> = {
    mediaEls: [],
    buttonEls: [],
    soundEls: [],
  };

  for (const element of elements) {
    const model = getBLMElement<RepeaterConfigJSON>(element);
    const { options } = model;
    const { allowcomponent } = options || {};

    if (allowcomponent === ComponentTypes.Media) {
      result.mediaEls.push(element);
    } else if (allowcomponent === ComponentTypes.Button) {
      result.buttonEls.push(element);
    } else if (allowcomponent === ComponentTypes.Sound) {
      result.soundEls.push(element);
    }
  }

  return result;
}

export function setRepeaterComponent(
  element: HTMLElement,
  repeater: RepeaterComponent,
  startId: number
) {
  const model = createRepeater(repeater);

  setBLMElement(element, model);
  setRepeaterHTML(element, repeater, startId);
}

function createRepeater(repeater: RepeaterComponent) {
  const { value, variables } = repeater;
  const model = new BLMElement();
  const classAttr = new ClassAttribute();
  const styleAttr = new StyleAttribute();
  const len = value?.length || 0;

  if (isButtonRepeater(repeater)) {
    classAttr.items = [`button_items_${len}`];
    classAttr.removables = [/^button_items_(\d+)$/g];
  } else {
    classAttr.items = [`repeater_items_${len}`];
    classAttr.removables = [/^repeater_items_(\d+)$/g];
  }

  for (const key in variables) {
    styleAttr[key] = variables[key];
  }

  styleAttr["--blm_items"] = len;

  model.classAttr = classAttr;
  model.styleAttr = styleAttr;

  return model;
}

function setRepeaterHTML(parent: HTMLElement, repeater: RepeaterComponent, startId: number) {
  const { value } = repeater;
  const ids: Array<string | null> = [];
  const nodes: HTMLElement[] = [];
  let newNode: HTMLElement | null = null;

  if (isMediaRepeater(repeater)) {
    newNode = createMediaNode();
  } else if (isButtonRepeater(repeater)) {
    newNode = createButtonNode(parent, repeater.duplicate);
  } else if (isSoundRepeater(repeater)) {
    newNode = createSoundNode();
  }

  while (parent.firstChild) {
    const child = parent.removeChild(parent.firstChild) as HTMLElement;
    if (child.nodeType === Node.ELEMENT_NODE) {
      ids.push(child.getAttribute("blm-id"));
      nodes.push(child);
    }
  }

  if (value) {
    value.forEach((component, i) => {
      if (component.id && newNode) {
        const newId = startId + i;
        const lineBreak = document.createTextNode("\n"); //Remove this tag, if it runs slower
        const ind = ids.indexOf(component.id);
        const node =
          ind !== -1 && ind < nodes.length ? nodes[ind] : (newNode.cloneNode(true) as HTMLElement);
        if (component.isCreated || component.isEdited) {
          if (isMediaRepeater(repeater)) {
            setMediaNode(node, repeater, component as MediaComponent);
          } else if (isButtonRepeater(repeater)) {
            setButtonNode(node, repeater, component as ButtonComponent);
          } else if (isSoundRepeater(repeater)) {
            setSoundNode(node, repeater, component as SoundComponent);
          }
        }

        node.setAttribute("blm-id", newId.toString());

        parent.appendChild(lineBreak);
        parent.appendChild(node);
      }
    });
  }
}

function duplicateNode(parent: HTMLElement, selector: string): HTMLElement | null {
  return getHTMLElement(parent, selector);
}

function createMediaNode() {
  const str = `<div blm-component="media" blm-id="" class="" blm-options="">
        <img src="">
    </div>
  `;

  return createHTMLElement(str);
}

function setMediaNode(
  element: HTMLElement,
  repeater: MediaRepeaterComponent,
  media: MediaComponent
) {
  if (element) {
    const { defaultClass = "", mediaConfig } = repeater;
    const { mediatype, format, style = "" } = mediaConfig || {};
    const options = toJSONString({ mediatype, format }) || "";
    const { isEdited } = media;

    element.setAttribute("blm-options", options);
    element.setAttribute("class", defaultClass);
    element.setAttribute("style", style);

    if (isEdited) {
      setMediaComponent(element, media);
    }
  }
}

function createButtonNode(parent: HTMLElement, duplicate?: boolean) {
  let result;

  if (duplicate) {
    result = duplicateNode(parent, '[blm-component="button"]');
  }

  if (!result) {
    const str = `<div blm-component="button" blm-id="" class=""></div>`;
    result = createHTMLElement(str);
  }

  return result;
}

function setButtonNode(
  element: HTMLElement,
  repeater: ButtonRepeaterComponent,
  button: ButtonComponent
) {
  if (element) {
    const { defaultClass = "" } = repeater;
    const { isEdited } = button;

    element.setAttribute("class", defaultClass);

    if (isEdited) {
      setButtonComponent(element, button);
    }
  }
}

function createSoundNode() {
  let result;

  const str = `<div blm-component="audio" blm-id="" class=""></div>`;
  result = createHTMLElement(str);

  return result;
}

function setSoundNode(
  element: HTMLElement,
  repeater: SoundRepeaterComponent,
  sound: SoundComponent
) {
  if (element) {
    const { defaultClass = "" } = repeater;
    const { isEdited } = sound;

    element.setAttribute("class", defaultClass);

    if (isEdited) {
      setSoundComponent(element, sound);
    }
  }
}
