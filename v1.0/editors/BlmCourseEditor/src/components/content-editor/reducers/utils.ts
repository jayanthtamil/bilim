import {
  ActionStyle,
  ButtonComponent,
  ButtonOptions,
  ComponentAction,
  ComponentStyle,
  CourseElementTemplate,
  MediaComponent,
  MediaHotspot,
  MediaSlideshow,
  RepeaterComponent,
  SoundComponent,
} from "types";
import { StyleListTypes, MediaFormats, MediaVariants } from "editor-constants";
import {
  isMediaImage,
  isMediaButton,
  isMediaSlideshow,
  isPopoverAction,
  isTooltipAction,
  isMediaFlipCard,
  isMediaStandardVideo,
} from "utils";
import { GlTemplateBuilderStore } from "template-builders";

export function initializeMedia(media: MediaComponent, template: CourseElementTemplate) {
  if (media.isEdited) {
    return media;
  }

  const result: MediaComponent = { ...media, isEdited: true };
  const { format, config, classList } = result;
  const { isSummary } = template;

  if (config && !format.value) {
    format.value = config.format.length ? config.format[0] : MediaFormats.Square;
  }

  if (isMediaImage(result) || isMediaButton(result) || isMediaStandardVideo(result)) {
    const { value } = result;

    if (!value.style.style && classList) {
      const type = getMediaComponentStyleType(result.variant!, isSummary);

      if (type) {
        value.style.style = getDefaultComponentStyle(type, classList);
      }
    }
  } else if (isMediaFlipCard(result)) {
    const { value } = result;

    if (!value.recto.style.style && classList) {
      value.recto.style.style = getDefaultComponentStyle(
        StyleListTypes.MediaFlipCardRecto,
        classList
      );
    }

    if (!value.verso.style.style && classList) {
      value.verso.style.style = getDefaultComponentStyle(
        StyleListTypes.MediaFlipCardVerso,
        classList
      );
    }
  } else if (isMediaSlideshow(result)) {
    const { value } = result;
    const { style, slideStyle } = value as MediaSlideshow;

    if (!style && classList) {
      value.style = getDefaultComponentStyle(StyleListTypes.MediaSlideshow, classList);
    }

    if (!slideStyle.style && classList) {
      value.slideStyle.style = getDefaultComponentStyle(
        StyleListTypes.MediaSlideshowItem,
        classList
      );
    }
  }

  return result;
}

export function initializeButton(button: ButtonComponent) {
  if (button.isEdited) {
    return button;
  }

  const result: ButtonComponent = { ...button, isEdited: true };
  const { value, classList, buttonOptions } = result;
  const { config, format } = buttonOptions;

  if (config && !format.value) {
    format.value = config.format.length ? config.format[0] : MediaFormats.Square;
  }

  if (!value.style.style && classList) {
    value.style.style = getDefaultComponentStyle(StyleListTypes.Button, classList);
  }

  return result;
}

export function initializeSound(sound: SoundComponent) {
  if (sound.isEdited) {
    return sound;
  }

  const result: SoundComponent = { ...sound, isEdited: true };
  const { value, classList } = result;

  if (!value.style.style && classList) {
    value.style.style = getDefaultComponentStyle(StyleListTypes.Sound, classList);
  }

  return result;
}

export function initializeRepeater(repeater: RepeaterComponent) {
  if (repeater.isEdited) {
    return repeater;
  }

  const result: RepeaterComponent = { ...repeater, isEdited: true };

  return result;
}

export function mapRepeaters<T>(
  repeaters: RepeaterComponent<T>[] | undefined,
  id: string,
  callbackFn: (value: T, index: number) => T
) {
  return repeaters?.map((repeater) =>
    repeater.id === id
      ? { ...repeater, isEdited: true, value: repeater.value?.map(callbackFn) }
      : repeater
  );
}

export function applyMediaComponetStyles(
  media: MediaComponent,
  source: MediaComponent,
  template: CourseElementTemplate,
  styleName?: string,
  style?: ComponentStyle
) {
  if (media.hasApplyStyle) {
    media = initializeMedia(media, template);

    const { format } = source;

    if (isMediaImage(media) && isMediaImage(source)) {
      const { option, isZoom } = source.value;

      return {
        ...media,
        format: { ...format },
        value: {
          ...media.value,
          option,
          isZoom,
          style: {
            ...(media.value.style as ComponentStyle),
            ...style,
            style: styleName,
            tint: style?.tint && { ...style.tint },
            bgTint: style?.bgTint && { ...style.bgTint },
          },
        },
        isEdited: true,
      };
    } else if (isMediaButton(media) && isMediaButton(source)) {
      const { option } = source.value;

      return {
        ...media,
        format: { ...format },
        value: {
          ...media.value,
          option,
          style: {
            ...(media.value.style as ComponentStyle),
            ...style,
            style: styleName,
            tint: style?.tint && { ...style.tint },
            bgTint: style?.bgTint && { ...style.bgTint },
          },
        },
        isEdited: true,
      };
    } else if (isMediaFlipCard(media) && isMediaFlipCard(source)) {
      return {
        ...media,
        format: { ...format },
        value: {
          ...media.value,
          recto: {
            ...media.value.recto,
            option: source.value.recto.option,
            style: { ...source.value.recto.style },
            tint: source.value.recto.style?.tint && { ...source.value.recto.style.tint },
            bgTint: source.value.recto.style?.bgTint && { ...source.value.recto.style.bgTint },
          },
          verso: {
            ...media.value.verso,
            option: source.value.verso.option,
            style: { ...source.value.verso.style },
            tint: source.value.verso.style?.tint && { ...source.value.verso.style.tint },
            bgTint: source.value.verso.style?.bgTint && { ...source.value.verso.style.bgTint },
          },
        },
        isEdited: true,
      };
    } else if (isMediaSlideshow(media) && isMediaSlideshow(source)) {
      const { style: styleName2 } = source.value;

      return {
        ...media,
        format: { ...format },
        value: {
          ...media.value,
          style: styleName2,
          slideStyle: {
            ...media.value.slideStyle,
            ...style,
            style: styleName,
            tint: style?.tint && { ...style.tint },
            bgTint: style?.bgTint && { ...style.bgTint },
          },
        },
        isEdited: true,
      };
    } else if (isMediaStandardVideo(media) && isMediaStandardVideo(source)) {
      const { option } = source.value;

      return {
        ...media,
        format: { ...format },
        value: {
          ...media.value,
          option,
          style: {
            ...(media.value.style as ComponentStyle),
            ...style,
            style: styleName,
          },
        },
        isEdited: true,
      };
    }
  }

  return media;
}

export function applyButtonComponetStyles(
  button: ButtonComponent,
  styleName: string,
  sourceFormat: ButtonOptions,
  style?: ComponentStyle
) {
  if (button.hasApplyStyle) {
    button = initializeButton(button);

    return {
      ...button,
      buttonOptions: { ...sourceFormat },
      value: {
        ...button.value,
        style: {
          ...button.value.style,
          ...style,
          style: styleName,
          tint: style?.tint ? { ...button.value.style.tint, ...style?.tint } : undefined,
          tintOut: style?.tintOut
            ? { ...button.value.style.tintOut, ...style?.tintOut }
            : undefined,
          tintOver: style?.tintOver
            ? { ...button.value.style.tintOver, ...style?.tintOver }
            : undefined,
        },
      },
      isEdited: true,
    };
  }

  return button;
}

export function applySoundComponetStyles(
  sound: SoundComponent,
  styleName: string,
  style?: ComponentStyle
) {
  if (sound.hasApplyStyle) {
    sound = initializeSound(sound);

    return {
      ...sound,
      value: {
        ...sound.value,
        style: {
          ...sound.value.style,
          ...style,
          style: styleName,
          tint: { ...sound.value.style.tint, ...style?.tint },
        },
      },
      isEdited: true,
    };
  }

  return sound;
}

export function applyHotspotItemStyles(hotspot: MediaHotspot, style: string) {
  return {
    ...hotspot,
    items: hotspot.items.map((item) => ({ ...item, style })),
  };
}

export function applyHotspotActionStyles(
  hotspot: MediaHotspot,
  style: ActionStyle,
  exclude: ComponentAction
) {
  const isValidAction = (action: ComponentAction) => {
    return (
      action !== exclude &&
      ((style.name === "tooltip" && isTooltipAction(action)) ||
        (style.name === "popover" && isPopoverAction(action)))
    );
  };

  const cloneAction = (action: ComponentAction) => {
    if (isValidAction(action)) {
      return { ...action, value: { ...action.value, style: style.style } };
    }

    return action;
  };

  return {
    ...hotspot,
    items: hotspot.items.map((item) => {
      if (isValidAction(item.clickAction) || isValidAction(item.overAction)) {
        return {
          ...item,
          clickAction: cloneAction(item.clickAction),
          overAction: cloneAction(item.overAction),
        };
      } else {
        return item;
      }
    }),
  };
}

function getMediaComponentStyleType(variant: MediaVariants, isSummary: boolean) {
  if (variant === MediaVariants.Image) {
    return StyleListTypes.MediaImage;
  } else if (variant === MediaVariants.Button) {
    return isSummary ? StyleListTypes.MediaButtonSummary : StyleListTypes.MediaButton;
  }
}

export function getDefaultComponentStyle(type: StyleListTypes, classList?: Array<string>) {
  const styles = GlTemplateBuilderStore.getStyles();

  if (styles && styles[type]) {
    const { classNames } = styles[type]!;

    return classList?.find((cls) => classNames.includes(cls)) || classNames[0];
  }
}
