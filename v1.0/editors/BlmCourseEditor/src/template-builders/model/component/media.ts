import {
  MediaComponent,
  MediaConfigJSON,
  MediaFile,
  MediaImage,
  MediaCustom,
  Attributes,
  MediaTarget,
  MediaButton,
  SimpleObject,
  ExternalVideo,
  StandardVideo,
  MediaSlideshow,
  MediaSlideshowItem,
  MediaHotspot,
  MediaHotspotItem,
  MediaHotspotGroupItem,
  MediaHotspotOptionsJSON,
  FlipCardSide,
  MediaFlipCard,
  SynchroVideo,
  MediaTrackCue,
  MediaHotspot360,
  MediaConfigOptions,
} from "types";
import {
  ComponentActionTypes,
  GotoActionTypes,
  HotspotDisplayTypes,
  ImageDisplayTypes,
  MediaCueActions,
  MediaCuePositions,
  MediaPosition,
  MediaVariants,
  Positions,
  StyleListTypes,
} from "editor-constants";
import {
  createShortUUID,
  createUUID,
  filterFalsy,
  getObjectKey,
  getRandomColor,
  isJSON,
  parseTimestamp,
  toBoolean,
  toJSONObject,
  toNumber,
} from "utils";
import {
  createMediaConfig,
  createMediaFormat,
  getAllBLMElementsBy,
  getAllHTMLElements,
  getBLMElement,
  getBLMElementBy,
  getHTMLElement,
  setComponentBy,
} from "../../core";
import { GlTemplateBuilderStore } from "../../store";
import { createAction, createComponentStyle, getComponentStyle } from "./common";

export function getAllMediaComponent(parent: HTMLElement, selector: string, repeaterId?: string) {
  const elements = getAllHTMLElements(parent, selector);
  const medias = [];

  for (let element of elements) {
    const media = createMedia(element);
    media.repeaterId = repeaterId;

    medias.push(media);
  }

  return medias;
}

function createMedia(element: HTMLElement) {
  const media = new MediaComponent();
  const model = getBLMElement<MediaConfigJSON>(element);
  const { attributes, options, editorOptions } = model;
  const options2 = toJSONObject<MediaConfigOptions>(element.getAttribute("blm-options2"));

  setComponentBy(media, model);

  media.classList = Array.from(element.classList);

  if (attributes) {
    media.variant = attributes["blm-media"] as MediaVariants;
    media.hasApplyStyle = attributes["unapplystyle"] === undefined;
  }

  if (options) {
    media.options = options;
    media.config = createMediaConfig(options, media.variant);
  }

  if (options2) {
    media.options2 = options2;
  }

  media.format = createMediaFormat(
    Array.from(element.classList),
    element.style,
    media.config?.format
  );

  if (media.variant === MediaVariants.Image) {
    media.value = createImage(element);
  } else if (media.variant === MediaVariants.Slideshow) {
    media.value = createSlideshow(element);
  } else if (media.variant === MediaVariants.Button) {
    media.value = createButton(element);
  } else if (media.variant === MediaVariants.FlipCard) {
    media.value = createFlipCard(element);
  } else if (media.variant === MediaVariants.Custom) {
    media.value = createCustom(editorOptions as MediaFile);
  } else if (media.variant === MediaVariants.Target && attributes) {
    media.value = createTarget(attributes);
  } else if (media.variant === MediaVariants.VideoExternal) {
    media.value = createExternalVideo(element, media);
  } else if (media.variant === MediaVariants.VideoStandard) {
    media.value = createStandardVideo(element, media);
  } else if (media.variant === MediaVariants.SynchroVideo) {
    media.value = createSynchroVideo(element, media);
  } else if (media.variant === MediaVariants.Hotspot) {
    media.value = createHotspot(element);
  } else if (media.variant === MediaVariants.Hotspot360) {
    media.value = createHotspot360(element);
  }

  return media;
}

function createImage(element: HTMLElement) {
  const image = new MediaImage();
  const model = getBLMElementBy<object, { media?: MediaFile } | MediaFile>(
    element,
    ".mediawrapper"
  );
  const { editorOptions } = model || {};
  const title = getHTMLElement(element, ".captionwrapper .title");
  const desc = getHTMLElement(element, ".captionwrapper .description");
  const caption = getHTMLElement(element, ".captionwrapper .caption");

  if (editorOptions && "media" in editorOptions) {
    image.media = editorOptions.media;
  } else {
    //todo: need to remove legacy condition after some time
    image.media = (model?.editorOptions as MediaFile) || undefined;
  }

  image.title = title?.textContent || "";
  image.description = desc?.textContent || "";
  image.caption = caption?.textContent || "";
  image.option = getObjectKey(ImageDisplayTypes, element.classList, image.option);
  image.style = createComponentStyle(element, StyleListTypes.MediaImage, true);
  image.position = getObjectKey(MediaPosition, element.classList, image.position);
  image.isZoom = element.hasAttribute("zoomonclick");

  return image;
}

function createSlideshow(element: HTMLElement) {
  const slideshow = new MediaSlideshow();
  const wrappers = getAllHTMLElements(element, ".mediawrapper");

  slideshow.items = wrappers.map((wrapper) => {
    const item = new MediaSlideshowItem();
    const model = getBLMElement<object, { media?: MediaFile } | MediaFile>(wrapper);
    const { editorOptions } = model || {};
    const title = getHTMLElement(wrapper, ".captionwrapper .title");
    const desc = getHTMLElement(wrapper, ".captionwrapper .description");
    const caption = getHTMLElement(wrapper, ".captionwrapper .caption");
    const option = getObjectKey(ImageDisplayTypes, wrapper.classList, item.option);
    const action = toJSONObject<{
      onClick?: SimpleObject;
    }>(wrapper.getAttribute("blm-action"));
    const position = getObjectKey(MediaPosition, wrapper.classList, item.position);

    item.id = createUUID();

    if (editorOptions && "media" in editorOptions) {
      item.media = editorOptions?.media;
    } else {
      //todo: remove legacy condition
      item.media = (editorOptions as MediaFile) || undefined;
    }

    item.title = title?.textContent || "";
    item.description = desc?.innerHTML || "";
    item.caption = caption?.textContent || "";
    item.option = option;
    item.clickAction = createAction("click", action?.onClick);
    item.position = position;

    return item;
  });

  slideshow.style = getComponentStyle(element, StyleListTypes.MediaSlideshow);
  slideshow.slideStyle = createComponentStyle(
    element,
    StyleListTypes.MediaSlideshowItem,
    true,
    ".splide__slide"
  );

  return slideshow;
}

function createButton(element: HTMLElement) {
  const button = new MediaButton();
  const model = getBLMElementBy<
    object,
    Record<"out" | "over" | "click" | "icon", MediaFile | undefined>
  >(element, ".mediabuttonwrapper");
  const { editorOptions } = model || {};
  const legacyModel = getBLMElementBy<
    object,
    Record<"out" | "over" | "click" | "icon", MediaFile | undefined>
  >(element, ".mediawrapper"); //todo: it is for legacy buttons, need to remove this after some time.
  const label = getHTMLElement(element, ".optionwrapper .label");
  const duration = getHTMLElement(element, ".optionwrapper .duration");
  const num = getHTMLElement(element, ".captionwrapper .number");
  const title = getHTMLElement(element, ".captionwrapper .title");
  const desc = getHTMLElement(element, ".captionwrapper .description");
  const caption = getHTMLElement(element, ".captionwrapper .caption");
  const action = toJSONObject<{
    onClick?: SimpleObject;
    onRollOver?: SimpleObject;
  }>(element.getAttribute("blm-action"));

  if (
    action &&
    action.onClick &&
    action.onClick.action === ComponentActionTypes.Goto &&
    Object.values(GotoActionTypes).includes(action.onClick.option)
  ) {
    action.onClick.action = ComponentActionTypes.Navigation;
  }

  button.out = editorOptions?.out ?? legacyModel?.editorOptions?.out;
  button.over = editorOptions?.over ?? legacyModel?.editorOptions?.over;
  button.click = editorOptions?.click ?? legacyModel?.editorOptions?.click;
  button.icon = editorOptions?.icon ?? legacyModel?.editorOptions?.icon;
  button.title = title?.textContent || "";
  button.description = desc?.textContent || "";
  button.caption = caption?.textContent || "";
  button.label = label?.textContent || "";
  button.number = num?.textContent || "";
  button.duration = duration?.textContent || "";
  button.option = getObjectKey(ImageDisplayTypes, element.classList, button.option);
  button.clickAction = createAction("click", action?.onClick);
  button.overAction = createAction("over", action?.onRollOver);
  button.position = getObjectKey(MediaPosition, element.classList, button.position);
  button.style = createComponentStyle(
    element,
    GlTemplateBuilderStore.getTemplate()?.isSummary
      ? StyleListTypes.MediaButtonSummary
      : StyleListTypes.MediaButton,
    true
  );

  return button;
}

function createFlipCard(element: HTMLElement) {
  const flipcard = new MediaFlipCard();
  const recto = getHTMLElement(element, ".flipcardfrontwrapper");
  const verso = getHTMLElement(element, ".flipcardbackwrapper");
  const action = toJSONObject<{
    onFlip?: SimpleObject;
    onClick?: SimpleObject;
    onRollOver?: SimpleObject;
  }>(element.getAttribute("blm-action"));

  if (
    action &&
    action.onClick &&
    action.onClick.action === ComponentActionTypes.Goto &&
    Object.values(GotoActionTypes).includes(action.onClick.option)
  ) {
    action.onClick.action = ComponentActionTypes.Navigation;
  }

  flipcard.recto = createFlipCardSide(recto, true);
  flipcard.verso = createFlipCardSide(verso, false);
  flipcard.flipAction = action?.onFlip?.action === "mouseover";
  flipcard.clickAction = createAction("click", action?.onClick);
  flipcard.overAction = createAction("over", action?.onRollOver);

  return flipcard;
}

function createFlipCardSide(element?: HTMLElement | null, isRecto = true) {
  const side = new FlipCardSide();

  if (element) {
    const model = getBLMElement<object, Record<"media" | "icon", MediaFile | undefined>>(element);
    const { editorOptions } = model;
    const label = getHTMLElement(element, ".optionwrapper .label");
    const duration = getHTMLElement(element, ".optionwrapper .duration");
    const num = getHTMLElement(element, ".captionwrapper .number");
    const title = getHTMLElement(element, ".captionwrapper .title");
    const desc = getHTMLElement(element, ".captionwrapper .description");
    const caption = getHTMLElement(element, ".captionwrapper .caption");

    side.media = editorOptions?.media;
    side.icon = editorOptions?.icon;
    side.title = title?.textContent || "";
    side.description = desc?.textContent || "";
    side.caption = caption?.textContent || "";
    side.label = label?.textContent || "";
    side.number = num?.textContent || "";
    side.duration = duration?.textContent || "";
    side.option = getObjectKey(ImageDisplayTypes, element.classList, side.option);
    side.style = createComponentStyle(
      element,
      isRecto ? StyleListTypes.MediaFlipCardRecto : StyleListTypes.MediaFlipCardVerso,
      true
    );
    side.position = getObjectKey(MediaPosition, element.classList, side.position);
  }

  return side;
}

function createCustom(editorOptions?: { media?: MediaFile } | MediaFile) {
  const custom = new MediaCustom();

  if (editorOptions && "media" in editorOptions) {
    custom.media = editorOptions.media;
  } else {
    //todo: remove legacy condition
    custom.media = (editorOptions as MediaFile) ?? undefined;
  }

  return custom;
}

function createTarget(attributes: Attributes) {
  const target = new MediaTarget();
  const str = attributes["blm-target"];

  if (str && str !== "") {
    const obj = JSON.parse(str);

    if (obj) {
      target.name = obj.name;
      target.template = obj.default;
      target.transition = obj.transition;
      target.background = obj.target_background ?? target.background;
    }
  }

  return target;
}

function createExternalVideo(element: HTMLElement, component: MediaComponent) {
  const video = new ExternalVideo();
  const { options } = component;
  const iframe = getHTMLElement(element, "iframe");

  if (iframe) {
    const model = getBLMElement<object, { url: string; thumbnail: string }>(iframe);
    const media = model?.editorOptions;

    video.url = media?.url || "";
    video.thumbnail = media?.thumbnail || undefined;
  }

  if (options?.parameters && "id" in options.parameters) {
    video.id = options.parameters.id || undefined;
    video.server = options.parameters.server || undefined;
  }

  return video;
}

function createStandardVideo(element: HTMLElement, component: MediaComponent) {
  const video = new StandardVideo();
  const { options } = component;
  const model = getBLMElementBy<
    object,
    Pick<StandardVideo, "main" | "webm" | "image"> &
      Record<"subtitle" | "marker", MediaFile | undefined>
  >(element, ".mediawrapper");
  const media = model?.editorOptions;
  const title = getHTMLElement(element, ".captionwrapper .title");
  const desc = getHTMLElement(element, ".captionwrapper .description");
  const caption = getHTMLElement(element, ".captionwrapper .caption");

  video.main = media?.main;
  video.webm = media?.webm;
  video.image = media?.image;

  video.title = title?.textContent || "";
  video.description = desc?.textContent || "";
  video.caption = caption?.textContent || "";
  video.option = getObjectKey(ImageDisplayTypes, element.classList, video.option);
  video.style = createComponentStyle(element, StyleListTypes.MediaVideo);

  if (video.main && media?.subtitle && media?.marker) {
    //For legacy code, we can remove after some times
    video.main.subtitle = media.subtitle;
    video.main.marker = media.marker;
  }

  if (options?.parameters && "autostart" in options.parameters) {
    video.autoPlay = options.parameters.autostart || false;
    video.loop = options.parameters.loop || false;
  }

  return video;
}

function createSynchroVideo(element: HTMLElement, component: MediaComponent) {
  const synchro = new SynchroVideo();
  const model = getBLMElementBy<object, Pick<SynchroVideo, "main" | "webm">>(
    element,
    ".mediawrapper"
  );
  const lblModels = getAllBLMElementsBy<Record<"start" | "stop" | "position", string>>(
    element,
    ".mediawrapper .labels div"
  );
  const actions = toJSONObject<[Record<"action" | "content" | "start" | "stop", string>]>(
    element.getAttribute("blm-action")
  );
  const media = model?.editorOptions;
  const { main, webm } = media ?? {};
  const isLottie = main && isJSON(main.type);

  synchro.main = main;
  synchro.webm = webm;

  if (lblModels) {
    synchro.labels = filterFalsy(
      lblModels.map((item) => {
        const { options, innerHTML } = item;

        if (options) {
          const { start, stop, position } = options;
          const [startTime, endTime] = isLottie
            ? [toNumber(start), toNumber(stop)]
            : [parseTimestamp(start), parseTimestamp(stop)];

          const cue = new MediaTrackCue(startTime, endTime, innerHTML);
          cue.position = position as MediaCuePositions;

          return cue;
        }

        return undefined;
      })
    );
  }

  if (actions) {
    synchro.contents = actions.map((item) => {
      const { action, content, start, stop } = item;
      const startTime = isLottie ? toNumber(start) : parseTimestamp(start);
      const endTime = stop ? (isLottie ? toNumber(stop) : parseTimestamp(stop)) : NaN;
      const cue = new MediaTrackCue(startTime, endTime);

      cue.action = action as MediaCueActions;
      cue.content = content as MediaCuePositions;

      return cue;
    });
  }

  return synchro;
}

function createHotspot(element: HTMLElement) {
  const hotspot = new MediaHotspot();
  const model = getBLMElementBy<object, { media?: MediaFile; style?: string } | MediaFile>(
    element,
    ".mediawrapper"
  );
  const imgModel = getBLMElementBy<MediaHotspotOptionsJSON>(element, ".mediawrapper .imagewrapper");
  const groupsWrapper = getHTMLElement(element, ".hotspotgroupwrapper");
  const hotspots = getAllHTMLElements(element, ".mediawrapper .imagewrapper .hotspot");
  const { editorOptions } = model || {};

  hotspot.prerequisite = imgModel?.options?.prerequisite || false;
  if (editorOptions && "media" in editorOptions) {
    hotspot.media = editorOptions?.media || undefined;
    hotspot.style = editorOptions?.style;
  } else {
    //todo: remvoe legacy condition
    hotspot.media = (editorOptions as MediaFile) || undefined;
  }
  hotspot.display.type = getObjectKey(HotspotDisplayTypes, element.classList, hotspot.display.type);

  if (hotspot.display.type === HotspotDisplayTypes.PanAndZoom) {
    hotspot.display.centerImage = imgModel?.options?.centeronclick ?? true;
    hotspot.display.allowZoom = imgModel?.options?.allowzoom ?? true;
    hotspot.display.miniView = imgModel?.options?.miniview ?? false;
  }

  if (groupsWrapper) {
    const groups = getAllHTMLElements(groupsWrapper, "div");

    hotspot.groups.enabled = true;
    hotspot.groups.style = getComponentStyle(groupsWrapper, StyleListTypes.MediaHotspotGroup);
    hotspot.groups.items = groups.map((wrapper) => {
      const id = wrapper.getAttribute("blm-group-id") || createShortUUID();
      const name = wrapper.innerHTML;
      const color = wrapper.getAttribute("blm-group-color") || getRandomColor();

      return new MediaHotspotGroupItem(id, name, color);
    });
  }

  hotspot.items = hotspots.map((wrapper: HTMLElement) => {
    const item = new MediaHotspotItem();
    const itemModel = getBLMElement<object, { media?: MediaFile }>(wrapper);
    const action = toJSONObject<{
      onClick?: SimpleObject;
      onRollOver?: SimpleObject;
    }>(wrapper.getAttribute("blm-action"));

    item.id = createShortUUID();
    item.x = toNumber(wrapper.style.getPropertyValue("--hotspot_left"));
    item.y = toNumber(wrapper.style.getPropertyValue("--hotspot_top"));
    item.name = getHTMLElement(wrapper, ".hotspotlabel span")?.innerHTML || "";
    item.style = getComponentStyle(
      wrapper,
      GlTemplateBuilderStore.getTemplate()?.isSummary
        ? StyleListTypes.MediaHotspotItemSummary
        : StyleListTypes.MediaHotspotItem
    );
    item.groupId = wrapper.getAttribute("blm-group") || item.groupId;
    item.media = itemModel.editorOptions?.media;
    item.position = (wrapper.getAttribute("blm-position") as Positions) || item.position;
    item.size = toNumber(wrapper.getAttribute("blm-size") || "1");
    item.hasDark = !wrapper.classList.contains("light");
    item.callToAction = toBoolean(wrapper.getAttribute("blm-calltoaction"));
    item.clickAction = createAction("click", action?.onClick, wrapper);
    item.overAction = createAction("over", action?.onRollOver, wrapper);

    return item;
  });

  return hotspot;
}

function createHotspot360(element: HTMLElement) {
  const hotspot360 = new MediaHotspot360();
  const elements = getAllHTMLElements(element, ".tab360");

  hotspot360.items = elements.map((element, i) => {
    const hotspot = new MediaHotspot();
    const model = getBLMElement<{ prerequisite: boolean }, { media?: MediaFile; style?: string }>(
      element
    );
    const groupsWrapper = getHTMLElement(element, ".hotspotgroupwrapper");
    const hotspots = getAllHTMLElements(element, ".hotspot");
    const { options, editorOptions } = model;

    hotspot.id = element.getAttribute("id") ?? createShortUUID();
    hotspot.name =
      getHTMLElement(element, ".tabname")?.textContent ??
      "360-" + String.fromCharCode(((i + 1) % 26) + 64).toLowerCase();
    hotspot.prerequisite = options?.prerequisite ?? false;
    hotspot.media = editorOptions?.media;
    hotspot.style = editorOptions?.style;

    if (groupsWrapper) {
      const groups = getAllHTMLElements(groupsWrapper, "div");

      hotspot.groups.enabled = true;
      hotspot.groups.style = getComponentStyle(groupsWrapper, StyleListTypes.MediaHotspotGroup);
      hotspot.groups.items = groups.map((wrapper) => {
        const id = wrapper.getAttribute("blm-group-id") || createShortUUID();
        const name = wrapper.innerHTML;
        const color = wrapper.getAttribute("blm-group-color") || getRandomColor();

        return new MediaHotspotGroupItem(id, name, color);
      });
    }

    hotspot.items = hotspots.map((wrapper) => {
      const item = new MediaHotspotItem();
      const itemModel = getBLMElement<
        { position: { x: number; y: number; z: number } },
        { media?: MediaFile }
      >(wrapper);
      const action = toJSONObject<{
        onClick?: SimpleObject;
        onRollOver?: SimpleObject;
      }>(wrapper.getAttribute("blm-action"));

      item.id = createShortUUID();
      item.x = itemModel.options?.position.x ?? 0;
      item.y = itemModel.options?.position.y ?? 0;
      item.z = itemModel.options?.position.z ?? 0;
      item.name = getHTMLElement(wrapper, ".hotspotlabel span")?.innerHTML || "";
      item.style = getComponentStyle(wrapper, StyleListTypes.MediaHotspotItem360);
      item.groupId = wrapper.getAttribute("blm-group") || item.groupId;
      item.media = itemModel.editorOptions?.media;
      item.hasDark = !wrapper.classList.contains("light");
      item.callToAction = toBoolean(wrapper.getAttribute("blm-calltoaction"));
      item.clickAction = createAction("click", action?.onClick, wrapper);
      item.overAction = createAction("over", action?.onRollOver, wrapper);

      return item;
    });

    return hotspot;
  });

  return hotspot360;
}
