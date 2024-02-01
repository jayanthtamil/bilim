import { Attributes, ClassAttribute, BLMElement, StyleAttribute, ButtonComponent } from "types";
import { MediaFormats, StyleListTypes } from "editor-constants";
import { createRGBA } from "utils";
import { setBLMElement } from "../../core";
import { createAction, getComponentClassNames, getStyleClassNames, getTintStyles } from "./common";

export function setButtonComponent(element: HTMLElement, button: ButtonComponent) {
  const model = createButton(button);

  setBLMElement(element, model);
  setButtonHTML(element, button);
}

function createButton(button: ButtonComponent) {
  const { value, isDeactivated, buttonOptions } = button;
  const { background, inline, clickAction, overAction, style } = value;
  const { tint } = style;
  const model = new BLMElement();
  const attrs = new Attributes();
  const classAttr = new ClassAttribute();
  const styleAttr = new StyleAttribute();
  const clsNames = getComponentClassNames([StyleListTypes.Button]);
  const onClick = createAction(clickAction, "click");
  const onRollOver = createAction(overAction, "over");
  const tintRgb = createRGBA(tint?.color, tint?.alpha);

  model.isDeactivated = isDeactivated;
  model.editorOptions =
    background || inline || tint?.color
      ? { background, inline, tint: tintRgb ? tint : undefined }
      : null;

  attrs.removables = ["blm-action"];
  classAttr.removables = [...clsNames, "darkout", "darkover", "shadow", "vertical", "horizontal"];
  styleAttr.removables = [
    "backgroundImage",
    "--tintout",
    "--opacityout",
    "--tintover",
    "--opacityover",
  ];

  if (onClick || onRollOver) {
    attrs["blm-action"] = JSON.stringify({
      onClick,
      onRollOver,
    });
  }

  if (style) {
    classAttr.items.push(...getStyleClassNames(style, "button"));
    Object.assign(styleAttr, getTintStyles(style));
  }

  if (buttonOptions && buttonOptions.format) {
    if (buttonOptions.format.value === MediaFormats.FixedWidth) {
      styleAttr["--blm_width"] = buttonOptions.format.width;
      classAttr.items.push(MediaFormats.FixedWidth);
    } else {
      styleAttr["--blm_width"] = 0;
      classAttr.items.push(MediaFormats.Auto);
    }
  }

  model.attributes = attrs;
  model.classAttr = classAttr;
  model.styleAttr = styleAttr;

  return model;
}

function setButtonHTML(element: HTMLElement, button: ButtonComponent) {
  if (button) {
    const { value } = button;
    const { inline, title, description, caption } = value;

    element.innerHTML = `
    <div class="buttonwrapper">
      <div class="iconwrapper">
        <div class="icon" >
          <img src="${inline?.url || ""}"/>
        </div>
      </div>
      <div class="txtwrapper">
        <div class="buttontitle">${title}</div>
        <div class="buttondescription">${description}</div>
        <div class="buttoncaption">${caption}</div>
      </div>
      <div class="validate"></div>
    </div>
    <div class="background"></div>
    `;
  }
}
