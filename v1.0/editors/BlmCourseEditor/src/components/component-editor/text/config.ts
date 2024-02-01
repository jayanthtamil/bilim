import { CompositeDecorator, ContentBlock, ContentState } from "draft-js";
import { Options as ImportOptions } from "draft-js-import-html";
import { Options as ExportOptions } from "draft-js-export-html";

import { SimpleObject } from "types";
import {
  INLINE_STYLE_SIZE_PREFIX,
  INLINE_STYLE_COLOR_PREFIX,
  INLINE_STYLE_BG_COLOR_PREFIX,
  INLINE_STYLE_FONT_PREFIX,
  INLINE_STYLE_HIGHLIGHT,
} from "editor-constants";
import BlmLink from "./BlmLink";

const updateInlineStyle = (style: SimpleObject, styleName: string) => {
  if (styleName.startsWith(INLINE_STYLE_FONT_PREFIX)) {
    style.fontFamily = styleName.replace(INLINE_STYLE_FONT_PREFIX, "");
  } else if (styleName.startsWith(INLINE_STYLE_SIZE_PREFIX)) {
    style.fontSize = styleName.replace(INLINE_STYLE_SIZE_PREFIX, "");
  } else if (styleName.startsWith(INLINE_STYLE_COLOR_PREFIX)) {
    style.color = styleName.replace(INLINE_STYLE_COLOR_PREFIX, "");
  } else if (styleName.startsWith(INLINE_STYLE_BG_COLOR_PREFIX)) {
    style.backgroundColor = styleName.replace(INLINE_STYLE_BG_COLOR_PREFIX, "");
  } else if (styleName.startsWith(INLINE_STYLE_HIGHLIGHT)) {
    style.color = "#ffffff";
    style.backgroundColor = "#3398fd";
  }
};

export const blockStyleFn = (block: ContentBlock) => {
  const align = block.getData().get("textAlign");

  if (align) {
    return `text-align-${align}`;
  }

  return "";
};

export const customStyleFn = (style: Immutable.OrderedSet<string>, block: ContentBlock) => {
  return style.reduce((styles: Record<string, any> = {}, styleName?: string) => {
    if (styleName) {
      updateInlineStyle(styles, styleName);
    }

    return styles;
  }, {});
};

function findLinkEntities(
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();

    return entityKey !== null && contentState.getEntity(entityKey).getType() === "LINK";
  }, callback);
}

export const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: BlmLink,
  },
]);

/**
 * As per discussed with client, We should avoid P tag in text component.
 * Bcos P tag may have styles from css. That style not matched with editing content.
 * So we convert all P tag into div tag for generated html after editing.
 */

export const stateConfig: ImportOptions = {
  customInlineFn: (element, { Style, Entity }) => {
    const { tagName } = element;

    if (tagName === "SPAN") {
      const { fontFamily, fontSize, color, backgroundColor } = (element as HTMLSpanElement).style;
      const arr = [];

      if (fontFamily) {
        arr.push(INLINE_STYLE_FONT_PREFIX + fontFamily);
      }
      if (fontSize) {
        arr.push(INLINE_STYLE_SIZE_PREFIX + fontSize);
      }
      if (color) {
        arr.push(INLINE_STYLE_COLOR_PREFIX + color);
      }
      if (backgroundColor) {
        arr.push(INLINE_STYLE_BG_COLOR_PREFIX + backgroundColor);
      }

      if (arr.length) {
        return Style(arr as any);
      }
    } else if (tagName === "A") {
      return Entity("LINK", {
        url: (element as HTMLAnchorElement).href,
      });
    }
  },
  customBlockFn: (element) => {
    const { nodeName, style } = element as HTMLElement;

    if ((nodeName === "DIV" || nodeName === "P" || nodeName === "LI") && style.textAlign) {
      const align = style.textAlign.toLowerCase();

      return {
        data: {
          textAlign: `${align}`,
        },
      };
    }
  },
};

export const htmlConfig: ExportOptions = {
  inlineStyles: {
    BOLD: { element: "b" },
    ITALIC: { element: "i" },
    UNDERLINE: { element: "u" },
  },
  defaultBlockTag: "div",
  //@ts-ignore
  inlineStyleFn: (styles: any) => {
    const style: SimpleObject = {};

    styles.forEach((value: string) => {
      updateInlineStyle(style, value);
    });

    if (Object.keys(style).length) {
      return {
        element: "span",
        style: style,
      };
    }
  },
  blockStyleFn: (block) => {
    const textAlign = block.getData().get("textAlign");

    if (textAlign) {
      return { style: { textAlign } };
    }
  },
  entityStyleFn: (entity) => {
    const type = entity.getType();
    const data = entity.getData();

    if (type === "LINK") {
      return {
        element: "a",
        attributes: {
          href: data.url,
        },
      };
    }
  },
};
