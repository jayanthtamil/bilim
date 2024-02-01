import {
  ButtonComponent,
  ButtonRepeaterComponent,
  MediaComponent,
  MediaConfig,
  MediaConfigJSON,
  MediaFormat,
  MediaRepeaterComponent,
  RepeaterComponent,
  SimpleObject,
  SoundComponent,
} from "types";
import { MediaFormats, MediaVariants } from "editor-constants";
import { createStyleJsonFromString, createUUID, toNumber } from "utils";

export function createMediaConfig(config: MediaConfigJSON, variant?: MediaVariants) {
  const { mediatype, format, style, saveincss } = config;
  const result = {} as MediaConfig;

  result.variant = mediatype.split(",") as MediaConfig["variant"];
  result.format = format.split(",") as MediaConfig["format"];
  result.style = style !== "" ? createStyleJsonFromString(style) : undefined;
  result.saveInCSS = saveincss || false;

  return result;
}

export function updateMediaConfig(
  currentComponentConfig?: MediaConfig,
  previousComponentConfig?: MediaConfig
) {
  if (currentComponentConfig && previousComponentConfig) {
    currentComponentConfig.variant = previousComponentConfig.variant as MediaConfig["variant"];
  }
}

export function createMediaFormat(
  classList: string[],
  style?: SimpleObject,
  options?: MediaFormats[]
) {
  const format = new MediaFormat();

  Object.values(MediaFormats).forEach((value) => {
    if (classList.includes(value) && options?.includes(value)) {
      format.value = value;
    }
  });

  if (style && style.width !== "") {
    format.width = toNumber(style.width);
  }

  if (style && style.getPropertyValue && style.getPropertyValue("--blm_width") !== "") {
    format.width = toNumber(style.getPropertyValue("--blm_width"));
  }

  if (style && style.height !== "") {
    format.height = toNumber(style.height);
  }

  return format;
}

export function createMediaComponent(repeater: MediaRepeaterComponent) {
  const { id, mediaConfig, defaultClass = "" } = repeater;
  const classList = defaultClass.split(" ");
  const component = new MediaComponent();
  component.id = createUUID();
  component.repeaterId = id;
  component.isCreated = true;
  component.options = mediaConfig;
  component.config = mediaConfig && createMediaConfig(mediaConfig);
  component.format = createMediaFormat(
    classList,
    component.config?.style,
    component.config?.format
  );
  component.classList = classList;

  return component;
}

export function updateCreatedMediaComponet(
  repeater: MediaRepeaterComponent,
  component: MediaComponent
) {
  if (repeater.value) {
    component.variant = repeater.value[repeater.value.length - 1].variant;
    component.format.height = repeater.value[repeater.value.length - 1].format.height;
    component.format.width = repeater.value[repeater.value.length - 1].format.width;
    if (repeater.value[repeater.value.length - 1].format.value) {
      component.format.value = repeater.value[repeater.value.length - 1].format.value;
    } else if (repeater.value[repeater.value.length - 1].config) {
      component.format.value = repeater.value[repeater.value.length - 1].config?.format[0];
    }
    updateMediaConfig(component.config, repeater.value[repeater.value.length - 1].config);
  }
  component.isEdited = true;
}

export const updateCreatedButtonComponent = (
  repeater: ButtonRepeaterComponent,
  component: ButtonComponent
) => {
  component.buttonOptions.config = {} as MediaConfig;
  component.buttonOptions.config.format = ["auto", "pixelwidth"] as MediaFormats[];
  component.buttonOptions.format = {} as MediaFormat;
  if (repeater.value && repeater.value.length > 0) {
    component.buttonOptions.format.value =
      repeater.value[repeater.value?.length - 1].buttonOptions.format.value;
    component.buttonOptions.format.width =
      repeater.value[repeater.value?.length - 1].buttonOptions.format.width;
  } else {
    component.buttonOptions.format.value = MediaFormats.Auto;
    component.buttonOptions.format.width = 0;
  }
  component.buttonOptions.format.defaultWidth = 200;
};

export function createButtonComponent(repeater: RepeaterComponent) {
  const { id, defaultClass = "" } = repeater;
  const classList = defaultClass.split(" ");
  const component = new ButtonComponent();
  component.id = createUUID();
  component.repeaterId = id;
  component.isCreated = true;
  component.classList = classList;

  return component;
}

export function createSoundComponent(repeater: RepeaterComponent) {
  const { id, defaultClass = "" } = repeater;
  const classList = defaultClass.split(" ");
  const component = new SoundComponent();
  component.id = createUUID();
  component.repeaterId = id;
  component.isCreated = true;
  component.classList = classList;

  return component;
}
