import clsx from "clsx";

import {
  Attributes,
  ClassAttribute,
  BLMElement,
  StyleAttribute,
  ExternalVideo,
  MediaButton,
  MediaComponent,
  MediaConfigJSON,
  MediaHotspot,
  MediaImage,
  MediaSlideshow,
  StandardVideo,
  MediaFlipCard,
  FlipCardSide,
  SynchroVideo,
  MediaHotspot360,
} from "types";
import {
  MediaFormats,
  ImageDisplayTypes,
  MediaVariants,
  StyleListTypes,
  HotspotDisplayTypes,
  MediaCueActions,
  MediaPosition,
} from "editor-constants";
import {
  isMediaImage,
  isMediaCustom,
  isMediaTarget,
  valueToUnit,
  isMediaButton,
  isMediaStandardVideo,
  isMediaExternalVideo,
  isMediaSlideshow,
  isMediaHotspot,
  findObject,
  createStyleStrFromObj,
  isMediaFlipCard,
  isTooltipAction,
  isMediaSynchroVideo,
  formatFullTime,
  isJSON,
  isMediaHotspot360,
  stringifyAttr,
} from "utils";
import { setBLMElement } from "../../core";
import { createAction, getComponentClassNames, getStyleClassNames, getTintStyles } from "./common";

export function setMediaComponent(element: HTMLElement, media: MediaComponent) {
  const model = createMedia(media);

  setBLMElement(element, model);
  setMediaHTML(element, media);
}

function createMedia(component: MediaComponent) {
  const { variant, options, format, isDeactivated } = component;
  const model = new BLMElement<MediaConfigJSON>();
  const attrs = new Attributes();
  const classAttr = new ClassAttribute();
  const styleAttr = new StyleAttribute();
  const clsNames = getComponentClassNames([
    StyleListTypes.MediaImage,
    StyleListTypes.MediaSlideshow,
    StyleListTypes.MediaSlideshowItem,
    StyleListTypes.MediaButton,
    StyleListTypes.MediaButtonSummary,
    StyleListTypes.MediaVideo,
  ]);

  if (options?.parameters) {
    const { parameters, ...rest } = options;

    model.options = rest;
  }

  model.isDeactivated = isDeactivated;
  model.editorOptions = null;

  attrs.removables = ["zoomonclick", "blm-custom", "blm-target", "blm-action"];

  classAttr.items = format.value ? [format.value] : [];

  classAttr.removables = [
    ...Object.values(MediaVariants).map(getVariantClsNames).flat(),
    ...Object.values(ImageDisplayTypes),
    ...Object.values(MediaFormats),
    ...Object.values(HotspotDisplayTypes),
    ...Object.values(MediaPosition),
    ...clsNames,
    "light",
    "dark",
    "lightover",
    "darkover",
    "darkout",
    "autoflip",
    "blmshadow",
    "vertical",
    "horizontal",
  ];
  styleAttr.removables = [
    "width",
    "height",
    "--blm_tint_color",
    "--blm_tint_opacity",
    "--blm_undertext_color",
    "--blm_undertext_opacity",
    "--tintout",
    "--opacityout",
    "--tintover",
    "--opacityover",
  ];

  if (format.value === MediaFormats.FixedWidth || format.value === MediaFormats.FixedSize) {
    styleAttr.width = valueToUnit(format.width || format.defaultWidth);
  }

  if (format.value === MediaFormats.FixedHeight || format.value === MediaFormats.FixedSize) {
    styleAttr.height = valueToUnit(format.height || format.defaultHeight);
  }

  if (variant) {
    attrs["blm-media"] = variant;

    if (variant !== MediaVariants.Video) {
      classAttr.items.push(...getVariantClsNames(variant));
    }

    if (isMediaImage(component)) {
      const {
        value: { isZoom, option, style, position },
      } = component;

      if (isZoom) {
        attrs.zoomonclick = "";
      }

      if (option) {
        classAttr.items.push(option);
      }

      if (position) {
        classAttr.items.push(position);
      }

      if (style) {
        classAttr.items.push(...getStyleClassNames(style, "media-image"));
        Object.assign(styleAttr, getTintStyles(style));
      }
    } else if (isMediaSlideshow(component)) {
      const {
        value: { style, slideStyle },
      } = component;

      if (style) {
        classAttr.items.push(style);
      }

      classAttr.items.push(...getStyleClassNames(slideStyle));
    } else if (isMediaButton(component)) {
      const {
        value: { option, clickAction, overAction, style, position },
      } = component;
      const onClick = createAction(clickAction, "click");
      const onRollOver = createAction(overAction, "over");

      if (onClick || onRollOver) {
        attrs["blm-action"] = JSON.stringify({
          onClick,
          onRollOver,
        });
      }

      if (option) {
        classAttr.items.push(option);
      }

      if (position) {
        classAttr.items.push(position);
      }

      if (style) {
        classAttr.items.push(...getStyleClassNames(style, "media-button"));
        Object.assign(styleAttr, getTintStyles(style));
      }
    } else if (isMediaFlipCard(component)) {
      const {
        value: { flipAction, clickAction, overAction },
      } = component;
      const onFlip = { action: flipAction ? "mouseover" : "click" };
      const onClick = createAction(clickAction, "click");
      const onRollOver = createAction(overAction, "over");

      if (onFlip || onClick || onRollOver) {
        attrs["blm-action"] = JSON.stringify({ onFlip, onClick, onRollOver });
      }

      if (flipAction) {
        classAttr.items.push("autoflip");
      }
    } else if (isMediaCustom(component)) {
      const {
        value: { media },
      } = component;

      if (media) {
        attrs["blm-custom"] = media.url + "/" + media.rootFile;
        model.editorOptions = { media };
      }
    } else if (isMediaTarget(component)) {
      const {
        value: { name, template, transition, background },
      } = component;

      attrs["blm-target"] = JSON.stringify({
        name,
        default: template,
        transition,
        target_background: background,
      });
    } else if (isMediaExternalVideo(component)) {
      const {
        value: { id, server },
      } = component;

      if (options && id && server) {
        model.options = { ...options, parameters: { id, server } };
      }
    } else if (isMediaStandardVideo(component)) {
      const {
        value: { autoPlay, loop, option, style },
      } = component;

      if (options) {
        model.options = { ...options, parameters: { autostart: autoPlay, loop } };
      }

      if (option) {
        classAttr.items.push(option);
      }

      if (style) {
        classAttr.items.push(...getStyleClassNames(style, "media-video"));
      }
    } else if (isMediaSynchroVideo(component)) {
      const {
        value: { main, contents },
      } = component;
      const isLottie = main && isJSON(main.type);
      const actions = contents?.map((item) => {
        const { startTime, endTime, content, action } = item;
        const start = isLottie ? startTime.toFixed(3) : formatFullTime(startTime);
        const stop =
          action === MediaCueActions.ScrollVPauseC
            ? isLottie
              ? endTime.toFixed(3)
              : formatFullTime(endTime)
            : undefined;

        return { content, action, start, stop };
      });

      if (actions) {
        attrs["blm-action"] = JSON.stringify(actions);
      }
    } else if (isMediaHotspot(component)) {
      const {
        value: { display },
      } = component;

      classAttr.items.push(display.type);
    } else if (isMediaHotspot360(component)) {
      if (component.options2) {
        const blmOptions2 = JSON.stringify(component.options2);
        attrs["blm-options2"] = blmOptions2;
      }
    }
  }

  model.attributes = attrs;
  model.classAttr = classAttr;
  model.styleAttr = styleAttr;

  return model;
}

function getVariantClsNames(variant: MediaVariants) {
  if (variant === MediaVariants.Slideshow) {
    return ["slideshow", "splide"];
  } else if (variant === MediaVariants.Button) {
    return ["buttonmedia"];
  } else if (variant === MediaVariants.VideoExternal) {
    return ["videoexternal"];
  } else if (variant === MediaVariants.VideoStandard) {
    return ["videostandard"];
  } else if (variant === MediaVariants.SynchroVideo) {
    return ["synchromedia"];
  } else {
    return [variant];
  }
}

function setMediaHTML(element: HTMLElement, component: MediaComponent) {
  const { variant } = component;

  if (isMediaImage(component)) {
    setImageHTML(element, component.value);
  } else if (isMediaSlideshow(component)) {
    setSlideshowHTML(element, component.value);
  } else if (isMediaButton(component)) {
    setButtonHTML(element, component.value);
  } else if (isMediaFlipCard(component)) {
    setFlipCardHTML(element, component.value);
  } else if (isMediaCustom(component) || isMediaTarget(component)) {
    element.innerHTML = "";
  } else if (isMediaExternalVideo(component)) {
    setExternalVideoHTML(element, component.value);
  } else if (isMediaStandardVideo(component)) {
    setStandardVideoHTML(element, component.value);
  } else if (isMediaSynchroVideo(component)) {
    setSynchroVideoHTML(element, component.value);
  } else if (isMediaHotspot(component)) {
    setHotspotHTML(element, component.value);
  } else if (isMediaHotspot360(component)) {
    setHotspot360HTML(element, component.value);
  } else if (variant) {
    element.innerHTML = `
        <img src=""></img>
      `;
  }
}

function setImageHTML(element: HTMLElement, component: MediaImage) {
  if (component) {
    const { title, description, caption, media } = component;
    const options = media && { media };

    element.innerHTML = `
        <div class="mediawrapper" ${
          options ? `blm-editor-options='${JSON.stringify(options)}'` : ""
        }>
          <img src="${media?.url || ""}"/>
          <div class="mediastyletint"></div>
          <div class="captionwrapper">
            <div class="title">${title}</div>
            <div class="description">${description}</div>
            <div class="caption">${caption}</div>
          </div>
      </div>
    `;
  }
}

function setSlideshowHTML(element: HTMLElement, component: MediaSlideshow) {
  if (component) {
    const { items, slideStyle } = component;
    const styles = getTintStyles(slideStyle);
    const stylesStr =
      Object.keys(styles).length > 0 ? `style='${createStyleStrFromObj(styles)}'` : "";

    element.innerHTML = `
        <div class="splide__track">
          <div class="splide__list">${items
            .map((item) => {
              const { media, title, description, caption, option, clickAction, position } = item;
              const onClick = createAction(clickAction, "click");
              const options = media && { media };

              return `
              <div class="mediawrapper splide__slide ${option} ${position}" ${
                options ? `blm-editor-options='${JSON.stringify(options)}'` : ""
              } ${
                onClick
                  ? `blm-action='${JSON.stringify({
                      onClick,
                    })}'`
                  : ""
              } ${stylesStr}>
                <img src="${media?.url || ""}">
                <div class="mediastyletint"></div>
                <div class="captionwrapper">
                  <div class="title">${title}</div>
                  <div class="description">${description}</div>
                  <div class="caption">${caption}</div>
                </div>
              </div>`;
            })
            .join("")}
            </div>
        </div>
    `;
  }
}

function setButtonHTML(element: HTMLElement, component: MediaButton) {
  if (component) {
    const { out, over, click, icon, label, number, duration, title, description, caption } =
      component;
    const options = (out || over || click || icon) && { out, over, click, icon };

    element.innerHTML = `
    <div class="mediabuttonwrapper" ${
      options ? `blm-editor-options='${JSON.stringify(options)}'` : ""
    }>
      <div class="mediawrapper">
        <img src="${out?.url || ""}" src-over="${(over || out)?.url || ""}" src-click="${
      (click || out)?.url || ""
    }"/>
        <div class="mediastyletint"></div>
      </div>
      <div class="optionwrapper">
        <div class="iconlabelwrapper">
          <div class="icon"><img src="${icon?.url || ""}"/></div>
          <div class="label">${label}</div>
        </div>        
        <div class="duration">${duration}</div>
      </div>
      <div class="captionwrapper">
        <div class="number">${number}</div>
        <div class="title">${title}</div>
        <div class="descriptionwrapper">
          <div class="description">${description}</div>
        </div>
        <div class="caption">${caption}</div>
      </div>
    </div>
  `;
  }
}

function setFlipCardHTML(element: HTMLElement, component: MediaFlipCard) {
  if (component) {
    const { recto, verso } = component;

    element.innerHTML = `
    <div class="flipcardwrapper">     
        ${createFlipCardSideHTML(verso, false)}
        ${createFlipCardSideHTML(recto, true)}
    </div>
  `;
  }
}

function createFlipCardSideHTML(side: FlipCardSide, isRecto = true) {
  const {
    media,
    icon,
    title,
    description,
    caption,
    label,
    duration,
    number,
    style,
    option,
    position,
  } = side;
  const options = (media || icon) && { media, icon };
  const styles = getTintStyles(style);
  const stylesStr =
    Object.keys(styles).length > 0 ? `style='${createStyleStrFromObj(styles)}'` : "";

  return ` <div class="${clsx(
    isRecto ? "flipcardfrontwrapper card-front" : "flipcardbackwrapper card-back",
    option,
    position,
    getStyleClassNames(style)
  )}" ${stylesStr} ${options ? `blm-editor-options='${JSON.stringify(options)}'` : ""} >
    <div class="mediawrapper">
      <img src="${media?.url || ""}"/>
      <div class="mediastyletint"></div>
    </div>
    <div class="optionwrapper">
      <div class="iconlabelwrapper">
        <div class="icon"><img src="${icon?.url || ""}"/></div>
        <div class="label">${label}</div>
      </div>        
      <div class="duration">${duration}</div>
    </div>
    <div class="captionwrapper">
      <div class="number">${number}</div>
      <div class="title">${title}</div>
      <div class="descriptionwrapper">
        <div class="description">${description}</div>
      </div>
      <div class="caption">${caption}</div>
    </div>
  </div>`;
}

function setExternalVideoHTML(element: HTMLElement, component: ExternalVideo) {
  if (component) {
    const { id, url, thumbnail, server } = component;

    if (id) {
      const [title, src] =
        server === "youtube"
          ? ["Youtube", `https://www.youtube.com/embed/${id}`]
          : ["Vimeo", `https://player.vimeo.com/video/${id}`];

      element.innerHTML = `
      <iframe  src="${src}" title="${title} video player" blm-editor-options='${JSON.stringify({
        url,
        thumbnail,
      })}' width="100%" height="100%" frameborder="0" allowfullscreen allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" >
      </iframe>
    `;
    }
  }
}

function setStandardVideoHTML(element: HTMLElement, component: StandardVideo) {
  if (component) {
    const { main, webm, image, title, description, caption, autoPlay, loop } = component;
    const options = (main || webm || image) && { main, webm, image };

    element.innerHTML = `
    <div class="mediawrapper" ${options ? `blm-editor-options='${JSON.stringify(options)}'` : ""}>
      <video controls ${autoPlay ? "autoplay" : ""} ${loop ? "loop" : ""} ${
      image ? `poster="${image.url}"` : ""
    }>${main ? `\n\t<source src="${main.url}" type="video/mp4" />` : ""}${
      webm ? `\n\t<source src="${webm.url}" type="video/webm" />` : ""
    }
    ${
      main?.subtitle
        ? `\n\t<track label="english" kind="subtitles" srclang="en" src="${main.subtitle.url}" default/>`
        : ""
    }${
      main?.marker
        ? `\n\t<track label="english" kind="chapters" srclang="en" src="${main.marker.url}"/>`
        : ""
    }        
        Your browser does not support the video tag.
      </video>
      <div class="captionwrapper">
        <div class="title">${title}</div>
        <div class="description">${description}</div>
        <div class="caption">${caption}</div>
      </div>
    </div>
  `;
  }
}

function setSynchroVideoHTML(element: HTMLElement, component: SynchroVideo) {
  if (component) {
    const { main, webm, labels } = component;
    const isLottie = main ? isJSON(main.type) : false;
    const options = (main || webm) && { main, webm: isLottie ? undefined : webm };

    element.innerHTML = `
    <div class="mediawrapper" ${options ? `blm-editor-options='${JSON.stringify(options)}'` : ""}>
      ${
        isLottie
          ? `<div source ="${main!.url}" type="video/lottie" ></div>`
          : `<video controls>${main ? `\n\t<source src="${main.url}" type="video/mp4" />` : ""}${
              webm ? `\n\t<source src="${webm.url}" type="video/webm" />` : ""
            }         
        Your browser does not support the video tag.
      </video>`
      }
      <div class="labels">
        ${labels?.map((item, ind) => {
          const { startTime, endTime, text, position } = item;
          const [start, stop] = isLottie
            ? [startTime.toFixed(3), endTime.toFixed(3)]
            : [formatFullTime(startTime), formatFullTime(endTime)];

          const obj = {
            start,
            stop,
            position,
          };

          return `<div lbl-id="${ind + 1}" blm-options='${JSON.stringify(obj)}'>${text}</div>`;
        })}
      </div> 
    </div>
  `;
  }
}

function setHotspotHTML(element: HTMLElement, component: MediaHotspot) {
  if (component) {
    const { media, items, groups, display, style, prerequisite } = component;
    const { type, centerImage, allowZoom, miniView } = display;
    const displayOptions =
      type === HotspotDisplayTypes.PanAndZoom
        ? { centeronclick: centerImage, allowzoom: allowZoom, miniview: miniView }
        : undefined;
    const options = { prerequisite, ...displayOptions };
    const editorOptions = (media || style) && { media, style };

    element.innerHTML = `${
      groups.enabled
        ? `
        <div class="${clsx("hotspotgroupwrapper", groups.style)}">${groups.items
            .map((item, ind) => {
              const { color, name } = item;

              return `
            <div blm-role="hotspotgroup" blm-group-id="${
              ind + 1
            }" blm-group-color="${color}">${name}</div>`;
            })
            .join("")}
        </div>`
        : ""
    }    
        <div class="mediawrapper" ${
          editorOptions ? `blm-editor-options='${JSON.stringify(editorOptions)}'` : ""
        }>
          <div class="imagewrapper" blm-options='${JSON.stringify(options)}'>
            <img src="${media?.url || ""}"/>${items
      .map((item, ind) => {
        const {
          x,
          y,
          name,
          groupId,
          media,
          style,
          position,
          size,
          hasDark,
          callToAction,
          clickAction,
          overAction,
        } = item;
        const itemOptions = media && { media };
        const group =
          groups.enabled && groupId ? findObject(groups.items, groupId, "id") : undefined;
        const groupInd = group ? groups.items.indexOf(group) : -1;
        const { html: onClickHtml = "", ...onClickObj } = createAction(clickAction, "click") || {};
        const { html: onOverHtml = "", ...onOverObj } = createAction(overAction, "over") || {};
        const onClick = Object.keys(onClickObj).length ? onClickObj : undefined;
        const onRollOver = Object.keys(onOverObj).length ? onOverObj : undefined;
        const actions =
          ((onClick || onRollOver) &&
            ` blm-action='${JSON.stringify({
              onClick,
              onRollOver,
            })}'`) ||
          "";
        const isTooltipClick = isTooltipAction(clickAction);
        const isTootlipOver = isTooltipAction(overAction);

        return `
            <div class="${clsx("hotspot", style, {
              light: !hasDark,
            })}" blm-role="hotspot" blm-order="${
          ind + 1
        }" style="--hotspot_left: ${x}%; --hotspot_top: ${y}%; ${
          group ? `--blm_group_color: ${group.color};` : ""
        } " ${
          groupInd >= 0 ? `blm-group="${groupInd + 1}"` : ""
        } blm-calltoaction="${callToAction.toString()}" blm-position="${position}" blm-size="${size}"${actions}${
          itemOptions ? `blm-editor-options='${JSON.stringify(itemOptions)}'` : ""
        }>
              <div class="mediawrapper">
                <img src="${media?.url || ""}"/>
              </div>
              <div class="hotspotlabel"><span>${name}</span></div> ${
          isTooltipAction(clickAction) || isTooltipAction(overAction)
            ? `<div class="tooltipwrapper">${isTooltipClick ? onClickHtml : ""}${
                isTootlipOver ? onOverHtml : ""
              }</div>`
            : ""
        }${!isTooltipClick ? onClickHtml : ""}${!isTootlipOver ? onOverHtml : ""}    
            </div>`;
      })
      .join("")}
          </div>
      </div>
    `;
  }
}

function setHotspot360HTML(element: HTMLElement, component: MediaHotspot360) {
  if (component) {
    const { items } = component;

    element.innerHTML = items
      .map((item) => {
        const { id, name, groups, prerequisite, media, items, style } = item;
        const options = { prerequisite, imagepage: media?.url };
        const editorOptions = (media || style) && { media, style };

        return `
      <div id='${id}' class="tab360" blm-options='${JSON.stringify(options)}' ${stringifyAttr(
          "blm-editor-options",
          editorOptions
        )}>
        <div class="tabname">${name}</div>        
          ${
            groups.enabled
              ? `<div class="${clsx("hotspotgroupwrapper", groups.style)}">
            ${groups.items
              .map((item, ind) => {
                const { color, name } = item;

                return `
              <div blm-role="hotspotgroup" blm-group-id="${
                ind + 1
              }" blm-group-color="${color}">${name}</div>`;
              })
              .join("")}
          </div>`
              : ""
          }
          ${items
            .map((item, ind) => {
              const {
                x,
                y,
                z,
                name,
                groupId,
                media,
                style,
                hasDark,
                callToAction,
                clickAction,
                overAction,
              } = item;
              const options = { position: { x, y, z } };
              const editorOptions = media && { media };
              const group =
                groups.enabled && groupId ? findObject(groups.items, groupId, "id") : undefined;
              const groupInd = group ? groups.items.indexOf(group) : -1;
              const { html: onClickHtml = "", ...onClickObj } =
                createAction(clickAction, "click") || {};
              const { html: onOverHtml = "", ...onOverObj } =
                createAction(overAction, "over") || {};
              const onClick = Object.keys(onClickObj).length ? onClickObj : undefined;
              const onRollOver = Object.keys(onOverObj).length ? onOverObj : undefined;
              const actions =
                ((onClick || onRollOver) &&
                  ` blm-action='${JSON.stringify({
                    onClick,
                    onRollOver,
                  })}'`) ||
                "";
              const isTooltipClick = isTooltipAction(clickAction);
              const isTootlipOver = isTooltipAction(overAction);

              return `
                  <div class="${clsx("hotspot", style, {
                    light: !hasDark,
                  })}" blm-role="hotspot" blm-order="${ind + 1}" style="${
                group ? `--blm_group_color: ${group.color};` : ""
              } " ${
                groupInd >= 0 ? `blm-group="${groupInd + 1}"` : ""
              } blm-calltoaction="${callToAction.toString()}" ${actions}  blm-options='${JSON.stringify(
                options
              )}' ${stringifyAttr("blm-editor-options", editorOptions)}>
                    <div class="mediawrapper">
                      <img src="${media?.url || ""}"/>
                    </div>
                    <div class="hotspotlabel"><span>${name}</span></div> ${
                isTooltipAction(clickAction) || isTooltipAction(overAction)
                  ? `<div class="tooltipwrapper">${isTooltipClick ? onClickHtml : ""}${
                      isTootlipOver ? onOverHtml : ""
                    }</div>`
                  : ""
              }${!isTooltipClick ? onClickHtml : ""}${!isTootlipOver ? onOverHtml : ""}    
                  </div>`;
            })
            .join("")}
      </div>`;
      })
      .join("");
  }
}
