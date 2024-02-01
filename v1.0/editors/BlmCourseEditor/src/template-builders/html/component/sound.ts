import { ClassAttribute, BLMElement, StyleAttribute, SoundComponent } from "types";
import { StyleListTypes } from "editor-constants";
import { setBLMElement } from "../../core";
import { getComponentClassNames, getStyleClassNames, getTintStyles } from "./common";

export function setSoundComponent(element: HTMLElement, sound: SoundComponent) {
  const model = createSound(sound);

  setBLMElement(element, model);
  setSoundHTML(element, sound);
}

function createSound(sound: SoundComponent) {
  const { value, options, isDeactivated } = sound;
  const { media, image, autoPlay, localPlay, style } = value;
  const model = new BLMElement();
  const classAttr = new ClassAttribute();
  const styleAttr = new StyleAttribute();
  const clsNames = getComponentClassNames([StyleListTypes.Sound]);

  model.isDeactivated = isDeactivated;
  model.editorOptions = media || image ? { media, image } : null;

  classAttr.removables = [...clsNames, "vertical", "horizontal", "shadow"];
  styleAttr.removables = [
    "--blm_tint_color",
    "--blm_tint_opacity",
    "--blm_undertext_color",
    "--blm_undertext_opacity",
  ];

  if (style) {
    classAttr.items.push(...getStyleClassNames(style, "sound"));
    Object.assign(styleAttr, getTintStyles(style));
  }

  model.options = {
    ...options,
    parameters: { ...options?.parameters, autostart: autoPlay, local: localPlay },
  };
  model.classAttr = classAttr;
  model.styleAttr = styleAttr;

  return model;
}

function setSoundHTML(element: HTMLElement, sound: SoundComponent) {
  if (sound) {
    const { value } = sound;
    const { media, image, title, description, caption } = value;

    element.innerHTML = `
    <div class="mediawrapper">
      <audio controls>${media ? `\n\t<source src="${media.url}" type="audio/mpeg" />` : ""}${
      media?.subtitle
        ? `\n\t<track label="english" kind="subtitles" srclang="en" src="${media.subtitle.url}" default/>`
        : ""
    }${
      media?.marker
        ? `\n\t<track label="english" kind="chapters" srclang="en" src="${media.marker.url}"/>`
        : ""
    }        
        Your browser does not support the audio tag.
      </audio>
      <div class="audiothumbnail">
        <img src="${image?.url || ""}"/>
      </div>
      <div class="captionwrapper">
        <div class="title">${title}</div>
        <div class="description">${description}</div>
        <div class="caption">${caption}</div>
      </div>
    </div>`;
  }
}
