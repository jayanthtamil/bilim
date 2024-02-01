import i18next from "i18next";

import {
  MediaComponent,
  MediaImage,
  MediaButton,
  MediaCustom,
  MediaTarget,
  ContentTemplate,
  ExternalVideo,
  StandardVideo,
  MediaSlideshow,
  MediaSlideshowItem,
  MediaVideo,
  MediaFlipCard,
  SynchroVideo,
  MediaHotspot360,
  MediaHotspot,
  MediaHotspotPlain,
  CourseElement,
  ButtonComponent,
  ButtonValue,
  SoundComponent,
  SoundValue,
} from "types";
import { MediaVariants } from "editor-constants";
import { createShortUUID, createUUID } from "utils";
import { isVideoMediaComponent } from "utils";

import { getRepeaterComponents } from "./component";

export function getMediaImage(component: MediaComponent) {
  if (isMediaImage(component)) {
    return component;
  } else {
    const image = new MediaImage();

    if (isMediaSlideshow(component)) {
      const { items } = component.value;
      const item = items[0];

      if (item) {
        const { media, title, caption, description } = item;

        image.media = media;
        image.title = title;
        image.caption = caption;
        image.description = description;
      }
    } else if (isMediaButton(component)) {
      const { out, title, caption, description } = component.value;

      image.media = out;
      image.title = title;
      image.caption = caption;
      image.description = description;
    } else if (isMediaFlipCard(component)) {
      const { recto, verso } = component.value;
      const side = recto.media ? recto : verso;

      image.media = side.media;
      image.title = side.title;
      image.caption = side.caption;
      image.description = side.description;
    } else if (isMediaVideo(component)) {
      const { title, caption, description } = component.value;

      image.title = title;
      image.caption = caption;
      image.description = description;
    } else if (isMediaStandardVideo(component)) {
      const { title, caption, description } = component.value;

      image.title = title;
      image.caption = caption;
      image.description = description;
    } else if (isMediaHotspot(component)) {
      const { media } = component.value;

      image.media = media;
    }

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.Image,
      value: image,
    };
  }
}

export function getMediaSlideshow(component: MediaComponent) {
  if (isMediaSlideshow(component)) {
    return component;
  } else {
    const slideshow = new MediaSlideshow();
    const item = new MediaSlideshowItem();

    item.id = createUUID();
    slideshow.items = [item];

    if (isMediaImage(component)) {
      const { media, title, caption, description } = component.value;

      item.media = media;
      item.title = title;
      item.caption = caption;
      item.description = description;
    } else if (isMediaButton(component)) {
      const { out, title, caption, description } = component.value;

      item.media = out;
      item.title = title;
      item.caption = caption;
      item.description = description;
    } else if (isMediaFlipCard(component)) {
      const { recto, verso } = component.value;
      const side = recto.media ? recto : verso;

      item.media = side.media;
      item.title = side.title;
      item.caption = side.caption;
      item.description = side.description;
    } else if (isMediaVideo(component)) {
      const { title, caption, description } = component.value;

      item.title = title;
      item.caption = caption;
      item.description = description;
    } else if (isMediaStandardVideo(component)) {
      const { title, caption, description } = component.value;

      item.title = title;
      item.caption = caption;
      item.description = description;
    } else if (isMediaHotspot(component)) {
      const { media } = component.value;

      item.media = media;
    }

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.Slideshow,
      value: slideshow,
    };
  }
}

export function getMediaButton(component: MediaComponent) {
  if (isMediaButton(component)) {
    return component;
  } else {
    const button = new MediaButton();

    if (isMediaImage(component)) {
      const { media, title, caption, description } = component.value;

      button.out = media;
      button.title = title;
      button.caption = caption;
      button.description = description;
    } else if (isMediaSlideshow(component)) {
      const { items } = component.value;
      const item = items[0];

      if (item) {
        const { media, title, caption, description } = item;

        button.out = media;
        button.title = title;
        button.caption = caption;
        button.description = description;
      }
    } else if (isMediaFlipCard(component)) {
      const { recto, verso } = component.value;
      const side = recto.media ? recto : verso;

      button.out = side.media;
      button.title = side.title;
      button.caption = side.caption;
      button.description = side.description;
      button.label = side.label;
      button.number = side.number;
      button.duration = side.duration;
    } else if (isMediaVideo(component)) {
      const { title, caption, description } = component.value;

      button.title = title;
      button.caption = caption;
      button.description = description;
    } else if (isMediaStandardVideo(component)) {
      const { title, caption, description } = component.value;

      button.title = title;
      button.caption = caption;
      button.description = description;
    } else if (isMediaHotspot(component)) {
      const { media } = component.value;

      button.out = media;
    }

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.Button,
      value: button,
    };
  }
}

export function getMediaFlipCard(component: MediaComponent) {
  if (isMediaFlipCard(component)) {
    return component;
  } else {
    const flipcard = new MediaFlipCard();
    const { recto } = flipcard;

    if (isMediaImage(component)) {
      const { media, title, caption, description } = component.value;

      recto.media = media;
      recto.title = title;
      recto.caption = caption;
      recto.description = description;
    } else if (isMediaSlideshow(component)) {
      const { items } = component.value;
      const item = items[0];

      if (item) {
        const { media, title, caption, description } = item;

        recto.media = media;
        recto.title = title;
        recto.caption = caption;
        recto.description = description;
      }
    } else if (isMediaButton(component)) {
      const { out, title, description, caption, label, number, duration } = component.value;

      recto.media = out;
      recto.title = title;
      recto.caption = caption;
      recto.description = description;
      recto.label = label;
      recto.number = number;
      recto.duration = duration;
    } else if (isMediaVideo(component)) {
      const { title, caption, description } = component.value;

      recto.title = title;
      recto.caption = caption;
      recto.description = description;
    } else if (isMediaStandardVideo(component)) {
      const { title, caption, description } = component.value;

      recto.title = title;
      recto.caption = caption;
      recto.description = description;
    } else if (isMediaHotspot(component)) {
      const { media } = component.value;

      recto.media = media;
    }

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.FlipCard,
      value: flipcard,
    };
  }
}

export function getMediaCustom(component: MediaComponent) {
  if (isMediaCustom(component)) {
    return component;
  } else {
    const custom = new MediaCustom();

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.Custom,
      value: custom,
    };
  }
}

export function getMediaTarget(component: MediaComponent, template?: ContentTemplate) {
  if (isMediaTarget(component)) {
    return component;
  } else {
    const len = template ? getMediaTargets(template).length : 0;
    const target = new MediaTarget();
    target.name = `${i18next.t("utils:media.target")}` + (len + 1);

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.Target,
      value: target,
    };
  }
}

export function getMediaVideo(component: MediaComponent) {
  if (
    isMediaVideo(component) ||
    isMediaExternalVideo(component) ||
    isMediaStandardVideo(component)
  ) {
    return component;
  } else {
    const video = new MediaVideo();

    if (isMediaImage(component)) {
      const { title, caption, description } = component.value;

      video.title = title;
      video.caption = caption;
      video.description = description;
    } else if (isMediaSlideshow(component)) {
      const { items } = component.value;
      const item = items[0];

      if (item) {
        const { title, caption, description } = item;

        video.title = title;
        video.caption = caption;
        video.description = description;
      }
    } else if (isMediaButton(component)) {
      const { title, caption, description } = component.value;

      video.title = title;
      video.caption = caption;
      video.description = description;
    } else if (isMediaFlipCard(component)) {
      const { recto, verso } = component.value;
      const side = recto.media ? recto : verso;

      video.title = side.title;
      video.caption = side.caption;
      video.description = side.description;
    }

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.Video,
      value: video,
    };
  }
}

export function getMediaExternalVideo(component: MediaComponent) {
  if (isMediaExternalVideo(component)) {
    return component;
  } else {
    const video = new ExternalVideo();

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.VideoExternal,
      value: video,
    };
  }
}

export function getMediaStandardVideo(component: MediaComponent) {
  if (isMediaStandardVideo(component)) {
    return component;
  } else {
    const video = new StandardVideo();

    if (isMediaImage(component)) {
      const { title, caption, description } = component.value;

      video.title = title;
      video.caption = caption;
      video.description = description;
    } else if (isMediaSlideshow(component)) {
      const { items } = component.value;
      const item = items[0];

      if (item) {
        const { title, caption, description } = item;

        video.title = title;
        video.caption = caption;
        video.description = description;
      }
    } else if (isMediaButton(component)) {
      const { title, caption, description } = component.value;

      video.title = title;
      video.caption = caption;
      video.description = description;
    } else if (isMediaVideo(component)) {
      const { title, caption, description } = component.value;

      video.title = title;
      video.caption = caption;
      video.description = description;
    }

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.VideoStandard,
      value: video,
    };
  }
}

export function getMediaSynchroVideo(component: MediaComponent) {
  if (isMediaSynchroVideo(component)) {
    return component;
  } else {
    const synchro = new SynchroVideo();

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.SynchroVideo,
      value: synchro,
    };
  }
}

export function getMediaHotspotPlain(component: MediaComponent) {
  if (isMediaHotspotPlain(component) || isMediaHotspot(component) || isMediaHotspot360(component)) {
    return component;
  } else {
    const hotspot = new MediaHotspotPlain();

    if (isMediaImage(component)) {
      const { media } = component.value;

      hotspot.media = media;
    } else if (isMediaSlideshow(component)) {
      const { items } = component.value;
      const item = items[0];

      if (item) {
        const { media } = item;

        hotspot.media = media;
      }
    } else if (isMediaButton(component)) {
      const { out } = component.value;

      hotspot.media = out;
    } else if (isMediaFlipCard(component)) {
      const { recto, verso } = component.value;
      const side = recto.media ? recto : verso;

      hotspot.media = side.media;
    }

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.HotspotPlain,
      value: hotspot,
    };
  }
}

export function getMediaHotspot(component: MediaComponent) {
  if (isMediaHotspot(component)) {
    return component;
  } else {
    const hotspot = new MediaHotspot();

    if (isMediaImage(component)) {
      const { media } = component.value;

      hotspot.media = media;
    } else if (isMediaSlideshow(component)) {
      const { items } = component.value;
      const item = items[0];

      if (item) {
        const { media } = item;

        hotspot.media = media;
      }
    } else if (isMediaButton(component)) {
      const { out } = component.value;

      hotspot.media = out;
    } else if (isMediaFlipCard(component)) {
      const { recto, verso } = component.value;
      const side = recto.media ? recto : verso;

      hotspot.media = side.media;
    } else if (isMediaHotspotPlain(component)) {
      const { media } = component.value;

      hotspot.media = media;
    }

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.Hotspot,
      value: hotspot,
    };
  }
}

export function getMediaHotspot360(component: MediaComponent) {
  if (isMediaHotspot360(component)) {
    return component;
  } else {
    const hotspot = new MediaHotspot360();
    const item = new MediaHotspot();
    item.id = createShortUUID();
    item.name = "360-a";

    hotspot.items.push(item);

    return {
      ...component,
      isEdited: false,
      variant: MediaVariants.Hotspot360,
      value: hotspot,
    };
  }
}

export function isMediaImage(
  component: MediaComponent
): component is MediaComponent & { value: MediaImage } {
  return component.variant === MediaVariants.Image && component.value !== undefined;
}

export function isMediaSlideshow(
  component: MediaComponent
): component is MediaComponent & { value: MediaSlideshow } {
  return component.variant === MediaVariants.Slideshow && component.value !== undefined;
}

export function isMediaButton(
  component: MediaComponent
): component is MediaComponent & { value: MediaButton } {
  return component.variant === MediaVariants.Button && component.value !== undefined;
}

export function isMediaFlipCard(
  component: MediaComponent
): component is MediaComponent & { value: MediaFlipCard } {
  return component.variant === MediaVariants.FlipCard && component.value !== undefined;
}

export function isMediaCustom(
  component: MediaComponent
): component is MediaComponent & { value: MediaCustom } {
  return component.variant === MediaVariants.Custom && component.value !== undefined;
}

export function isMediaTarget(
  component: MediaComponent
): component is MediaComponent & { value: MediaTarget } {
  return component.variant === MediaVariants.Target && component.value !== undefined;
}

export function isMediaVideo(
  component: MediaComponent
): component is MediaComponent & { value: MediaVideo } {
  return component.variant === MediaVariants.Video && component.value !== undefined;
}

export function isMediaExternalVideo(
  component: MediaComponent
): component is MediaComponent & { value: ExternalVideo } {
  return component.variant === MediaVariants.VideoExternal && component.value !== undefined;
}

export function isMediaStandardVideo(
  component: MediaComponent
): component is MediaComponent & { value: StandardVideo } {
  return component.variant === MediaVariants.VideoStandard && component.value !== undefined;
}

export function isMediaSynchroVideo(
  component: MediaComponent
): component is MediaComponent & { value: SynchroVideo } {
  return component.variant === MediaVariants.SynchroVideo && component.value !== undefined;
}

export function isMediaHotspotPlain(
  component: MediaComponent
): component is MediaComponent & { value: MediaHotspotPlain } {
  return component.variant === MediaVariants.HotspotPlain && component.value !== undefined;
}

export function isMediaHotspot(
  component: MediaComponent
): component is MediaComponent & { value: MediaHotspot } {
  return component.variant === MediaVariants.Hotspot && component.value !== undefined;
}

export function isMediaHotspot360(
  component: MediaComponent
): component is MediaComponent & { value: MediaHotspot360 } {
  return component.variant === MediaVariants.Hotspot360 && component.value !== undefined;
}

export function hasSameHotspotItemStyles(hotspot: MediaHotspot) {
  const { items } = hotspot;
  const first = items[0];

  return items.every((item) => item.style === first.style);
}

export function getMediaVariant(variant: MediaVariants) {
  if (variant === MediaVariants.VideoExternal || variant === MediaVariants.VideoStandard) {
    return MediaVariants.Video;
  } else if (variant === MediaVariants.HotspotPlain || variant === MediaVariants.Hotspot360) {
    return MediaVariants.Hotspot;
  } else {
    return variant;
  }
}

export function getMediaTargets(template: ContentTemplate) {
  const { medias, repeater } = template;
  const arr = [...medias, ...getRepeaterComponents(repeater?.medias)];

  return arr.filter((item) => isMediaTarget(item)) as (MediaComponent & {
    value: MediaTarget;
  })[];
}

export function getVideoMarkerTarget(template: ContentTemplate, value: any) {
  const components = template?.medias.filter(
    (media: MediaComponent) => media.variant === MediaVariants.VideoStandard
  );

  const component = components?.find(
    (media: MediaComponent, ind: number) => ind + 1 === parseInt(value.video)
  );

  if (component && isVideoMediaComponent(component)) {
    const marker = component?.value?.main?.marker;

    return marker;
  }
}

export function isYoutube(url: string) {
  const regex =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  var matches = url.match(regex);

  if (matches) {
    return matches[1];
  }

  return false;
}

export function isVimeo(url: string) {
  const regex = /^(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)$/;
  var matches = url.match(regex);

  if (matches) {
    return matches[1];
  }

  return false;
}

export function mediaDuplicateID(values: MediaComponent, element: CourseElement) {
  let value: MediaImage | any = values?.value;
  if (values.variant === MediaVariants.Image) {
    return {
      parent: element?.id,
      action: "duplicate",
      mediatype: "ppimage",
      image: value?.media?.id,
    };
  } else if (values.variant === MediaVariants.Button) {
    return {
      parent: element.id,
      action: "duplicate",
      mediatype: "button",
      icon: value?.icon?.id,
      out: value?.out?.id,
      over: value?.over?.id,
      click: value?.click?.id,
      clickAction: value?.clickAction?.value?.background?.id
        ? `replacebackground-${value?.clickAction?.value?.background?.id}`
        : "",
      overAction: value?.overAction?.value?.background?.id
        ? `replacebackground-${value?.overAction?.value?.background?.id}`
        : "",
    };
  } else if (values.variant === MediaVariants.FlipCard) {
    return {
      parent: element.id,
      action: "duplicate",
      mediatype: "flipcard",
      recto: value?.recto?.media?.id,
      recto_icon: value?.recto?.icon?.id,
      verso: value?.verso?.media?.id,
      verso_icon: value?.verso?.icon?.id,
      clickAction: value?.clickAction?.value?.background?.id
        ? `replacebackground-${value?.clickAction?.value?.background?.id}`
        : "",
      overAction: value?.overAction?.value?.background?.id
        ? `replacebackground-${value?.overAction?.value?.background?.id}`
        : "",
    };
  }
}
export function buttonDuplicateID(values: ButtonComponent, element: CourseElement) {
  let value: ButtonValue | any = values?.value;
  return {
    parent: element.id,
    action: "duplicate",
    mediatype: "regularButton",
    icon: value?.inline?.id,
    clickAction: value?.clickAction?.value?.background?.id
      ? `replacebackground-${value?.clickAction?.value?.background?.id}`
      : "",
    overAction: value?.overAction?.value?.background?.id
      ? `replacebackground-${value?.overAction?.value?.background?.id}`
      : "",
  };
}
export function soundDuplicateID(values: SoundComponent, element: CourseElement) {
  let value: SoundValue = values?.value;
  return {
    parent: element.id,
    action: "duplicate",
    mediatype: "pp_sound",
    sound: value?.media?.id,
    thumbnail:  value?.image?.id,
    marker: value?.media?.marker?.id,
    subtitle: value?.media?.subtitle?.id,
  };
}
