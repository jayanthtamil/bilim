import { ButtonComponent, MediaConfig, MediaFile, SimpleObject, Tint } from "types";
import {
  ComponentActionTypes,
  GotoActionTypes,
  MediaFormats,
  StyleListTypes,
} from "editor-constants";
import { toJSONObject } from "utils";
import {
  createMediaFormat,
  getAllHTMLElements,
  getBLMElement,
  getHTMLElement,
  setComponentBy,
} from "../../core";
import { createAction, createComponentStyle } from "./common";

export function getAllButtonComponent(parent: HTMLElement, selector: string, repeaterId?: string) {
  const elements = getAllHTMLElements(parent, selector);
  const buttons = [];

  for (let element of elements) {
    const button = createButton(element);
    button.repeaterId = repeaterId;

    buttons.push(button);
  }

  return buttons;
}

function createButton(element: HTMLElement) {
  const button = new ButtonComponent();
  const model = getBLMElement<
    object,
    { background?: MediaFile; inline?: MediaFile; tint?: Tint; format: string } | undefined
  >(element);
  const label = getHTMLElement(element, ".buttonoptionwrapper .buttonlabel");
  const num = getHTMLElement(element, ".buttonoptionwrapper .buttonnumber");
  const title = getHTMLElement(element, ".txtwrapper .buttontitle");
  const desc = getHTMLElement(element, ".txtwrapper .buttondescription");
  const caption = getHTMLElement(element, ".txtwrapper .buttoncaption");
  const { attributes, editorOptions } = model;
  const { value } = button;
  const action = toJSONObject<{
    onClick?: SimpleObject;
    onRollOver?: SimpleObject;
  }>(attributes?.["blm-action"]);

  if (
    action &&
    action.onClick &&
    action.onClick.action === ComponentActionTypes.Goto &&
    Object.values(GotoActionTypes).includes(action.onClick.option)
  ) {
    action.onClick.action = ComponentActionTypes.Navigation;
  }

  setComponentBy(button, model);

  button.classList = Array.from(element.classList);
  button.hasApplyStyle = attributes?.["unapplystyle"] === undefined;
  button.buttonOptions.config = {} as MediaConfig;
  button.buttonOptions.config.format =
    (editorOptions?.format && (editorOptions?.format.split(",") as MediaFormats[])) ||
    (["auto", "pixelwidth"] as MediaFormats[]);
  button.buttonOptions.format = createMediaFormat(
    Array.from(element.classList),
    element.style,
    button.buttonOptions.config?.format
  );
  button.buttonOptions.format.defaultWidth = 200;

  value.background = editorOptions?.background;
  value.inline = editorOptions?.inline;
  value.title = title?.textContent || "";
  value.description = desc?.textContent || "";
  value.caption = caption?.textContent || "";
  value.label = label?.textContent || "";
  value.number = num?.textContent || "";
  value.clickAction = createAction("click", action?.onClick);
  value.overAction = createAction("over", action?.onRollOver);
  value.style = createComponentStyle(element, StyleListTypes.Button, true);
  value.style.tint = editorOptions?.tint || value.style.tint;

  return button;
}
